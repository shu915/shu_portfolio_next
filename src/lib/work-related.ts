import { gqlFetch } from "@/lib/graphql";
import type { WorksArchiveNode } from "@/lib/works-archive";

const RELATED_FIELDS = `
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

/** 除外後に3件取るため多めに取得 */
const RELATED_FETCH_FIRST = 15;

const GET_WORKS_RECENT_FOR_RELATED = `
  query GetWorksRecentForRelated($first: Int!) {
    works(first: $first) {
      nodes {${RELATED_FIELDS}
      }
    }
  }
`;

/**
 * 制作実績シングル用「関連記事」（レガシー `get_posts` 3件・自分以外）。
 * `notIn` のスキーマ差を避け、新着順で多めに取ってからクライアント側で除外する。
 */
export async function getRelatedWorks(
  excludeId: string,
  limit = 3
): Promise<WorksArchiveNode[]> {
  const data = await gqlFetch<{
    works: { nodes: WorksArchiveNode[] };
  }>(GET_WORKS_RECENT_FOR_RELATED, {
    variables: { first: RELATED_FETCH_FIRST },
    tags: ["works"],
  });

  return data.works.nodes
    .filter((n) => n.id !== excludeId)
    .slice(0, limit);
}
