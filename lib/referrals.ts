export const REFERRAL_COOKIE = "rizz_ref";
export const REFERRAL_CREDITS_PER_SIGNUP = 10;
export const CREDITS_PER_FREE_RESUME = 50;

export function normalizeReferralCode(code: string): string {
  return code.trim().toUpperCase();
}

export function setReferralCookie(code: string): void {
  if (typeof document === "undefined") return;
  const normalized = normalizeReferralCode(code);
  if (!normalized) return;
  const maxAge = 60 * 60 * 24 * 30;
  document.cookie = `${REFERRAL_COOKIE}=${encodeURIComponent(normalized)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getReferralCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${REFERRAL_COOKIE}=`));
  if (!match) return null;
  const value = decodeURIComponent(match.split("=").slice(1).join("="));
  return value ? normalizeReferralCode(value) : null;
}

export function clearReferralCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${REFERRAL_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
