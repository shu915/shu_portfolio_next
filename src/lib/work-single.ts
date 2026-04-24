import { fetchCacheOptionsForSingleEntry } from "@/lib/cache-tags";
import {
  isPreviewFetchAllowed,
  type PreviewContinuationOptions,
} from "@/lib/draft-signature";
import { gqlFetch } from "@/lib/graphql";
import { requirePublishedUnlessPreview } from "@/lib/require-published-unless-preview";
import { slugQueryVariants } from "@/lib/slug-query-variants";

/** `work { ... }` 内のフィールド選択（単体・バリアント一括で共用） */
const WORK_SINGLE_FIELDS = `
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

async function fetchWorkByDatabaseId(
  id: string,
  asPreview: boolean
): Promise<WorkSingle | null> {
  const previewArg = asPreview ? ", asPreview: true" : "";
  const query = `query GetWorkByDbId($id: ID!) {
    work(id: $id, idType: DATABASE_ID${previewArg}) {${WORK_SINGLE_FIELDS}
    }
  }`;
  const data = await gqlFetch<{ work: WorkSingle | null }>(query, {
    variables: { id },
    cache: "no-store",
    tags: [],
    forDraftPreview: asPreview,
  });
  return data.work ?? null;
}

function buildWorkBySlugVariantsQuery(
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
    return `  w${i}: work(id: $slug${i}, idType: SLUG${previewArg}) {${WORK_SINGLE_FIELDS}
  }`;
  }).join("\n");
  return `query GetWorkBySlugVariants(${varDefs}) {\n${selections}\n}`;
}

export type WorkSingle = {
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
  services?: {
    nodes: { name: string; slug: string }[];
  } | null;
};

/**
 * スラッグで制作実績（works）を1件取得。
 * - `works`: 一覧・一括 revalidate 用
 * - `works:{candidate}`: 各スラッグ候補ごとの個別 revalidate 用
 */
export async function getWorkBySlug(
  slug: string,
  options?: PreviewContinuationOptions
): Promise<WorkSingle | null> {
  const previewId = options?.previewDatabaseId?.trim() ?? "";
  const allowPreview = isPreviewFetchAllowed("works", options);

  if (allowPreview && /^\d+$/.test(previewId)) {
    const byId = await fetchWorkByDatabaseId(previewId, true);
    if (byId) {
      return requirePublishedUnlessPreview(byId, allowPreview);
    }
  }

  const variants = slugQueryVariants(slug);
  if (variants.length === 0) {
    return null;
  }

  const query = buildWorkBySlugVariantsQuery(variants.length, allowPreview);
  const variables = Object.fromEntries(
    variants.map((s, i) => [`slug${i}`, s])
  ) as Record<string, string>;

  const data = await gqlFetch<Record<string, WorkSingle | null>>(query, {
    variables,
    ...fetchCacheOptionsForSingleEntry(allowPreview, "works", variants),
    forDraftPreview: allowPreview,
  });

  for (let i = 0; i < variants.length; i++) {
    const work = data[`w${i}`];
    if (work) {
      return requirePublishedUnlessPreview(work, allowPreview);
    }
  }
  return null;
}
