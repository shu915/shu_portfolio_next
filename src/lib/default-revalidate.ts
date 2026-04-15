/**
 * 秒。`gqlFetch` の `fetch(..., { next: { revalidate } })` の既定値。
 * Webhook で `revalidateTag` されない場合のフォールバックとしても効く。
 */
export const DEFAULT_REVALIDATE = 60 * 60 * 24 * 7;
