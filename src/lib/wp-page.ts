import { cache } from "react";
import { fetchCacheOptionsForSingleEntry } from "@/lib/cache-tags";
import {
  isPreviewFetchAllowed,
  type PreviewContinuationOptions,
} from "@/lib/draft-signature";
import { gqlFetch } from "@/lib/graphql";
import { requirePublishedUnlessPreview } from "@/lib/require-published-unless-preview";
import { slugQueryVariants } from "@/lib/slug-query-variants";

/** 固定ページ（`page`）単体取得で使うフィールド */
const WP_PAGE_FIELDS = `
      id
      title
      slug
      status
      date
      modified
      content(format: RENDERED)
`;

/**
 * サイトの WPGraphQL によっては `PageIdType` に SLUG が無く URI のみのことがある。
 * @see https://wpgraphql.com/docs/posts-and-pages
 */
function pageUriQueryVariants(rawSlug: string): string[] {
  const out: string[] = [];
  const add = (s: string) => {
    const t = s.trim();
    if (!t || out.includes(t)) return;
    out.push(t);
  };

  for (const v of slugQueryVariants(rawSlug)) {
    const base = v.replace(/^\/+|\/+$/g, "");
    if (!base) continue;
    add(base);
    add(`/${base}`);
    add(`/${base}/`);
  }
  return out;
}

/**
 * Draft Mode かつ URL に `preview_id` があるときの取得用。
 * 公開ページの通常取得は `idType: URI` のまま。こちらは下書き・プレビュー解決と、
 * 日本語 URI のエンコード差でパスがずれるのを避けるために DATABASE_ID で取る。
 */
async function fetchPageByDatabaseId(
  id: string,
  asPreview: boolean,
): Promise<WpPage | null> {
  const previewArg = asPreview ? ", asPreview: true" : "";
  const query = `query GetPageByDbId($id: ID!) {
    page(id: $id, idType: DATABASE_ID${previewArg}) {${WP_PAGE_FIELDS}
    }
  }`;
  const data = await gqlFetch<{ page: WpPage | null }>(query, {
    variables: { id },
    cache: "no-store",
    tags: [],
    forDraftPreview: asPreview,
  });
  return data.page ?? null;
}

function buildPageByUriVariantsQuery(
  variantCount: number,
  asPreview: boolean,
): string {
  if (variantCount < 1) {
    throw new Error("variantCount must be >= 1");
  }
  const varDefs = Array.from(
    { length: variantCount },
    (_, i) => `$uri${i}: ID!`,
  ).join(", ");
  const previewArg = asPreview ? ", asPreview: true" : "";
  const selections = Array.from({ length: variantCount }, (_, i) => {
    return `  p${i}: page(id: $uri${i}, idType: URI${previewArg}) {${WP_PAGE_FIELDS}
  }`;
  }).join("\n");
  return `query GetPageByUriVariants(${varDefs}) {\n${selections}\n}`;
}

export type WpPage = {
  id: string;
  title: string;
  slug: string;
  status?: string | null;
  date: string;
  modified: string;
  content: string | null;
};

/**
 * スラッグで固定ページを1件取得（WPGraphQL `page`）。
 * - `pages`: 一括 revalidate 用
 * - `pages:{slug}`: Webhook の `postSlug` と揃える
 *
 * `cache` で `generateMetadata` とページ本体の二重フェッチを避ける。
 */
export const getPageBySlug = cache(async function getPageBySlug(
  slug: string,
  options?: PreviewContinuationOptions,
): Promise<WpPage | null> {
  const previewId = options?.previewDatabaseId?.trim() ?? "";
  const allowPreview = isPreviewFetchAllowed("page", options);

  if (allowPreview && /^\d+$/.test(previewId)) {
    const byId = await fetchPageByDatabaseId(previewId, true);
    if (byId) {
      return requirePublishedUnlessPreview(byId, allowPreview);
    }
  }

  const uriVariants = pageUriQueryVariants(slug);
  if (uriVariants.length === 0) {
    return null;
  }

  const query = buildPageByUriVariantsQuery(uriVariants.length, allowPreview);
  const variables = Object.fromEntries(
    uriVariants.map((u, i) => [`uri${i}`, u]),
  ) as Record<string, string>;

  const data = await gqlFetch<Record<string, WpPage | null>>(query, {
    variables,
    ...fetchCacheOptionsForSingleEntry(allowPreview, "page", uriVariants),
    forDraftPreview: allowPreview,
  });

  for (let i = 0; i < uriVariants.length; i++) {
    const page = data[`p${i}`];
    if (page) {
      return requirePublishedUnlessPreview(page, allowPreview);
    }
  }
  return null;
});
