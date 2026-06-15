import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const appUrl = getAppUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/login",
        "/generate",
        "/generate/",
        "/dashboard",
        "/auth/",
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
