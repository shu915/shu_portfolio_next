import { gqlFetch } from "@/lib/graphql";

/** WPGraphQL の first 上限に合わせる（超える件数は一覧に載らない） */
export const ARTICLES_ARCHIVE_MAX = 100;

/** 1ページあたり件数（3列グリッドで 12 = 4行そろう） */
export const ARTICLES_PER_PAGE = 12;

/** 一覧ページ用：投稿 + カテゴリ + タグを1リクエストで取得（キャッシュ共有） */
const GET_ARTICLES_ARCHIVE_PAGE = `
  query GetArticlesArchivePage($first: Int!) {
    posts(first: $first) {
      nodes {
        id
        title
        slug
        date
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
      }
    }
    categories(first: 100) {
      nodes {
        name
        slug
        count
      }
    }
    tags(first: 100) {
      nodes {
        name
        slug
        count
      }
    }
  }
`;

export type ArchivePostNode = {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  featuredImage?: {
    node: { sourceUrl: string; altText: string };
  };
  categories?: {
    nodes: { name: string; slug: string }[];
  };
};

export type TaxonomyNode = {
  name: string;
  slug: string;
  count?: number | null;
};

export type ArticlesArchivePageData = {
  posts: ArchivePostNode[];
  categories: TaxonomyNode[];
  tags: TaxonomyNode[];
};

/**
 * 投稿一覧ページ用データ（同一クエリ・tags: posts でキャッシュ）
 * ページ番号は呼び出し側で slice
 */
export async function getArticlesArchivePageData(): Promise<ArticlesArchivePageData> {
  const data = await gqlFetch<{
    posts: { nodes: ArchivePostNode[] };
    categories: { nodes: TaxonomyNode[] };
    tags: { nodes: TaxonomyNode[] };
  }>(GET_ARTICLES_ARCHIVE_PAGE, {
    variables: { first: ARTICLES_ARCHIVE_MAX },
    tags: ["posts"],
    revalidate: 60 * 60,
  });

  const categories = (data.categories?.nodes ?? []).filter(
    (c) => c.count == null || c.count > 0
  );
  const tags = (data.tags?.nodes ?? []).filter(
    (t) => t.count == null || t.count > 0
  );

  return {
    posts: data.posts.nodes ?? [],
    categories,
    tags,
  };
}

export function stripExcerptHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** 投稿日 ISO から年別・月別件数（取得済み投稿ベース。件数上限あり） */
export function groupPostDatesByYearMonth(
  dates: string[]
): { year: number; months: { month: number; count: number }[] }[] {
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;

  const map = new Map<string, number>();
  for (const iso of dates) {
    const dt = new Date(iso);
    const y = dt.getFullYear();
    const m = dt.getMonth() + 1;
    if (y > cy || (y === cy && m > cm)) continue;
    const key = `${y}-${m}`;
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  const byYear = new Map<number, { month: number; count: number }[]>();
  for (const [key, count] of map) {
    const [ys, ms] = key.split("-");
    const year = parseInt(ys, 10);
    const month = parseInt(ms, 10);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push({ month, count });
  }

  for (const months of byYear.values()) {
    months.sort((a, b) => b.month - a.month);
  }

  return Array.from(byYear.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => ({ year, months }));
}
