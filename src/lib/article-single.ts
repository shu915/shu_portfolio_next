import { singleEntryDataCacheTag } from "@/lib/cache-tags";
import { gqlFetch } from "@/lib/graphql";

/** デバッグページ等でクエリ本文を共有するため export */
export const GET_POST_BY_SLUG_QUERY = `
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      title
      slug
      date
      modified
      content(format: RENDERED)
      excerpt
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
      tags {
        nodes {
          name
          slug
        }
      }
    }
  }
`;

/**
 * URL のスラッグと WP の `post_name` の表記がずれることがある（特に日本語）。
 * @see https://developer.wordpress.org/reference/functions/sanitize_title/
 */
function slugQueryVariants(raw: string): string[] {
  const out: string[] = [];
  const add = (s: string) => {
    if (!s || out.includes(s)) return;
    out.push(s);
  };

  add(raw);

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {
    decoded = raw;
  }
  add(decoded);

  try {
    add(encodeURIComponent(decoded));
  } catch {
    /* noop */
  }

  try {
    const enc = encodeURIComponent(decoded);
    add(enc.replace(/%[0-9A-F]{2}/g, (hex) => hex.toLowerCase()));
  } catch {
    /* noop */
  }

  return out;
}

export type ArticleSinglePost = {
  id: string;
  title: string;
  slug: string;
  date: string;
  modified: string;
  content: string | null;
  excerpt: string | null;
  featuredImage?: {
    node: { sourceUrl: string; altText: string };
  } | null;
  categories?: {
    nodes: { name: string; slug: string }[];
  } | null;
  tags?: {
    nodes: { name: string; slug: string }[];
  } | null;
};

/**
 * スラッグで一般投稿を1件取得。
 * - `posts`: 一覧・一括 revalidate 用
 * - `posts:{candidate}`: 個別 revalidate 用（Webhook の `postSlug` と一致させる）
 */
export async function getPostBySlug(
  slug: string
): Promise<ArticleSinglePost | null> {
  for (const candidate of slugQueryVariants(slug)) {
    const data = await gqlFetch<{ post: ArticleSinglePost | null }>(
      GET_POST_BY_SLUG_QUERY,
      {
        variables: { slug: candidate },
        tags: ["posts", singleEntryDataCacheTag("post", candidate)],
      }
    );
    if (data.post) {
      return data.post;
    }
  }
  return null;
}
