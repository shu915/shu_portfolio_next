const GRAPHQL_URL = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL;

if (!GRAPHQL_URL) {
  throw new Error(
    "NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL が環境変数に設定されていません"
  );
}

type GraphQLResponse<T> = {
  data: T;
  errors?: { message: string }[];
};

/** 1週間（秒）。webhook が来なかった場合のゾンビキャッシュ掃除用フォールバック */
const DEFAULT_REVALIDATE = 60 * 60 * 24 * 7;

/**
 * WordPress WPGraphQL へのリクエストを行うシンプルな fetch ラッパー
 *
 * @param query      - GraphQL クエリ文字列
 * @param tags       - Next.js のキャッシュタグ（revalidateTag で即時無効化できる）
 * @param revalidate - 最大キャッシュ秒数。webhook が来なくてもこの期間で自動破棄される
 */
export async function gqlFetch<T>(
  query: string,
  {
    tags = [],
    revalidate = DEFAULT_REVALIDATE,
  }: { tags?: string[]; revalidate?: number } = {}
): Promise<T> {
  const res = await fetch(GRAPHQL_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    next: { tags, revalidate },
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
