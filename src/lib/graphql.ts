import { DEFAULT_REVALIDATE } from "@/lib/default-revalidate";

const GRAPHQL_URL = process.env.NEXTJS_WORDPRESS_GRAPHQL_URL;
const GRAPHQL_SECRET = process.env.NEXTJS_WORDPRESS_GRAPHQL_SECRET;

if (!GRAPHQL_URL) {
  throw new Error(
    "NEXTJS_WORDPRESS_GRAPHQL_URL が環境変数に設定されていません"
  );
}

/**
 * `forDraftPreview: true` のときだけ `X-GraphQL-Preview: 1` を付与。
 * WP 側はこのヘッダーがあるリクエストに限り下書き解決・編集者借用を行う（シークレットだけでは公開取得と同等に扱う）。
 */
function buildGraphqlHeaders(forDraftPreview: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(GRAPHQL_SECRET ? { "X-GraphQL-Secret": GRAPHQL_SECRET } : {}),
  };
  if (forDraftPreview) {
    headers["X-GraphQL-Preview"] = "1";
  }
  return headers;
}

type GraphQLResponse<T> = {
  data: T;
  errors?: { message: string }[];
};

/** WPGraphQL 用 fetch。一覧用は `posts` / `works`、個別は `cache-tags` の `singleEntryDataCacheTag` と Webhook を揃える。 */
export async function gqlFetch<T>(
  query: string,
  {
    tags = [],
    revalidate = DEFAULT_REVALIDATE,
    variables,
    /** `no-store`: ページ番号ごとに結果が変わるクエリ向け（Next の fetch キャッシュを使わない） */
    cache,
    /**
     * ページの有効な preview exp/sig・または `/api/draft` 内のスラッグ解決だけ true。
     * WP で下書き・非公開の緩和が有効になる。公開ページ・一覧では false のままにすること。
     */
    forDraftPreview = false,
  }: {
    tags?: string[];
    revalidate?: number;
    variables?: Record<string, unknown>;
    cache?: RequestCache;
    forDraftPreview?: boolean;
  } = {}
): Promise<T> {
  const res = await fetch(GRAPHQL_URL!, {
    method: "POST",
    headers: buildGraphqlHeaders(forDraftPreview),
    body: JSON.stringify(variables ? { query, variables } : { query }),
    ...(cache === "no-store"
      ? { cache: "no-store" as const }
      : { next: { tags, revalidate } }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL fetch failed: ${res.status} ${res.statusText}`);
  }

  const json: GraphQLResponse<T> = await res.json();

  if (json.errors?.length) {
    throw new Error(`GraphQL error: ${json.errors[0].message}`);
  }

  return json.data;
}
