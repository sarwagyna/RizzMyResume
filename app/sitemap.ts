import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/site";

const PUBLIC_PATHS = [
  "",
  "/how-it-works",
  "/help",
  "/support",
  "/contact",
  "/feedback",
  "/privacy",
  "/terms",
  "/refund-policy",
  "/login",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = getAppUrl();
  const lastModified = new Date();

  return PUBLIC_PATHS.map((path) => ({
    url: `${appUrl}${path}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
