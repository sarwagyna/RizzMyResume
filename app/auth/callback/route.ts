import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { REFERRAL_COOKIE } from "@/lib/referrals";

export const dynamic = "force-dynamic";

async function applyPendingReferral(
  userId: string,
  referralCode: string | undefined,
  response: NextResponse
) {
  if (!referralCode) return;

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceRoleKey || !supabaseUrl) return;

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);
  await admin.rpc("process_referral", {
    p_referred_user_id: userId,
    p_referral_code: referralCode,
  });

  response.cookies.set(REFERRAL_COOKIE, "", {
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });
}

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(
      new URL("/login?error=Service%20misconfigured", request.url)
    );
  }

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  let next = searchParams.get("next") ?? searchParams.get("redirect") ?? "/generate";

  if (!next.startsWith("/")) {
    next = "/generate";
  }

  const redirectTo = `${origin}${next}`;
  let response = NextResponse.redirect(redirectTo);

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[],
          headers?: Record<string, string>
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.redirect(redirectTo);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
          if (headers) {
            Object.entries(headers).forEach(([key, value]) =>
              response.headers.set(key, value)
            );
          }
        },
      },
    }
  );

  const referralCode = request.cookies.get(REFERRAL_COOKIE)?.value;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user?.id) {
      await applyPendingReferral(data.user.id, referralCode, response);
      return response;
    }
  }

  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "email" | "signup" | "magiclink" | "recovery" | "invite",
    });
    if (!error && data.user?.id) {
      await applyPendingReferral(data.user.id, referralCode, response);
      return response;
    }
  }

  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent("Sign-in link expired or invalid. Request a new link.")}`
  );
}
