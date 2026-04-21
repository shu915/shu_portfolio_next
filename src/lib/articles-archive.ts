import { cache } from "react";
import { gqlFetch } from "@/lib/graphql";
import type { ArchivePostNode, TaxonomyNode } from "@/lib/articles-types";
import { totalPagesFromOffsetPagination } from "@/lib/wp-offset-pagination";

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

/**
 * タグをスラッグで解決（`where.tag` 文字列は環境によって無視され全件になることがあるため、
 * 投稿側は `tagIn` で term を指定する）
 */
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

/** 公開日が指定年月に収まる投稿（`dateQuery` は WPGraphQL のスキーマに依存） */
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

/** ルートの `[slug]` を WP の SLUG 照合に寄せる */
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

  const totalPages = totalPagesFromOffsetPagination(
    page,
    ARTICLES_PER_PAGE,
    op
  );

  return { category, posts: nodes, totalPages };
});

/**
 * タグ別アーカイブ1ページ分。`tag` が無い（スラッグ不正）ときは null → 404。
 * タグ解決後に `tagIn` で絞る（`where.tag` 文字列より確実）。
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

  const data = await gqlFetch<OffsetPageResult>(GET_POSTS_OFFSET_PAGE_BY_TAG_IN, {
    variables: {
      tagId: t.id,
      size: ARTICLES_PER_PAGE,
      offset,
    },
    tags: ["posts"],
  });

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

  const totalPages = totalPagesFromOffsetPagination(
    page,
    ARTICLES_PER_PAGE,
    op
  );

  return { posts: nodes, totalPages };
}

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

    const data = await gqlFetch<OffsetPageResult>(
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

export function stripExcerptHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export type { ArchivePostNode, ArticlesSidebarBundle, TaxonomyNode } from "@/lib/articles-types";
export { getArticlesSidebarBundle, groupPostDatesByYearMonth } from "@/lib/articles-sidebar";
