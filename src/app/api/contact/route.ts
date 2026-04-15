import { sendContactNotification } from "@/lib/send-contact-email";
import { contactFormSchema } from "@/lib/validations/contact-form";
import { NextRequest, NextResponse } from "next/server";
import { flattenError } from "zod";

/**
 * コンタクトフォーム用 BFF。Zod 検証後に Resend で通知メール送信。
 * Turnstile は後から追加。
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false as const, message: "リクエストの形式が正しくありません" },
      { status: 400 }
    );
  }

  const parsed = contactFormSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false as const,
        message: "入力内容を確認してください",
        issues: flattenError(parsed.error),
      },
      { status: 422 }
    );
  }

  const sent = await sendContactNotification(parsed.data);
  if (!sent.ok) {
    return NextResponse.json(
      {
        ok: false as const,
        message:
          "送信に失敗しました。時間をおいて再度お試しください。問題が続く場合は別の方法でお問い合わせください。",
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true as const }, { status: 200 });
}
