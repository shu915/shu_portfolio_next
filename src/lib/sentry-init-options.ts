import type { Options } from "@sentry/core";
import { sentryDsn } from "@/lib/sentry-dsn";

/** 問い合わせ失敗などのエラー監視用。パフォーマンストレース・PII は送らない。 */
export function getSentryInitOptions(): Pick<
  Options,
  "dsn" | "enabled" | "sendDefaultPii" | "tracesSampleRate"
> {
  const dsn = sentryDsn();
  return {
    dsn,
    enabled: Boolean(dsn),
    sendDefaultPii: false,
    tracesSampleRate: 0,
  };
}
