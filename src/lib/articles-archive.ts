import { ARTICLES_PER_PAGE } from "@/lib/articles-constants";
import { gqlFetch } from "@/lib/graphql";
import type { ArchivePostNode } from "@/lib/articles-types";
import { totalPagesFromOffsetPagination } from "@/lib/wp-offset-pagination";

/**
 * 記事ルート一覧（`/articles`）の投稿取得（WPGraphQL + wp-graphql-offset-pagination）
 * @see https://github.com/valu-digital/wp-graphql-offset-pagination
 *
 * カテゴリ・タグ・月別・検索はサイドバー導線と一体のため `articles-sidebar` に置く。
 */

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

export function stripExcerptHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export { ARTICLES_PER_PAGE } from "@/lib/articles-constants";
export type { ArchivePostNode, ArticlesSidebarBundle, TaxonomyNode } from "@/lib/articles-types";
export type { CategoryArchiveMeta, TagArchiveMeta } from "@/lib/articles-sidebar";
export {
  articlesSearchQueryFromSearchParams,
  articlesYearMonthArchivePath,
  getArticlesSearchPage,
  getArticlesSidebarBundle,
  getArticlesYearMonthArchivePage,
  getCategoryArchivePage,
  getTagArchivePage,
  groupPostDatesByYearMonth,
  parseYearMonthRouteParams,
} from "@/lib/articles-sidebar";
