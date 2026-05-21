import { notFound } from "next/navigation";
import { isSentryTestEnabled } from "@/lib/sentry-test";

/** サーバー描画時のエラーを Sentry に送る（テスト用） */
export default function SentryServerErrorPage() {
  if (!isSentryTestEnabled()) {
    notFound();
  }

  throw new Error("Sentry test — server render");
}
