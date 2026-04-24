/**
 * URL のスラッグと WP の `post_name` の表記がずれることがある（特に日本語）。
 * post_name が既にパーセントエンコードされていると、ルート param 経由で二重エンコードになることがある。
 * @see https://developer.wordpress.org/reference/functions/sanitize_title/
 */

/**
 * `%e3%83%89` のように何重にもエンコードされたスラッグを、UTF-8 の実スラッグに近づける
 */
export function normalizeSlugForWpQuery(raw: string): string {
  let out = raw.trim();
  let guard = 0;
  while (guard < 8 && out.includes("%")) {
    const prev = out;
    try {
      out = decodeURIComponent(out.replace(/\+/g, " "));
    } catch {
      break;
    }
    if (out === prev) {
      break;
    }
    guard++;
  }
  return out;
}

export function slugQueryVariants(raw: string): string[] {
  const base = normalizeSlugForWpQuery(raw);
  const out: string[] = [];
  const add = (s: string) => {
    if (!s || out.includes(s)) return;
    out.push(s);
  };

  add(base);

  let decoded = base;
  try {
    decoded = decodeURIComponent(base.replace(/\+/g, " "));
  } catch {
    decoded = base;
  }
  if (decoded !== base) {
    add(decoded);
  }

  try {
    add(encodeURIComponent(base));
  } catch {
    /* noop */
  }

  try {
    const enc = encodeURIComponent(base);
    add(enc.replace(/%[0-9A-F]{2}/g, (hex) => hex.toLowerCase()));
  } catch {
    /* noop */
  }

  return out;
}
