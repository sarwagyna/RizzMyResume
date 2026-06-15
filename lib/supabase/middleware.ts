import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function copyAuthCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
}

/** App Router flight/RSC fetches must not be redirected — that breaks client navigation. */
function isNextDataRequest(request: NextRequest): boolean {
  return (
    request.headers.get("RSC") === "1" ||
    request.headers.get("Next-Router-Prefetch") === "1" ||
    request.headers.has("Next-Router-State-Tree") ||
    request.nextUrl.searchParams.has("_rsc")
  );
}

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Service misconfigured", { status: 503 });
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
        if (headers) {
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const protectedPaths = ["/generate", "/dashboard", "/referrals"];
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected && !user && !isNextDataRequest(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    const redirectResponse = NextResponse.redirect(url);
    copyAuthCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  if (user && pathname === "/login" && !isNextDataRequest(request)) {
    const redirectPath =
      request.nextUrl.searchParams.get("redirect") || "/generate";
    const safePath = redirectPath.startsWith("/") ? redirectPath : "/generate";
    const redirectResponse = NextResponse.redirect(
      new URL(safePath, request.url)
    );
    copyAuthCookies(supabaseResponse, redirectResponse);
    return redirectResponse;
  }

  return supabaseResponse;
}
