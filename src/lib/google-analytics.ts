const DEFAULT_GA_MEASUREMENT_ID = "G-YB2QGESFDV";

/** GA4 Measurement ID（環境変数未設定時は DEFAULT を使用） */
export function gaMeasurementId(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ||
    DEFAULT_GA_MEASUREMENT_ID;
  if (!/^G-[A-Z0-9]+$/i.test(raw)) {
    return null;
  }
  return raw;
}
