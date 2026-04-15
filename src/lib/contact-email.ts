import type { ContactFormValues } from "@/lib/validations/contact-form";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Resend 用の件名・本文（通知メール） */
export function buildContactNotificationEmail(data: ContactFormValues): {
  subject: string;
  html: string;
  text: string;
  replyTo: string;
} {
  const company = data["your-company"]?.trim();
  const rows: [string, string][] = [
    ["お名前", data["your-name"]],
    ["メールアドレス", data["your-email"]],
    ["お問い合わせ件名", data["your-subject"]],
    ["お問い合わせ内容", data["your-message"]],
  ];
  if (company) {
    rows.unshift(["会社名・屋号", company]);
  }

  const text = rows.map(([k, v]) => `${k}\n${v}`).join("\n\n");

  const htmlRows = rows
    .map(
      ([k, v]) =>
        `<tr><th style="text-align:left;padding:0.5rem 1rem 0.5rem 0;vertical-align:top;border-bottom:1px solid #eee">${escapeHtml(k)}</th><td style="padding:0.5rem 0;border-bottom:1px solid #eee;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`
    )
    .join("");
  const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"></head><body><table style="border-collapse:collapse;max-width:100%">${htmlRows}</table></body></html>`;

  const subject = `[お問い合わせ] ${data["your-subject"]}`.slice(0, 998);

  return {
    subject,
    html,
    text,
    replyTo: data["your-email"],
  };
}

/** 送信者宛・受付控え（自動返信） */
export function buildContactConfirmationEmail(data: ContactFormValues): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = "[Shu Digital Works] お問い合わせを受け付けました".slice(0, 998);

  const text = `このメールはお問い合わせフォーム送信時に自動でお送りしています。

以下の内容で受け付けました。担当者より順次ご連絡いたします。

件名: ${data["your-subject"]}

---
お問い合わせ内容（抜粋）
${data["your-message"].slice(0, 500)}${data["your-message"].length > 500 ? "…" : ""}

---
※本メールに心当たりがない場合は、破棄していただいて構いません。
`;

  const bodyPreviewRaw = data["your-message"].slice(0, 800);
  const bodyTail = data["your-message"].length > 800 ? "…" : "";
  const msgPreview = `${escapeHtml(bodyPreviewRaw)}${bodyTail}`;
  const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"></head><body style="line-height:1.7;color:#333">
<p>このメールはお問い合わせフォーム送信時に自動でお送りしています。</p>
<p>以下の内容で<strong>受け付けました</strong>。担当者より順次ご連絡いたします。</p>
<p><strong>件名:</strong> ${escapeHtml(data["your-subject"])}</p>
<hr style="border:none;border-top:1px solid #eee;margin:1rem 0" />
<p style="margin:0 0 0.5rem"><strong>お問い合わせ内容（抜粋）</strong></p>
<p style="white-space:pre-wrap;margin:0">${msgPreview}</p>
<hr style="border:none;border-top:1px solid #eee;margin:1rem 0" />
<p style="font-size:0.9em;color:#666">※本メールに心当たりがない場合は、破棄していただいて構いません。</p>
</body></html>`;

  return { subject, html, text };
}
