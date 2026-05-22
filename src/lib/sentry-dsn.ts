/** 全ランタイム（client / server / edge）で同じ Sentry プロジェクトを指す DSN */
export function sentryDsn(): string {
  return (
    process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() ||
    process.env.SENTRY_DSN?.trim() ||
    "https://9bdf1fa06bdcc496752e222115f8e5b9@o4511433568419840.ingest.us.sentry.io/4511433586442240"
  );
}
