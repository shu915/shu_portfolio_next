const DEFAULT_GA_MEASUREMENT_ID = "G-YB2QGESFDV";

/**
 * 本番デプロイでのみ GA4 を有効化。
 * - `next dev`: 無効
 * - Vercel Preview: 無効
 * - Vercel Production など本番 build: 有効
 */
export function isGoogleAnalyticsEnabled(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return false;
  }
  if (process.env.VERCEL_ENV) {
    return process.env.VERCEL_ENV === "production";
  }
  return true;
}

/** GA4 Measurement ID（無効環境または ID 不正時は null） */
export function gaMeasurementId(): string | null {
  if (!isGoogleAnalyticsEnabled()) {
    return null;
  }

  const raw =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ||
    DEFAULT_GA_MEASUREMENT_ID;
  if (!/^G-[A-Z0-9]+$/i.test(raw)) {
    return null;
  }
  return raw;
}
