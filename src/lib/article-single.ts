import { singleEntryDataCacheTag } from "@/lib/cache-tags";
import { gqlFetch } from "@/lib/graphql";

/** `post { ... }` 内のフィールド選択（単体クエリ・バリアント一括クエリで共用） */
const ARTICLE_SINGLE_POST_FIELDS = `
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
`;

/** デバッグページ等でクエリ本文を共有するため export */
export const GET_POST_BY_SLUG_QUERY = `
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {${ARTICLE_SINGLE_POST_FIELDS}
    }
  }
`;

/**
 * スラッグ候補をエイリアス `p0` … `p{n-1}` でまとめて1リクエストにする。
 * 逐次 `post` を叩くより TTFB・WP 負荷が抑えられる。
 */
function buildPostBySlugVariantsQuery(variantCount: number): string {
  if (variantCount < 1) {
    throw new Error("variantCount must be >= 1");
  }
  const varDefs = Array.from(
    { length: variantCount },
    (_, i) => `$slug${i}: ID!`
  ).join(", ");
  const selections = Array.from({ length: variantCount }, (_, i) => {
    return `  p${i}: post(id: $slug${i}, idType: SLUG) {${ARTICLE_SINGLE_POST_FIELDS}
  }`;
  }).join("\n");
  return `query GetPostBySlugVariants(${varDefs}) {\n${selections}\n}`;
}

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
 * - `posts:{candidate}`: 各スラッグ候補ごとの個別 revalidate 用（Webhook の `postSlug` と一致させる）
 */
export async function getPostBySlug(
  slug: string
): Promise<ArticleSinglePost | null> {
  const variants = slugQueryVariants(slug);
  if (variants.length === 0) {
    return null;
  }

  const query = buildPostBySlugVariantsQuery(variants.length);
  const variables = Object.fromEntries(
    variants.map((s, i) => [`slug${i}`, s])
  ) as Record<string, string>;

  const tags = [
    "posts",
    ...variants.map((v) => singleEntryDataCacheTag("post", v)),
  ];

  const data = await gqlFetch<Record<string, ArticleSinglePost | null>>(
    query,
    { variables, tags }
  );

  for (let i = 0; i < variants.length; i++) {
    const post = data[`p${i}`];
    if (post) {
      return post;
    }
  }
  return null;
}
