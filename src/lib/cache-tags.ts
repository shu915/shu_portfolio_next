/**
 * WordPress `post_type` → gqlFetch / revalidateTag 用の一覧・一括向けタグ
 * （`article-single` の個別タグと併用する）
 */
export const DATA_CACHE_TAG_BY_POST_TYPE: Record<string, string> = {
  post: "posts",
  works: "works",
  page: "pages",
};

/**
 * 単一エントリ用。`gqlFetch` の `tags` と Webhook の `revalidateTag` で同じ文字列にすること。
 * 例: `posts:hello-world`, `works:project-a`
 */
export function singleEntryDataCacheTag(postType: string, slug: string): string {
  const broad = DATA_CACHE_TAG_BY_POST_TYPE[postType];
  if (!broad) {
    throw new Error(`Unknown postType for cache tag: ${postType}`);
  }
  return `${broad}:${slug}`;
}

export type WpEntityForCacheTag = keyof typeof DATA_CACHE_TAG_BY_POST_TYPE;

/**
 * プレビュー有効時は Data Cache を使わない（署名付き URL で下書きを返すため）。
 * 通常時は一覧タグ + 各スラッグ候補タグ（Webhook の `revalidateTag` と一致）。
 */
export function fetchCacheOptionsForSingleEntry(
  allowPreview: boolean,
  postType: WpEntityForCacheTag,
  slugCandidatesForTags: string[],
): { cache?: "no-store"; tags: string[] } {
  if (allowPreview) {
    return { cache: "no-store", tags: [] };
  }
  const broad = DATA_CACHE_TAG_BY_POST_TYPE[postType];
  const unique = [...new Set(slugCandidatesForTags.filter(Boolean))];
  const slugTags = unique.map((s) => singleEntryDataCacheTag(postType, s));
  return { tags: [broad, ...slugTags] };
}
