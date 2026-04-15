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

/** `services` タクソノミー（レガシー archive のジャンルタブ用） */
const GET_WORKS_SERVICE_TERMS = `
  query GetWorksServiceTerms {
    services(first: 100) {
      nodes {
        name
        slug
      }
    }
  }
`;

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
 * ジャンル（services）で絞り込み。WPGraphQL の `taxQuery` / `SERVICES` はサイトのスキーマに依存。
 */
const GET_WORKS_OFFSET_PAGE_BY_SERVICE = `
  query GetWorksOffsetPageByService($size: Int!, $offset: Int!, $serviceSlug: [String]!) {
    works(where: {
      offsetPagination: { size: $size, offset: $offset }
      taxQuery: {
        taxArray: [
          {
            taxonomy: SERVICES
            field: SLUG
            terms: $serviceSlug
            operator: IN
          }
        ]
      }
    }) {
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

export async function getWorksServiceTerms(): Promise<
  { name: string; slug: string }[]
> {
  const data = await gqlFetch<{
    services: { nodes: { name: string; slug: string }[] };
  }>(GET_WORKS_SERVICE_TERMS, { tags: ["works"] });
  return data.services?.nodes ?? [];
}

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

  const query =
    serviceSlug && serviceSlug.length > 0
      ? GET_WORKS_OFFSET_PAGE_BY_SERVICE
      : GET_WORKS_OFFSET_PAGE;

  const variables =
    serviceSlug && serviceSlug.length > 0
      ? {
          size: WORKS_PER_PAGE,
          offset,
          serviceSlug: [serviceSlug],
        }
      : {
          size: WORKS_PER_PAGE,
          offset,
        };

  const data = await gqlFetch<OffsetPageResult>(query, {
    variables,
    tags: ["works"],
  });

  const nodes = data.works?.nodes ?? [];
  const op = data.works?.pageInfo?.offsetPagination;

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
