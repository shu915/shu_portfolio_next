import { fetchCacheOptionsForSingleEntry } from "@/lib/cache-tags";
import {
  isPreviewFetchAllowed,
  type PreviewContinuationOptions,
} from "@/lib/draft-signature";
import { gqlFetch } from "@/lib/graphql";
import { requirePublishedUnlessPreview } from "@/lib/require-published-unless-preview";
import { slugQueryVariants } from "@/lib/slug-query-variants";

/** `post { ... }` 内のフィールド選択（単体クエリ・バリアント一括クエリで共用） */
const ARTICLE_SINGLE_POST_FIELDS = `
      id
      title
      slug
      status
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
async function fetchPostByDatabaseId(
  id: string,
  asPreview: boolean
): Promise<ArticleSinglePost | null> {
  const previewArg = asPreview ? ", asPreview: true" : "";
  const query = `query GetPostByDbId($id: ID!) {
    post(id: $id, idType: DATABASE_ID${previewArg}) {${ARTICLE_SINGLE_POST_FIELDS}
    }
  }`;
  const data = await gqlFetch<{ post: ArticleSinglePost | null }>(query, {
    variables: { id },
    cache: "no-store",
    tags: [],
    forDraftPreview: asPreview,
  });
  return data.post ?? null;
}

function buildPostBySlugVariantsQuery(
  variantCount: number,
  asPreview: boolean
): string {
  if (variantCount < 1) {
    throw new Error("variantCount must be >= 1");
  }
  const varDefs = Array.from(
    { length: variantCount },
    (_, i) => `$slug${i}: ID!`
  ).join(", ");
  const previewArg = asPreview ? ", asPreview: true" : "";
  const selections = Array.from({ length: variantCount }, (_, i) => {
    return `  p${i}: post(id: $slug${i}, idType: SLUG${previewArg}) {${ARTICLE_SINGLE_POST_FIELDS}
  }`;
  }).join("\n");
  return `query GetPostBySlugVariants(${varDefs}) {\n${selections}\n}`;
}

export type ArticleSinglePost = {
  id: string;
  title: string;
  slug: string;
  status?: string | null;
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
  slug: string,
  options?: PreviewContinuationOptions
): Promise<ArticleSinglePost | null> {
  const previewId = options?.previewDatabaseId?.trim() ?? "";
  const allowPreview = isPreviewFetchAllowed("post", options);

  if (allowPreview && /^\d+$/.test(previewId)) {
    const byId = await fetchPostByDatabaseId(previewId, true);
    if (byId) {
      return requirePublishedUnlessPreview(byId, allowPreview);
    }
  }

  const variants = slugQueryVariants(slug);
  if (variants.length === 0) {
    return null;
  }

  const query = buildPostBySlugVariantsQuery(variants.length, allowPreview);
  const variables = Object.fromEntries(
    variants.map((s, i) => [`slug${i}`, s])
  ) as Record<string, string>;

  const data = await gqlFetch<Record<string, ArticleSinglePost | null>>(
    query,
    {
      variables,
      ...fetchCacheOptionsForSingleEntry(allowPreview, "post", variants),
      forDraftPreview: allowPreview,
    }
  );

  for (let i = 0; i < variants.length; i++) {
    const post = data[`p${i}`];
    if (post) {
      return requirePublishedUnlessPreview(post, allowPreview);
    }
  }
  return null;
}
