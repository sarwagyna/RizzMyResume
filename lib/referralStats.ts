import { invokeFunction } from "@/lib/supabase/client";
import type { ReferralStats } from "@/lib/types";

export async function fetchReferralStats(): Promise<ReferralStats> {
  return invokeFunction<ReferralStats>(
    "referral?action=stats",
    undefined,
    { method: "GET" }
  );
}
