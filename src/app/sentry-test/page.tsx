import { notFound } from "next/navigation";
import { SentryTestPanel } from "@/components/sentry/SentryTestPanel";
import { isSentryTestEnabled } from "@/lib/sentry-test";

/** Sentry 動作確認ページ（dev または NEXT_PUBLIC_SENTRY_TEST_ENABLED=true） */
export default function SentryTestPage() {
  if (!isSentryTestEnabled()) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 md:px-6">
      <h1 className="mb-2 font-shippori-mincho text-2xl font-medium text-primary">
        Sentry Test
      </h1>
      <p className="mb-8 text-sm text-body-muted">
        ボタン実行後、Sentry の Issues に数十秒以内に表示されるか確認してください。本番確認後は
        NEXT_PUBLIC_SENTRY_TEST_ENABLED を外してください。
      </p>
      <SentryTestPanel />
    </div>
  );
}
