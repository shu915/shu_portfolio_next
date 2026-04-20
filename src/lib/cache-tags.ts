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
