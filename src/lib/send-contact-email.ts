import { Resend } from "resend";
import {
  buildContactConfirmationEmail,
  buildContactNotificationEmail,
} from "@/lib/contact-email";
import type { ContactFormValues } from "@/lib/validations/contact-form";

let resend: Resend | null = null;

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY が設定されていません");
  }
  if (!resend) {
    resend = new Resend(key);
  }
  return resend;
}

/** 送信先・From。未設定なら null（ルートで 503 にする） */
export function getContactEmailEnv(): { from: string; to: string[] } | null {
  const from = process.env.RESEND_FROM?.trim();
  const raw = process.env.RESEND_TO?.trim();
  if (!from || !raw) {
    return null;
  }
  const to = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (!to.length) {
    return null;
  }
  return { from, to };
}

/**
 * 問い合わせ: 管理者へ通知 → 送信者へ控えメール（自動返信）。
 * 管理者送信に失敗したときだけ { ok: false }。控えのみ失敗したときはログのみで成功扱い。
 */
export async function sendContactNotification(
  data: ContactFormValues
): Promise<{ ok: true } | { ok: false }> {
  const env = getContactEmailEnv();
  if (!env || !process.env.RESEND_API_KEY) {
    console.error(
      "[contact-email] RESEND_API_KEY / RESEND_FROM / RESEND_TO のいずれかが未設定です"
    );
    return { ok: false };
  }

  const { subject, html, text, replyTo } = buildContactNotificationEmail(data);

  try {
    const { error } = await getResend().emails.send({
      from: env.from,
      to: env.to,
      replyTo,
      subject,
      html,
      text,
    });
    if (error) {
      console.error("[resend] admin notification", error);
      return { ok: false };
    }
  } catch (e) {
    console.error("[resend] admin notification", e);
    return { ok: false };
  }

  const confirm = buildContactConfirmationEmail(data);
  const replyToAdmin = env.to[0];
  try {
    const { error } = await getResend().emails.send({
      from: env.from,
      to: [data["your-email"]],
      replyTo: replyToAdmin,
      subject: confirm.subject,
      html: confirm.html,
      text: confirm.text,
    });
    if (error) {
      console.error("[resend] submitter confirmation (admin mail was sent)", error);
    }
  } catch (e) {
    console.error("[resend] submitter confirmation (admin mail was sent)", e);
  }

  return { ok: true };
}
