import { cache } from "react";
import { gqlFetch } from "@/lib/graphql";

/** 1ページあたり件数（3列グリッドで 12 = 4行そろう） */
export const ARTICLES_PER_PAGE = 12;

/**
 * 一覧の投稿取得（WPGraphQL + wp-graphql-offset-pagination）
 * @see https://github.com/valu-digital/wp-graphql-offset-pagination
 */
/** カテゴリ存在確認 + そのカテゴリの投稿1ページ分を1リクエストで取得 */
const GET_CATEGORY_ARCHIVE_PAGE = `
  query GetCategoryArchivePage(
    $slug: ID!
    $categorySlug: String!
    $size: Int!
    $offset: Int!
  ) {
    category(id: $slug, idType: SLUG) {
      databaseId
      name
      slug
    }
    posts(
      where: {
        categoryName: $categorySlug
        offsetPagination: { size: $size, offset: $offset }
      }
    ) {
      pageInfo {
        offsetPagination {
          hasMore
          hasPrevious
          total
        }
      }
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

const GET_POSTS_OFFSET_PAGE = `
  query GetPostsOffsetPage($size: Int!, $offset: Int!) {
    posts(where: { offsetPagination: { size: $size, offset: $offset } }) {
      pageInfo {
        offsetPagination {
          hasMore
          hasPrevious
          total
        }
      }
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
 * 超えたらチャンクループ復活・WP 側集計・`posts(first: n)` の見直しなどが必要。
 */
const SIDEBAR_POST_DATES_MAX = 100;

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

export type ArticlesSidebarBundle = {
  categories: TaxonomyNode[];
  tags: TaxonomyNode[];
  recentPosts: ArchivePostNode[];
  postDates: string[];
};

type OffsetPageResult = {
  posts: {
    nodes: ArchivePostNode[];
    pageInfo: {
      offsetPagination: {
        hasMore: boolean;
        hasPrevious: boolean;
        total: number | null;
      } | null;
    } | null;
  };
};

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

export type CategoryArchiveMeta = TaxonomyNode & {
  databaseId: number;
};

/**
 * カテゴリ別アーカイブ1ページ分。`category` が無い（スラッグ不正）ときは null → 404。
 * 1 GraphQL リクエスト（category + posts）。
 */
export const getCategoryArchivePage = cache(async function getCategoryArchivePage(
  slug: string,
  page: number
): Promise<{
  category: CategoryArchiveMeta;
  posts: ArchivePostNode[];
  totalPages: number;
} | null> {
  const trimmed = slug.trim();
  if (!trimmed) return null;
  if (!Number.isInteger(page) || page < 1) return null;

  const offset = (page - 1) * ARTICLES_PER_PAGE;

  const data = await gqlFetch<{
    category: {
      databaseId: number;
      name: string;
      slug: string;
    } | null;
    posts: OffsetPageResult["posts"];
  }>(GET_CATEGORY_ARCHIVE_PAGE, {
    variables: {
      slug: trimmed,
      categorySlug: trimmed,
      size: ARTICLES_PER_PAGE,
      offset,
    },
    tags: ["posts"],
  });

  const cat = data.category;
  if (!cat) return null;

  const category: CategoryArchiveMeta = {
    databaseId: cat.databaseId,
    name: cat.name,
    slug: cat.slug,
  };

  const nodes = data.posts?.nodes ?? [];
  const op = data.posts?.pageInfo?.offsetPagination;

  if (page > 1 && nodes.length === 0) {
    return null;
  }

  const rawTotal = op?.total;
  const totalNum =
    typeof rawTotal === "number"
      ? rawTotal
      : typeof rawTotal === "string"
        ? Number.parseInt(rawTotal, 10)
        : NaN;

  let totalPages: number;
  if (Number.isFinite(totalNum) && totalNum >= 0) {
    totalPages = Math.max(1, Math.ceil(totalNum / ARTICLES_PER_PAGE));
  } else {
    const hasMore = op?.hasMore ?? false;
    totalPages = hasMore ? page + 1 : Math.max(1, page);
  }

  return { category, posts: nodes, totalPages };
});

/**
 * 記事一覧の1ページ分（offset は 0 始まり）
 * total を取ると DB で件数計算が走る（プラグイン README の通りやや重い）
 */
export async function getArticlesArchiveOffsetPage(
  page: number
): Promise<{
  posts: ArchivePostNode[];
  totalPages: number;
} | null> {
  if (!Number.isInteger(page) || page < 1) return null;

  const offset = (page - 1) * ARTICLES_PER_PAGE;

  const data = await gqlFetch<OffsetPageResult>(GET_POSTS_OFFSET_PAGE, {
    variables: {
      size: ARTICLES_PER_PAGE,
      offset,
    },
    tags: ["posts"],
  });

  const nodes = data.posts?.nodes ?? [];
  const op = data.posts?.pageInfo?.offsetPagination;

  if (page > 1 && nodes.length === 0) {
    return null;
  }

  const rawTotal = op?.total;
  const totalNum =
    typeof rawTotal === "number"
      ? rawTotal
      : typeof rawTotal === "string"
        ? Number.parseInt(rawTotal, 10)
        : NaN;

  let totalPages: number;
  if (Number.isFinite(totalNum) && totalNum >= 0) {
    totalPages = Math.max(1, Math.ceil(totalNum / ARTICLES_PER_PAGE));
  } else {
    const hasMore = op?.hasMore ?? false;
    totalPages = hasMore ? page + 1 : Math.max(1, page);
  }

  return { posts: nodes, totalPages };
}

/** サイドバー：カテゴリ・タグ・新着3件・月別アーカイブ用の日付一覧（日付は最大 SIDEBAR_POST_DATES_MAX 件） */
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

export function stripExcerptHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

/** 投稿日 ISO から年別・月別件数（`fetchAllPostDatesForSidebar` で取得した日付ベース。件数は SIDEBAR_POST_DATES_MAX 以下想定） */
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
