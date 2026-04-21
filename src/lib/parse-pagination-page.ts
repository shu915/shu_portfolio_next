/**
 * Next.js `searchParams.page`（単一値想定）を 1 以上の整数ページ番号に正規化する。
 */
export function parsePaginationPage(
  raw: string | string[] | undefined
): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = parseInt(v ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}
