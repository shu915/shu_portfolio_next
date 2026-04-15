import { singleEntryDataCacheTag } from "@/lib/cache-tags";
import { gqlFetch } from "@/lib/graphql";
import { slugQueryVariants } from "@/lib/slug-query-variants";

/** `work { ... }` 内のフィールド選択（単体・バリアント一括で共用） */
const WORK_SINGLE_FIELDS = `
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
      services {
        nodes {
          name
          slug
        }
      }
`;

export const GET_WORK_BY_SLUG_QUERY = `
  query GetWorkBySlug($slug: ID!) {
    work(id: $slug, idType: SLUG) {${WORK_SINGLE_FIELDS}
    }
  }
`;

function buildWorkBySlugVariantsQuery(variantCount: number): string {
  if (variantCount < 1) {
    throw new Error("variantCount must be >= 1");
  }
  const varDefs = Array.from(
    { length: variantCount },
    (_, i) => `$slug${i}: ID!`
  ).join(", ");
  const selections = Array.from({ length: variantCount }, (_, i) => {
    return `  w${i}: work(id: $slug${i}, idType: SLUG) {${WORK_SINGLE_FIELDS}
  }`;
  }).join("\n");
  return `query GetWorkBySlugVariants(${varDefs}) {\n${selections}\n}`;
}

export type WorkSingle = {
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
  services?: {
    nodes: { name: string; slug: string }[];
  } | null;
};

/**
 * スラッグで制作実績（works）を1件取得。
 * - `works`: 一覧・一括 revalidate 用
 * - `works:{candidate}`: 各スラッグ候補ごとの個別 revalidate 用
 */
export async function getWorkBySlug(slug: string): Promise<WorkSingle | null> {
  const variants = slugQueryVariants(slug);
  if (variants.length === 0) {
    return null;
  }

  const query = buildWorkBySlugVariantsQuery(variants.length);
  const variables = Object.fromEntries(
    variants.map((s, i) => [`slug${i}`, s])
  ) as Record<string, string>;

  const tags = [
    "works",
    ...variants.map((v) => singleEntryDataCacheTag("works", v)),
  ];

  const data = await gqlFetch<Record<string, WorkSingle | null>>(query, {
    variables,
    tags,
  });

  for (let i = 0; i < variants.length; i++) {
    const work = data[`w${i}`];
    if (work) {
      return work;
    }
  }
  return null;
}
