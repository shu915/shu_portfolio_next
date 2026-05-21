"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";

/** 開発環境専用: Sentry 送信用のテストボタン群 */
export function SentryTestPanel() {
  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        className="rounded border border-primary px-4 py-2 text-left text-sm hover:bg-secondary"
        onClick={() => {
          throw new Error("Sentry test — client throw");
        }}
      >
        Client throw（未捕捉エラー）
      </button>

      <button
        type="button"
        className="rounded border border-primary px-4 py-2 text-left text-sm hover:bg-secondary"
        onClick={() => {
          Sentry.captureException(new Error("Sentry test — captureException"));
        }}
      >
        captureException（明示送信）
      </button>

      <Link
        href="/sentry-test/server-error"
        className="rounded border border-primary px-4 py-2 text-sm hover:bg-secondary"
      >
        Server render error（ページ遷移）
      </Link>
    </div>
  );
}
