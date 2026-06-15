import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { REFERRAL_COOKIE } from "@/lib/referrals";

interface ReferralRedirectPageProps {
  params: Promise<{ code: string }>;
}

export default async function ReferralRedirectPage({
  params,
}: ReferralRedirectPageProps) {
  const { code } = await params;
  const normalized = code.trim().toUpperCase();

  if (normalized) {
    const cookieStore = await cookies();
    cookieStore.set(REFERRAL_COOKIE, normalized, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }

  redirect(`/login?ref=${encodeURIComponent(normalized)}`);
}
