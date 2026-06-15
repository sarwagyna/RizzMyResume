import { COMPANY } from "@/lib/company";

/** Canonical production URL — override with NEXT_PUBLIC_APP_URL in Vercel. */
export const PRODUCTION_APP_URL = "https://rizzmyresume.sarwagyna.com";

export const SITE = {
  name: COMPANY.product,
  title: `${COMPANY.product} — ATS resume builder for students`,
  description:
    "Create a one-page, ATS-optimised resume PDF tailored to your target role. Preview free, pay ₹50 once to download.",
  url: PRODUCTION_APP_URL,
  locale: "en_IN",
  twitterHandle: undefined as string | undefined,
} as const;

export function getAppUrl(): string {
  if (typeof window !== "undefined") {
    const origin = window.location.origin.replace(/\/$/, "");
    if (!isLocalOrigin(origin)) {
      return origin;
    }
  }

  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured && !isLocalOrigin(configured)) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_APP_URL;
  }

  return configured || "http://localhost:3000";
}

function isLocalOrigin(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url);
}
