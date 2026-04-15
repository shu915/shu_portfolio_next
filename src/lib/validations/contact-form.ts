import { z } from "zod";

/** 文字数上限（サーバー・メール送信用の目安） */
const MAX = {
  company: 200,
  name: 100,
  email: 254,
  subject: 200,
  message: 5000,
} as const;

/**
 * コンタクトフォーム（CF7 の name 属性と一致）
 */
export const contactFormSchema = z.object({
  "your-company": z
    .string()
    .trim()
    .max(MAX.company, `会社名・屋号は${MAX.company}文字以内で入力してください`)
    .optional(),
  "your-name": z
    .string()
    .trim()
    .min(1, "お名前を入力してください")
    .max(MAX.name, `お名前は${MAX.name}文字以内で入力してください`),
  "your-email": z
    .string()
    .trim()
    .min(1, "メールアドレスを入力してください")
    .max(MAX.email, `メールアドレスは${MAX.email}文字以内で入力してください`)
    .pipe(z.email("メールアドレスの形式が正しくありません")),
  "your-subject": z
    .string()
    .trim()
    .min(1, "お問い合わせ件名を入力してください")
    .max(MAX.subject, `お問い合わせ件名は${MAX.subject}文字以内で入力してください`),
  "your-message": z
    .string()
    .trim()
    .min(1, "お問い合わせ内容を入力してください")
    .max(MAX.message, `お問い合わせ内容は${MAX.message}文字以内で入力してください`),
  "your-privacy": z.boolean().refine((v) => v === true, {
    message: "プライバシーポリシーに同意してください",
  }),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

/** API 送信用（Turnstile トークン付き） */
export const contactFormApiSchema = contactFormSchema.extend({
  turnstileToken: z
    .string()
    .min(1, "Turnstile の確認を完了してください"),
});

export type ContactFormApiValues = z.infer<typeof contactFormApiSchema>;
