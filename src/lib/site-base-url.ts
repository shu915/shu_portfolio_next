const LOCAL_DEV_FALLBACK = "http://localhost:3000";

function normalizedUrlFromEnv(): string | undefined {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw || !/^https?:\/\//i.test(raw)) {
    return undefined;
  }
  return raw.replace(/\/$/, "");
}

/**
 * サイトの絶対 URL ベース（末尾スラッシュなし）。
 * metadata / sitemap / robots などで共有する。
 *
 * 開発時: `NEXT_PUBLIC_SITE_URL` が無い・不正なときは localhost にフォールバック。
 * 本番: 同様にフォールバックするが、その場合は **console.warn** で明示（SEO 用 URL の誤設定防止）。
 */
export function siteBaseUrl(): string {
  const url = normalizedUrlFromEnv();
  if (url) {
    return url;
  }
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[site-base-url] NEXT_PUBLIC_SITE_URL is missing or invalid. " +
        `Using ${LOCAL_DEV_FALLBACK} for sitemap, robots, or metadata — set a public https URL in production.`,
    );
  }
  return LOCAL_DEV_FALLBACK;
}
