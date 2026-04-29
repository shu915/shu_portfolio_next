import type { MetadataRoute } from "next";
import { siteBaseUrl } from "@/lib/site-base-url";

/** `/robots.txt`（`MetadataRoute`） */
export default function robots(): MetadataRoute.Robots {
  const base = siteBaseUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
