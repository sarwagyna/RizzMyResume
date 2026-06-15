import { getAppUrl } from "@/lib/site";

export function getAuthCallbackUrl(redirectPath = "/generate"): string {
  const next = redirectPath.startsWith("/") ? redirectPath : "/generate";
  return `${getAppUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}
