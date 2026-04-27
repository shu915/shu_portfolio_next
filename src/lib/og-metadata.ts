import type { Metadata } from "next";

/** ルート layout のデフォルト。サムネイルがないページはこの画像を継承する */
export const DEFAULT_OG_IMAGE_PATH = "/images/ogp.png";

const DEFAULT_OG_ALT_FALLBACK = "Shu Digital Works";

type FeaturedOgInput = {
  sourceUrl: string | null | undefined;
  /** WordPress のメディア alt */
  mediaAltText?: string | null;
  /** メディア alt が空のとき（記事・実績のタイトル） */
  pageTitle: string;
};

/**
 * アイキャッチ URL があるときだけ Open Graph / Twitter 用の画像を付与する。
 * ないときは空（親 metadata のデフォルト画像が使われる）。
 * alt は `mediaAltText` → `pageTitle` → 固定フォールバックの順で決定する。
 */
export function ogFromFeaturedImage(
  input: FeaturedOgInput
): Pick<Metadata, "openGraph" | "twitter"> {
  const url = input.sourceUrl?.trim();
  if (!url) {
    return {};
  }
  const imageAlt =
    input.mediaAltText?.trim() ||
    input.pageTitle.trim() ||
    DEFAULT_OG_ALT_FALLBACK;
  return {
    openGraph: {
      images: [{ url, alt: imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      images: [{ url, alt: imageAlt }],
    },
  };
}
