import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shared/AppShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { getAppUrl, SITE } from "@/lib/site";
import {
  organizationJsonLd,
  SITE_KEYWORDS,
  websiteJsonLd,
} from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

const appUrl = getAppUrl();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: SITE.title,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [...SITE_KEYWORDS],
  applicationName: SITE.name,
  authors: [{ name: "Sarwagyna Private Limited", url: "https://sarwagyna.com" }],
  creator: "Sarwagyna Private Limited",
  publisher: "Sarwagyna Private Limited",
  category: "technology",
  icons: { icon: "/favicon.svg", apple: "/logo.svg" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: appUrl,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: appUrl,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-IN">
      <body className={`${inter.variable} ${manrope.variable} flex min-h-screen flex-col antialiased`}>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
