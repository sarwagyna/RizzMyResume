export function getAuthCallbackUrl(redirectPath = "/generate"): string {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    (typeof window !== "undefined" ? window.location.origin : "");

  const next = redirectPath.startsWith("/") ? redirectPath : "/generate";
  return `${appUrl}/auth/callback?next=${encodeURIComponent(next)}`;
}
