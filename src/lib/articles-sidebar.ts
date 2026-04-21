import { cache } from "react";
import { ARTICLES_PER_PAGE } from "@/lib/articles-constants";
import { gqlFetch } from "@/lib/graphql";
import type {
  ArchivePostNode,
  ArticlesSidebarBundle,
  TaxonomyNode,
} from "@/lib/articles-types";
import { totalPagesFromOffsetPagination } from "@/lib/wp-offset-pagination";

/* -------------------------------------------------------------------------- */
/* 共通：posts + offsetPagination（タクソノミー・月別・検索の一覧クエリ） */

type ArchivePostsOffsetResult = {
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

/* -------------------------------------------------------------------------- */
/* サイドバー用データ（カテゴリ・タグ・新着・月集計用日付） */

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

/* -------------------------------------------------------------------------- */
/* カテゴリ・タグアーカイブ（サイドバー導線と同じタクソノミー） */

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

const GET_TAG_BY_SLUG = `
  query GetTagBySlug($slug: ID!) {
    tag(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
    }
  }
`;

const GET_POSTS_OFFSET_PAGE_BY_TAG_IN = `
  query GetPostsOffsetPageByTagIn(
    $tagId: ID!
    $size: Int!
    $offset: Int!
  ) {
    posts(
      where: {
        tagIn: [$tagId]
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

function normalizeTaxonomySlugParam(raw: string): string {
  const t = raw.trim();
  if (!t) return t;
  try {
    return decodeURIComponent(t.replace(/\+/g, " "));
  } catch {
    return t;
  }
}

type TagNodeForArchive = {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
};

const fetchTagForArchive = cache(async function fetchTagForArchive(
  slug: string
): Promise<TagNodeForArchive | null> {
  const normalized = normalizeTaxonomySlugParam(slug);
  if (!normalized) return null;

  const data = await gqlFetch<{
    tag: TagNodeForArchive | null;
  }>(GET_TAG_BY_SLUG, {
    variables: { slug: normalized },
    tags: ["posts"],
  });

  return data.tag ?? null;
});

export type CategoryArchiveMeta = TaxonomyNode & {
  databaseId: number;
};

export type TagArchiveMeta = TaxonomyNode & {
  databaseId: number;
};

/**
 * カテゴリ別アーカイブ1ページ分。`category` が無い（スラッグ不正）ときは null → 404。
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
    posts: ArchivePostsOffsetResult["posts"];
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

  const totalPages = totalPagesFromOffsetPagination(
    page,
    ARTICLES_PER_PAGE,
    op
  );

  return { category, posts: nodes, totalPages };
});

/**
 * タグ別アーカイブ1ページ分。`tag` が無い（スラッグ不正）ときは null → 404。
 */
export const getTagArchivePage = cache(async function getTagArchivePage(
  slug: string,
  page: number
): Promise<{
  tag: TagArchiveMeta;
  posts: ArchivePostNode[];
  totalPages: number;
} | null> {
  if (!slug.trim()) return null;
  if (!Number.isInteger(page) || page < 1) return null;

  const t = await fetchTagForArchive(slug);
  if (!t) return null;

  const offset = (page - 1) * ARTICLES_PER_PAGE;

  const data = await gqlFetch<ArchivePostsOffsetResult>(
    GET_POSTS_OFFSET_PAGE_BY_TAG_IN,
    {
      variables: {
        tagId: t.id,
        size: ARTICLES_PER_PAGE,
        offset,
      },
      tags: ["posts"],
    }
  );

  const tag: TagArchiveMeta = {
    databaseId: t.databaseId,
    name: t.name,
    slug: t.slug,
  };

  const nodes = data.posts?.nodes ?? [];
  const op = data.posts?.pageInfo?.offsetPagination;

  if (page > 1 && nodes.length === 0) {
    return null;
  }

  const totalPages = totalPagesFromOffsetPagination(
    page,
    ARTICLES_PER_PAGE,
    op
  );

  return { tag, posts: nodes, totalPages };
});

/* -------------------------------------------------------------------------- */
/* 月別アーカイブ（サイドバー月リンクの先） */

const GET_POSTS_OFFSET_PAGE_BY_YEAR_MONTH = `
  query GetPostsOffsetPageByYearMonth(
    $size: Int!
    $offset: Int!
    $afterYear: Int!
    $afterMonth: Int!
    $afterDay: Int!
    $beforeYear: Int!
    $beforeMonth: Int!
    $beforeDay: Int!
  ) {
    posts(
      where: {
        dateQuery: {
          after: {
            year: $afterYear
            month: $afterMonth
            day: $afterDay
          }
          before: {
            year: $beforeYear
            month: $beforeMonth
            day: $beforeDay
          }
          inclusive: true
        }
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

/** URL セグメント `year` / `month` を数値化（不正なら null） */
export function parseYearMonthRouteParams(
  yearStr: string,
  monthStr: string
): { year: number; month: number } | null {
  if (!/^\d{4}$/.test(yearStr) || !/^\d{1,2}$/.test(monthStr)) return null;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  if (year < 1970 || year > 2100 || month < 1 || month > 12) return null;
  return { year, month };
}

/** `/articles/archive/:year/:month`（月は 2 桁）。`archive` で `articles/[slug]` と衝突しないようにする */
export function articlesYearMonthArchivePath(year: number, month: number): string {
  return `/articles/archive/${year}/${String(month).padStart(2, "0")}`;
}

/** 月別一覧 1 ページ分（`dateQuery` は WPGraphQL スキーマ依存） */
export const getArticlesYearMonthArchivePage = cache(
  async function getArticlesYearMonthArchivePage(
    year: number,
    month: number,
    page: number
  ): Promise<{
    year: number;
    month: number;
    posts: ArchivePostNode[];
    totalPages: number;
  } | null> {
    if (
      !Number.isInteger(year) ||
      !Number.isInteger(month) ||
      month < 1 ||
      month > 12
    ) {
      return null;
    }
    if (!Number.isInteger(page) || page < 1) return null;

    const offset = (page - 1) * ARTICLES_PER_PAGE;

    const data = await gqlFetch<ArchivePostsOffsetResult>(
      GET_POSTS_OFFSET_PAGE_BY_YEAR_MONTH,
      {
        variables: {
          size: ARTICLES_PER_PAGE,
          offset,
          afterYear: year,
          afterMonth: month,
          afterDay: 1,
          beforeYear: year,
          beforeMonth: month,
          beforeDay: new Date(year, month, 0).getDate(),
        },
        tags: ["posts"],
      }
    );

    const nodes = data.posts?.nodes ?? [];
    const op = data.posts?.pageInfo?.offsetPagination;

    if (page > 1 && nodes.length === 0) {
      return null;
    }

    const totalPages = totalPagesFromOffsetPagination(
      page,
      ARTICLES_PER_PAGE,
      op
    );

    return { year, month, posts: nodes, totalPages };
  }
);

/* -------------------------------------------------------------------------- */
/* キーワード検索（サイドバー検索フォームの先） */

const GET_POSTS_OFFSET_PAGE_BY_SEARCH = `
  query GetPostsOffsetPageBySearch($search: String!, $size: Int!, $offset: Int!) {
    posts(
      where: {
        search: $search
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

const ARTICLES_SEARCH_QUERY_MAX = 200;

function normalizeArticlesSearchQuery(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  return t.length > ARTICLES_SEARCH_QUERY_MAX
    ? t.slice(0, ARTICLES_SEARCH_QUERY_MAX)
    : t;
}

/** `searchParams.s` を検索クエリに正規化（空・上限トリム） */
export function articlesSearchQueryFromSearchParams(
  raw: string | string[] | undefined
): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v == null || typeof v !== "string") return "";
  return normalizeArticlesSearchQuery(v);
}

/**
 * キーワード検索の1ページ分。`search` が空のときはフェッチせず 0 件扱い。
 */
export const getArticlesSearchPage = cache(async function getArticlesSearchPage(
  search: string,
  page: number
): Promise<{
  query: string;
  posts: ArchivePostNode[];
  totalPages: number;
  totalCount: number;
} | null> {
  const query = normalizeArticlesSearchQuery(search);
  if (!query) {
    return { query: "", posts: [], totalPages: 0, totalCount: 0 };
  }
  if (!Number.isInteger(page) || page < 1) {
    return null;
  }

  const offset = (page - 1) * ARTICLES_PER_PAGE;

  const data = await gqlFetch<ArchivePostsOffsetResult>(
    GET_POSTS_OFFSET_PAGE_BY_SEARCH,
    {
      variables: {
        search: query,
        size: ARTICLES_PER_PAGE,
        offset,
      },
      tags: ["posts"],
    }
  );

  const nodes = data.posts?.nodes ?? [];
  const op = data.posts?.pageInfo?.offsetPagination;
  const totalCount = op?.total ?? 0;

  if (page > 1 && nodes.length === 0) {
    return null;
  }

  const totalPages = totalPagesFromOffsetPagination(
    page,
    ARTICLES_PER_PAGE,
    op
  );

  return { query, posts: nodes, totalPages, totalCount };
});
