import type { Metadata } from "next";
import { COMPANY } from "@/lib/company";
import { getAppUrl, SITE } from "@/lib/site";

export const SITE_KEYWORDS = [
  "ATS resume",
  "ATS resume builder",
  "resume builder India",
  "AI resume generator",
  "student resume",
  "fresher resume",
  "one page resume PDF",
  "job description resume",
  "resume for college students",
  "Rizz My Resume",
  "Sarwagyna",
] as const;

export function pageUrl(path: string): string {
  const base = getAppUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function createPageMetadata(options: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
  ogType?: "website" | "article";
}): Metadata {
  const url = pageUrl(options.path);
  const keywords = options.keywords ?? [...SITE_KEYWORDS];

  return {
    title: options.title,
    description: options.description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      type: options.ogType ?? "website",
      locale: SITE.locale,
      url,
      siteName: SITE.name,
      title: options.title,
      description: options.description,
    },
    twitter: {
      card: "summary_large_image",
      title: options.title,
      description: options.description,
    },
    robots: options.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export const NOINDEX_METADATA = createPageMetadata({
  title: "Account",
  description: "Sign in or manage your Rizz My Resume account.",
  path: "/account",
  noIndex: true,
});

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY.name,
    legalName: COMPANY.name,
    url: pageUrl("/"),
    logo: pageUrl("/logo.svg"),
    email: COMPANY.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ongole",
      addressRegion: "Andhra Pradesh",
      addressCountry: "IN",
    },
    sameAs: [COMPANY.website],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: pageUrl("/"),
    description: SITE.description,
    publisher: {
      "@type": "Organization",
      name: COMPANY.name,
    },
  };
}

export function webApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE.name,
    url: pageUrl("/"),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "50",
      priceCurrency: "INR",
      description: "One-time payment to download ATS-optimised resume PDF",
    },
    description: SITE.description,
    provider: {
      "@type": "Organization",
      name: COMPANY.name,
    },
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function howToJsonLd(steps: { name: string; text: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to create an ATS resume with Rizz My Resume",
    description: SITE.description,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: pageUrl(item.path),
    })),
  };
}
