import { cache } from "react";
import { singleEntryDataCacheTag } from "@/lib/cache-tags";
import { gqlFetch } from "@/lib/graphql";
import { slugQueryVariants } from "@/lib/slug-query-variants";

/** 固定ページ（`page`）単体取得で使うフィールド */
const WP_PAGE_FIELDS = `
      id
      title
      slug
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

function buildPageByUriVariantsQuery(variantCount: number): string {
  if (variantCount < 1) {
    throw new Error("variantCount must be >= 1");
  }
  const varDefs = Array.from(
    { length: variantCount },
    (_, i) => `$uri${i}: ID!`,
  ).join(", ");
  const selections = Array.from({ length: variantCount }, (_, i) => {
    return `  p${i}: page(id: $uri${i}, idType: URI) {${WP_PAGE_FIELDS}
  }`;
  }).join("\n");
  return `query GetPageByUriVariants(${varDefs}) {\n${selections}\n}`;
}

export type WpPage = {
  id: string;
  title: string;
  slug: string;
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
): Promise<WpPage | null> {
  const uriVariants = pageUriQueryVariants(slug);
  if (uriVariants.length === 0) {
    return null;
  }

  const slugTags = slugQueryVariants(slug);

  const query = buildPageByUriVariantsQuery(uriVariants.length);
  const variables = Object.fromEntries(
    uriVariants.map((u, i) => [`uri${i}`, u]),
  ) as Record<string, string>;

  const tags = [
    "pages",
    ...slugTags.map((v) => singleEntryDataCacheTag("page", v)),
  ];

  const data = await gqlFetch<Record<string, WpPage | null>>(query, {
    variables,
    tags,
  });

  for (let i = 0; i < uriVariants.length; i++) {
    const page = data[`p${i}`];
    if (page) {
      return page;
    }
  }
  return null;
});
