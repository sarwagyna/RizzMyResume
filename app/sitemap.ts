import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/site";

const PUBLIC_PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/how-it-works", priority: 0.9, changeFrequency: "monthly" },
  { path: "/help", priority: 0.85, changeFrequency: "monthly" },
  { path: "/support", priority: 0.8, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.75, changeFrequency: "monthly" },
  { path: "/feedback", priority: 0.6, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.5, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.5, changeFrequency: "yearly" },
  { path: "/refund-policy", priority: 0.5, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = getAppUrl();
  const lastModified = new Date();

  return PUBLIC_PAGES.map(({ path, priority, changeFrequency }) => ({
    url: `${appUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
