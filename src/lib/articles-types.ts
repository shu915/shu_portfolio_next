/** 記事一覧・サイドバーで共通利用する WPGraphQL 投稿ノード形 */
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

/**
 * WPGraphQL `posts` + wp-graphql-offset-pagination の 1 レスポンス形
 *（ルート一覧・タクソノミー・月別・検索などで共通）
 */
export type ArticlesPostsOffsetQueryResult = {
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
