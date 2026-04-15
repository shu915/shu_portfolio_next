import { sendContactNotification } from "@/lib/send-contact-email";
import { clientIpFromRequest, verifyTurnstileToken } from "@/lib/verify-turnstile";
import { contactFormApiSchema } from "@/lib/validations/contact-form";
import { NextRequest, NextResponse } from "next/server";
import { flattenError } from "zod";

/**
 * コンタクトフォーム用 BFF。Turnstile → Zod → Resend。
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

  const parsed = contactFormApiSchema.safeParse(json);
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

  const { turnstileToken, ...formData } = parsed.data;
  const ip = clientIpFromRequest(req.headers);
  const turnstileOk = await verifyTurnstileToken(turnstileToken, ip);
  if (!turnstileOk) {
    return NextResponse.json(
      {
        ok: false as const,
        message:
          "送信を確認できませんでした。ページを再読み込みして、もう一度お試しください。",
      },
      { status: 403 }
    );
  }

  const sent = await sendContactNotification(formData);
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
