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

/** Marketing landing page identity (SEO, JSON-LD). */
export const siteConfig = {
  name: "RizzMyResume",
  legalName: COMPANY.name,
  tagline: "ATS-ready resumes for Indian students in 2 minutes",
  description:
    "RizzMyResume turns your raw info into a professional, ATS-optimised resume PDF in under 2 minutes — tailored to any job description. Built for Indian college students. Just ₹50.",
  shortDescription:
    "RizzMyResume is an AI resume builder for Indian college students that generates an ATS-optimised, single-page resume PDF tailored to a job description in under 2 minutes for ₹50.",
  locale: "en_IN",
  price: "50",
  currency: "INR",
  keywords: [
    "resume builder India",
    "ATS resume",
    "AI resume generator",
    "college placement resume",
    "fresher resume builder",
    "resume maker for students",
    "ATS friendly resume",
    "RizzMyResume",
  ],
} as const;

export function getAppUrl(): string {
  if (typeof window !== "undefined") {
    const origin = window.location.origin.replace(/\/$/, "");
    if (!isLocalOrigin(origin)) {
      return origin;
    }
  }

  const configured = normalizeAppRoot(
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")
  );
  if (configured && !isLocalOrigin(configured)) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_APP_URL;
  }

  return configured || "http://localhost:3000";
}

/** Strip accidental paths like /login from APP_URL env values. */
function normalizeAppRoot(url: string | undefined): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return url.replace(/\/+$/, "").replace(/\/login$/i, "");
  }
}

function isLocalOrigin(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url);
}
