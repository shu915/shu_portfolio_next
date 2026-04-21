import { gqlFetch } from "@/lib/graphql";

/** 1ページあたり件数（記事一覧と揃える） */
export const WORKS_PER_PAGE = 12;

const WORK_ARCHIVE_NODE_FIELDS = `
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
        services {
          nodes {
            name
            slug
          }
        }
`;

/** Works ジャンルタブ（WP の `services` スラッグと一致させる。GraphQL でターム一覧は取らない） */
export const WORKS_SERVICE_TAB_TERMS: { name: string; slug: string }[] = [
  { name: "ランディングページ", slug: "landing" },
  { name: "WordPress", slug: "wordpress" },
  { name: "システム開発", slug: "system" },
];

const GET_WORKS_OFFSET_PAGE = `
  query GetWorksOffsetPage($size: Int!, $offset: Int!) {
    works(where: { offsetPagination: { size: $size, offset: $offset } }) {
      pageInfo {
        offsetPagination {
          hasMore
          hasPrevious
          total
        }
      }
      nodes {${WORK_ARCHIVE_NODE_FIELDS}
      }
    }
  }
`;

/**
 * ジャンル（services）で絞り込み。
 * ルート `works(where:)` に `taxQuery` が無い環境があるため `services` ターム → `works` 接続を使う。
 * ネスト接続では `offsetPagination` が効かないことが多いので、
 * `first: page * perPage + 1` で多めに取り、表示は slice。+1 で「次ページあり」を件数からも判定する。
 */
const GET_WORKS_BY_SERVICE_PREFIX = `
  query GetWorksByServicePrefix($slugs: [String]!, $first: Int!) {
    services(where: { slug: $slugs }, first: 1) {
      nodes {
        works(first: $first) {
          pageInfo {
            hasNextPage
            hasPreviousPage
          }
          nodes {${WORK_ARCHIVE_NODE_FIELDS}
          }
        }
      }
    }
  }
`;

export type WorksArchiveNode = {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  featuredImage?: {
    node: { sourceUrl: string; altText: string };
  };
  services?: {
    nodes: { name: string; slug: string }[];
  };
};

type OffsetPageResult = {
  works: {
    nodes: WorksArchiveNode[];
    pageInfo: {
      offsetPagination: {
        hasMore: boolean;
        hasPrevious: boolean;
        total: number | null;
      } | null;
    } | null;
  };
};

type ServiceFilteredWorksResult = {
  services: {
    nodes: Array<{
      works: {
        nodes: WorksArchiveNode[];
        pageInfo: {
          hasNextPage: boolean;
          hasPreviousPage?: boolean;
        } | null;
      } | null;
    } | null>;
  } | null;
};

export async function getWorksArchiveOffsetPage(
  page: number,
  options?: { serviceSlug?: string }
): Promise<{
  works: WorksArchiveNode[];
  totalPages: number;
} | null> {
  if (!Number.isInteger(page) || page < 1) return null;

  const offset = (page - 1) * WORKS_PER_PAGE;
  const serviceSlug = options?.serviceSlug?.trim();

  if (serviceSlug && serviceSlug.length > 0) {
    const fetchFirst = page * WORKS_PER_PAGE + 1;
    const data = await gqlFetch<ServiceFilteredWorksResult>(
      GET_WORKS_BY_SERVICE_PREFIX,
      {
        variables: { slugs: [serviceSlug], first: fetchFirst },
        tags: ["works"],
      }
    );

    const conn = data.services?.nodes?.[0]?.works;
    const prefixNodes = conn?.nodes ?? [];
    const hasNextFromApi = conn?.pageInfo?.hasNextPage ?? false;
    /** ネスト接続で hasNextPage が常に false になりがちなため、取得件数でも次ページを推定する */
    const hasMore =
      prefixNodes.length > page * WORKS_PER_PAGE || hasNextFromApi;
    const nodes = prefixNodes.slice(
      (page - 1) * WORKS_PER_PAGE,
      page * WORKS_PER_PAGE
    );

    if (page > 1 && nodes.length === 0) {
      return null;
    }

    const totalPages = hasMore
      ? Math.max(page + 1, Math.ceil(prefixNodes.length / WORKS_PER_PAGE))
      : Math.max(1, Math.ceil(prefixNodes.length / WORKS_PER_PAGE));

    return { works: nodes, totalPages };
  }

  const data = await gqlFetch<OffsetPageResult>(GET_WORKS_OFFSET_PAGE, {
    variables: {
      size: WORKS_PER_PAGE,
      offset,
    },
    tags: ["works"],
  });

  const nodes = data.works?.nodes ?? [];
  const op = data.works?.pageInfo?.offsetPagination ?? null;

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
    totalPages = Math.max(1, Math.ceil(totalNum / WORKS_PER_PAGE));
  } else {
    const hasMore = op?.hasMore ?? false;
    totalPages = hasMore ? page + 1 : Math.max(1, page);
  }

  return { works: nodes, totalPages };
}
