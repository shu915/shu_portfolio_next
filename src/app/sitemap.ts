import type { MetadataRoute } from "next";
import { buildSitemap } from "@/lib/sitemap-data";

/** WP 更新に合わせたい場合は Webhook 側 `revalidateTag("posts")` 等で間接的に。ここは再検証の目安（7 日）。 */
export const revalidate = 7 * 24 * 60 * 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildSitemap();
}
