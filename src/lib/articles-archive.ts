import { cache } from "react";
import { gqlFetch } from "@/lib/graphql";
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
      databaseId
      name
      slug
    }
  }
`;

const GET_POSTS_OFFSET_PAGE_BY_TAG_IN = `
  query GetPostsOffsetPageByTagIn(
    $tagId: Int!
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

/** WP が count を返さない場合のみ残す。0 件は `hideEmpty` 側で除外済み想定 */
function filterNonEmptyTaxonomies(nodes: TaxonomyNode[]): TaxonomyNode[] {
  return nodes.filter((n) => n.count == null || n.count > 0);
}

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
      tagId: t.databaseId,
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
