import type { MetadataRoute } from "next";
import { buildSitemap } from "@/lib/sitemap-data";

/** 再生成間隔は `sitemap.ts` では `revalidate` を付けない（Next 16 で segment 設定として無効扱いになるため）。`gqlFetch` の `tags` / Webhook で更新する。 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap();
}
