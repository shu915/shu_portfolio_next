import { gqlFetch } from "@/lib/graphql";
import type {
  ArchivePostNode,
  ArticlesSidebarBundle,
  TaxonomyNode,
} from "@/lib/articles-types";

/** 月別アーカイブ集計用：日付だけを offset で全件取得（チャンク単位） */
const GET_POST_DATES_OFFSET_CHUNK = `
  query GetPostDatesOffsetChunk($size: Int!, $offset: Int!) {
    posts(where: { offsetPagination: { size: $size, offset: $offset } }) {
      pageInfo {
        offsetPagination {
          hasMore
        }
      }
      nodes {
        date
      }
    }
  }
`;

/** サイドバー：タクソノミー + 新着（月別用日付は別途全件フェッチ） */
const GET_ARTICLES_SIDEBAR_BUNDLE = `
  query GetArticlesSidebarBundle {
    categories(first: 100, where: { hideEmpty: true }) {
      nodes {
        name
        slug
        count
      }
    }
    tags(first: 100, where: { hideEmpty: true }) {
      nodes {
        name
        slug
        count
      }
    }
    recentForSidebar: posts(first: 3) {
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
  }
`;

/**
 * 月別アーカイブ集計に使う投稿日の取得上限（1 GraphQL リクエスト）。
 * 全投稿がこの件数以下なら全件分の日付が取れる。
 */
const SIDEBAR_POST_DATES_MAX = 100;

type PostDatesChunkResult = {
  posts: {
    nodes: { date: string }[];
    pageInfo: {
      offsetPagination: { hasMore: boolean } | null;
    } | null;
  };
};

async function fetchAllPostDatesForSidebar(): Promise<string[]> {
  const data = await gqlFetch<PostDatesChunkResult>(GET_POST_DATES_OFFSET_CHUNK, {
    variables: {
      size: SIDEBAR_POST_DATES_MAX,
      offset: 0,
    },
    tags: ["posts"],
  });

  const nodes = data.posts?.nodes ?? [];
  return nodes.map((n) => n.date);
}

function filterNonEmptyTaxonomies(nodes: TaxonomyNode[]): TaxonomyNode[] {
  return nodes.filter((n) => n.count == null || n.count > 0);
}

/** サイドバー：カテゴリ・タグ・新着3件・月別アーカイブ用の日付一覧 */
export async function getArticlesSidebarBundle(): Promise<ArticlesSidebarBundle> {
  const [data, postDates] = await Promise.all([
    gqlFetch<{
      categories: { nodes: TaxonomyNode[] };
      tags: { nodes: TaxonomyNode[] };
      recentForSidebar: { nodes: ArchivePostNode[] };
    }>(GET_ARTICLES_SIDEBAR_BUNDLE, {
      tags: ["posts"],
    }),
    fetchAllPostDatesForSidebar(),
  ]);

  const categories = filterNonEmptyTaxonomies(data.categories?.nodes ?? []);
  const tags = filterNonEmptyTaxonomies(data.tags?.nodes ?? []);
  const recentPosts = data.recentForSidebar?.nodes ?? [];

  return { categories, tags, recentPosts, postDates };
}

/** 投稿日 ISO から年別・月別件数（件数は SIDEBAR_POST_DATES_MAX 以下想定） */
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
