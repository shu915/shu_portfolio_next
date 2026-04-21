import { DEFAULT_REVALIDATE } from "@/lib/default-revalidate";

const GRAPHQL_URL = process.env.NEXTJS_WORDPRESS_GRAPHQL_URL;
const GRAPHQL_SECRET = process.env.NEXTJS_WORDPRESS_GRAPHQL_SECRET;

if (!GRAPHQL_URL) {
  throw new Error(
    "NEXTJS_WORDPRESS_GRAPHQL_URL が環境変数に設定されていません"
  );
}

/** 環境変数はプロセス起動時に固定のため、ヘッダーもモジュール読み込み時に一度だけ組み立てる */
const GRAPHQL_REQUEST_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  ...(GRAPHQL_SECRET ? { "X-GraphQL-Secret": GRAPHQL_SECRET } : {}),
};

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
  }: {
    tags?: string[];
    revalidate?: number;
    variables?: Record<string, unknown>;
    cache?: RequestCache;
  } = {}
): Promise<T> {
  const res = await fetch(GRAPHQL_URL!, {
    method: "POST",
    headers: GRAPHQL_REQUEST_HEADERS,
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

export type GraphQLRawFetchResult = {
  httpOk: boolean;
  httpStatus: number;
  /** パース済み JSON（GraphQL の `data` / `errors` を含む） */
  body: unknown;
};

/**
 * 開発用: レスポンス全体を返す（errors があっても throw しない）。キャッシュしない。
 */
export async function gqlFetchRaw(
  query: string,
  variables?: Record<string, unknown>
): Promise<GraphQLRawFetchResult> {
  if (!GRAPHQL_URL) {
    return {
      httpOk: false,
      httpStatus: 0,
      body: { message: "NEXTJS_WORDPRESS_GRAPHQL_URL が未設定" },
    };
  }

  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: GRAPHQL_REQUEST_HEADERS,
    body: JSON.stringify(variables ? { query, variables } : { query }),
    cache: "no-store",
  });

  const text = await res.text();
  let body: unknown;
  try {
    body = JSON.parse(text) as unknown;
  } catch {
    body = { _parseError: "JSON でないレスポンス", _rawText: text.slice(0, 8000) };
  }

  return { httpOk: res.ok, httpStatus: res.status, body };
}
