/** `/sentry-test` を表示するか（dev は常に可、本番は env で一時的に ON） */
export function isSentryTestEnabled(): boolean {
  if (process.env.NODE_ENV === "development") {
    return true;
  }
  return process.env.NEXT_PUBLIC_SENTRY_TEST_ENABLED?.trim() === "true";
}
