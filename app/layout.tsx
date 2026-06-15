import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TopNav } from "@/components/shared/TopNav";
import { Footer } from "@/components/shared/Footer";
import { getAppUrl, SITE } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const appUrl = getAppUrl();

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: SITE.title,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  icons: { icon: "/favicon.svg", apple: "/logo.svg" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: appUrl,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    images: [{ url: "/logo.svg", width: 512, height: 512, alt: SITE.name }],
  },
  twitter: {
    card: "summary",
    title: SITE.title,
    description: SITE.description,
    images: ["/logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
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
    <html lang="en">
      <body className={`${inter.variable} flex min-h-screen flex-col`}>
        <TopNav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
