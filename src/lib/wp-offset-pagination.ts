/**
 * wp-graphql-offset-pagination の `pageInfo.offsetPagination` 向けユーティリティ
 * @see https://github.com/valu-digital/wp-graphql-offset-pagination
 */

export type WpGraphqlOffsetPagination = {
  hasMore: boolean;
  hasPrevious?: boolean;
  /** スキーマは number | null だが、実行時に string が返ることがある */
  total?: number | string | null;
};

/**
 * 現在ページ番号（1 始まり）と 1 ページあたり件数から総ページ数を推定する。
 * `total` が取れるときは件数ベース。無い・不正なときは `hasMore` と現在ページで推定。
 */
export function totalPagesFromOffsetPagination(
  page: number,
  perPage: number,
  op: WpGraphqlOffsetPagination | null | undefined
): number {
  const rawTotal = op?.total;
  const totalNum =
    typeof rawTotal === "number"
      ? rawTotal
      : typeof rawTotal === "string"
        ? Number.parseInt(rawTotal, 10)
        : NaN;

  if (Number.isFinite(totalNum) && totalNum >= 0) {
    return Math.max(1, Math.ceil(totalNum / perPage));
  }

  const hasMore = op?.hasMore ?? false;
  return hasMore ? page + 1 : Math.max(1, page);
}

/** 一覧の総件数（`total` が無い・不正なときは 0） */
export function offsetPaginationTotalCount(
  op: WpGraphqlOffsetPagination | null | undefined
): number {
  const rawTotal = op?.total;
  const totalNum =
    typeof rawTotal === "number"
      ? rawTotal
      : typeof rawTotal === "string"
        ? Number.parseInt(rawTotal, 10)
        : NaN;
  if (Number.isFinite(totalNum) && totalNum >= 0) {
    return totalNum;
  }
  return 0;
}
