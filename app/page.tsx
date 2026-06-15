import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { getAppUrl, siteConfig } from "@/lib/site";

const title = `${siteConfig.name} — ${siteConfig.tagline}`;

export const metadata: Metadata = {
  title,
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: getAppUrl(),
    siteName: siteConfig.name,
    title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: siteConfig.description,
  },
};

export default function HomePage() {
  return <LandingPage />;
}
