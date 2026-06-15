import { createClient } from "npm:@supabase/supabase-js@2";
import {
  getCorsHeaders,
  jsonResponse,
  errorResponse,
  getAuthUser,
} from "../_shared/utils.ts";

const REFERRAL_CREDITS = 10;
const CREDITS_PER_RESUME = 50;

function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: getCorsHeaders() });
  }

  const user = await getAuthUser(req);
  if (!user?.id) return errorResponse("Unauthorized", 401);

  const supabase = getServiceClient();
  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "stats";

  if (action === "stats" && req.method === "GET") {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("referral_code, credits, referred_by")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return errorResponse("Profile not found", 404);
    }

    const { count: referralCount } = await supabase
      .from("referrals")
      .select("id", { count: "exact", head: true })
      .eq("referrer_id", user.id);

    const { data: recentReferrals } = await supabase
      .from("referrals")
      .select("id, created_at, referred_id")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const referredIds = (recentReferrals ?? []).map((row) => row.referred_id);
    const referredProfilesById = new Map<
      string,
      { email?: string; full_name?: string }
    >();

    if (referredIds.length > 0) {
      const { data: referredProfiles } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", referredIds);

      for (const profile of referredProfiles ?? []) {
        referredProfilesById.set(profile.id, profile);
      }
    }

    const { data: transactions } = await supabase
      .from("credit_transactions")
      .select("id, amount, balance_after, type, description, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    const appUrl =
      Deno.env.get("APP_URL")?.replace(/\/$/, "") ||
      Deno.env.get("ALLOWED_ORIGIN")?.replace(/\/$/, "") ||
      "https://rizzmyresume.sarwagyna.com";

    return jsonResponse({
      referral_code: profile.referral_code,
      credits: profile.credits ?? 0,
      referral_count: referralCount ?? 0,
      referred_by: profile.referred_by,
      referral_link: `${appUrl}/r/${profile.referral_code}`,
      credits_per_referral: REFERRAL_CREDITS,
      credits_per_resume: CREDITS_PER_RESUME,
      recent_referrals: (recentReferrals ?? []).map((row) => {
        const person = referredProfilesById.get(row.referred_id);
        return {
          id: row.id,
          created_at: row.created_at,
          email: person?.email ?? null,
          full_name: person?.full_name ?? null,
        };
      }),
      transactions: transactions ?? [],
    });
  }

  if (action === "apply" && req.method === "POST") {
    const { referral_code } = await req.json();
    if (!referral_code || typeof referral_code !== "string") {
      return errorResponse("referral_code required");
    }

    const { data, error } = await supabase.rpc("process_referral", {
      p_referred_user_id: user.id,
      p_referral_code: referral_code.trim(),
    });

    if (error) return errorResponse(error.message, 500);

    const result = data as {
      success: boolean;
      error?: string;
      referral_id?: string;
      referrer_credits?: number;
      referred_credits?: number;
    };

    if (!result.success) {
      return errorResponse(result.error || "Referral could not be applied", 400);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    return jsonResponse({
      applied: true,
      credits_earned: result.referred_credits ?? REFERRAL_CREDITS,
      credits: profile?.credits ?? 0,
    });
  }

  return errorResponse("Not found", 404);
});
