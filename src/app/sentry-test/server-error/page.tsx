import { notFound } from "next/navigation";
import { isSentryTestEnabled } from "@/lib/sentry-test";

/** ビルド時の静的生成を避け、リクエスト時のみエラーを投げる */
export const dynamic = "force-dynamic";

/** サーバー描画時のエラーを Sentry に送る（テスト用） */
export default function SentryServerErrorPage() {
  if (!isSentryTestEnabled()) {
    notFound();
  }

  throw new Error("Sentry test — server render");
}
