import { contactFormSchema } from "@/lib/validations/contact-form";
import { NextRequest, NextResponse } from "next/server";
import { flattenError } from "zod";

/**
 * コンタクトフォーム用 BFF。
 * 現状は検証のみ通して 200。後から Resend / Turnstile をここに足す。
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

  void parsed.data;

  return NextResponse.json({ ok: true as const }, { status: 200 });
}
