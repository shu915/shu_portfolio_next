/**
 * Draft Mode 以外では `publish` のエントリだけ通す（WP / キャッシュの取りこぼし対策）。
 * `status` は WPGraphQL のステータス文字列（例: publish, draft）。
 */
export function requirePublishedUnlessPreview<
  T extends { status?: string | null },
>(entry: T | null, allowPreview: boolean): T | null {
  if (!entry) {
    return null;
  }
  if (allowPreview) {
    return entry;
  }
  const raw = entry.status;
  if (raw == null || raw === "") {
    return entry;
  }
  return raw.toLowerCase() === "publish" ? entry : null;
}
