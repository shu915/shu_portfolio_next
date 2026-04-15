/**
 * URL のスラッグと WP の `post_name` の表記がずれることがある（特に日本語）。
 * @see https://developer.wordpress.org/reference/functions/sanitize_title/
 */
export function slugQueryVariants(raw: string): string[] {
  const out: string[] = [];
  const add = (s: string) => {
    if (!s || out.includes(s)) return;
    out.push(s);
  };

  add(raw);

  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {
    decoded = raw;
  }
  add(decoded);

  try {
    add(encodeURIComponent(decoded));
  } catch {
    /* noop */
  }

  try {
    const enc = encodeURIComponent(decoded);
    add(enc.replace(/%[0-9A-F]{2}/g, (hex) => hex.toLowerCase()));
  } catch {
    /* noop */
  }

  return out;
}
