/**
 * ISO 日付文字列を `YYYY.MM.DD` 形式（和ロケール）で表示する。
 * 記事・Works の一覧カード・詳細・サイドバーで共通利用。
 */
export function formatDateJa(dateStr: string): string {
  return new Date(dateStr)
    .toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, ".");
}
