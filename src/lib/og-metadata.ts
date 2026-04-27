import type { Metadata } from "next";

/** ルート layout のデフォルト。サムネイルがないページはこの画像を継承する */
export const DEFAULT_OG_IMAGE_PATH = "/images/ogp.png";

/**
 * アイキャッチ URL があるときだけ Open Graph / Twitter 用の画像を付与する。
 * ないときは空（親 metadata のデフォルト画像が使われる）。
 */
export function ogFromFeaturedImage(
  sourceUrl: string | null | undefined,
  imageAlt: string
): Pick<Metadata, "openGraph" | "twitter"> {
  const url = sourceUrl?.trim();
  if (!url) {
    return {};
  }
  return {
    openGraph: {
      images: [{ url, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      images: [url],
    },
  };
}
