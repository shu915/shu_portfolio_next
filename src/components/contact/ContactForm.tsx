"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/validations/contact-form";

const Turnstile = dynamic(
  () => import("@marsidev/react-turnstile").then((mod) => mod.Turnstile),
  { ssr: false, loading: () => null }
);

const inputClassName =
  "mt-1 w-full appearance-none rounded-none border border-solid border-primary bg-white px-3 py-2.5 font-shippori text-[0.9375rem] tracking-widest outline-none ring-0 transition-shadow duration-300 ease-in-out focus:border-primary focus:outline-none focus:ring-0 focus:shadow-[0_0_0_2px_rgba(33,30,85,0.2)] aria-invalid:border-accent";

function fieldErrorId(name: keyof ContactFormValues): string {
  return `error-${String(name).replace(/[^a-z0-9-]/gi, "-")}`;
}

/**
 * ContactForm — B案（左アクセントバー＋フォームパネル）
 * しっぽり明朝で日本語テキストを統一
 */
export function ContactForm() {
  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ?? "";

  const [submitSucceeded, setSubmitSucceeded] = useState(false);
  const [submitServerError, setSubmitServerError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileMountKey, setTurnstileMountKey] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      "your-company": "",
      "your-name": "",
      "your-email": "",
      "your-subject": "",
      "your-message": "",
      "your-privacy": false,
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: ContactFormValues) => {
    setSubmitServerError(null);
    setSubmitSucceeded(false);
    if (turnstileSiteKey && !turnstileToken) {
      setSubmitServerError(
        "送信前の確認が完了していません。少し待ってから再度お試しください。"
      );
      return;
    }
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, turnstileToken: turnstileToken ?? "" }),
      });

      const payload: unknown = await res.json().catch(() => null);
      const message =
        payload &&
        typeof payload === "object" &&
        "message" in payload &&
        typeof (payload as { message: unknown }).message === "string"
          ? (payload as { message: string }).message
          : null;

      if (!res.ok) {
        setSubmitServerError(
          message ?? "送信に失敗しました。時間をおいて再度お試しください。"
        );
        return;
      }

      reset();
      setTurnstileToken(null);
      setTurnstileMountKey((k) => k + 1);
      setSubmitSucceeded(true);
    } catch {
      setSubmitServerError(
        "送信に失敗しました。時間をおいて再度お試しください。"
      );
    }
  };

  return (
    /* 左アクセントバー＋フォームパネル */
    <div className="mx-auto mt-16 flex w-full max-w-[720px] items-stretch max-[899px]:mt-10 max-[430px]:mt-6">
      {/* 左アクセントバー */}
      <div className="w-1 shrink-0 bg-primary" />

      {/* パネル本体 */}
      <div className="flex-1 bg-[#EFF2F9] px-10 py-10 max-[899px]:px-6 max-[899px]:py-8 max-[430px]:px-4 max-[430px]:py-6">
        {/* 見出し */}
        <div className="mb-7">
          <h3 className="font-cormorant text-[2.25rem] font-semibold leading-none tracking-[0.08em] text-primary">
            Contact Form
          </h3>
          <p className="mt-2 flex items-center gap-2 font-shippori text-[0.8rem] font-semibold tracking-[0.1em] text-primary/60">
            <span className="inline-block h-px w-5 bg-primary opacity-40" />
            お問い合わせ内容はこちらにご記入ください
          </p>
        </div>

        <form
          className="flex flex-col gap-5 border-0 outline-none"
          onSubmit={handleSubmit(onSubmit)}
          onChange={(e) => {
            if (!e.nativeEvent.isTrusted) return;
            setSubmitSucceeded((prev) => (prev ? false : prev));
          }}
          noValidate
        >
          {/* 会社名 */}
          <div className="flex flex-col font-shippori font-bold">
            <label htmlFor="your-company" className="text-[0.8125rem] tracking-widest text-primary">
              会社名・屋号
            </label>
            <input
              id="your-company"
              autoComplete="organization"
              className={inputClassName}
              placeholder="例）〇〇株式会社"
              {...register("your-company")}
            />
          </div>

          {/* お名前 */}
          <div className="flex flex-col font-shippori font-bold">
            <label htmlFor="your-name" className="text-[0.8125rem] tracking-widest text-primary">
              お名前
              <span className="relative -top-0.5 ml-1.5 bg-accent px-1 py-0.5 text-[0.75rem] font-bold text-white">
                必須
              </span>
            </label>
            <input
              id="your-name"
              autoComplete="name"
              className={inputClassName}
              placeholder="例）山田 太郎"
              aria-required="true"
              aria-invalid={errors["your-name"] ? true : undefined}
              aria-describedby={errors["your-name"] ? fieldErrorId("your-name") : undefined}
              {...register("your-name")}
            />
            {errors["your-name"] && (
              <p id={fieldErrorId("your-name")} className="mt-1 font-shippori text-sm font-semibold text-accent" role="alert">
                {errors["your-name"].message}
              </p>
            )}
          </div>

          {/* メールアドレス */}
          <div className="flex flex-col font-shippori font-bold">
            <label htmlFor="your-email" className="text-[0.8125rem] tracking-widest text-primary">
              メールアドレス
              <span className="relative -top-0.5 ml-1.5 bg-accent px-1 py-0.5 text-[0.75rem] font-bold text-white">
                必須
              </span>
            </label>
            <input
              id="your-email"
              autoComplete="email"
              inputMode="email"
              className={inputClassName}
              placeholder="例）info@example.com"
              aria-required="true"
              aria-invalid={errors["your-email"] ? true : undefined}
              aria-describedby={errors["your-email"] ? fieldErrorId("your-email") : undefined}
              {...register("your-email")}
            />
            {errors["your-email"] && (
              <p id={fieldErrorId("your-email")} className="mt-1 font-shippori text-sm font-semibold text-accent" role="alert">
                {errors["your-email"].message}
              </p>
            )}
          </div>

          {/* 件名 */}
          <div className="flex flex-col font-shippori font-bold">
            <label htmlFor="your-subject" className="text-[0.8125rem] tracking-widest text-primary">
              お問い合わせ件名
              <span className="relative -top-0.5 ml-1.5 bg-accent px-1 py-0.5 text-[0.75rem] font-bold text-white">
                必須
              </span>
            </label>
            <input
              id="your-subject"
              className={inputClassName}
              placeholder="例）〇〇について"
              aria-required="true"
              aria-invalid={errors["your-subject"] ? true : undefined}
              aria-describedby={errors["your-subject"] ? fieldErrorId("your-subject") : undefined}
              {...register("your-subject")}
            />
            {errors["your-subject"] && (
              <p id={fieldErrorId("your-subject")} className="mt-1 font-shippori text-sm font-semibold text-accent" role="alert">
                {errors["your-subject"].message}
              </p>
            )}
          </div>

          {/* お問い合わせ内容 */}
          <div className="flex flex-col font-shippori font-bold">
            <label htmlFor="your-message" className="text-[0.8125rem] tracking-widest text-primary">
              お問い合わせ内容
              <span className="relative -top-0.5 ml-1.5 bg-accent px-1 py-0.5 text-[0.75rem] font-bold text-white">
                必須
              </span>
            </label>
            <textarea
              id="your-message"
              className={`${inputClassName} h-40 resize-none`}
              placeholder="具体的な内容をご記入ください"
              aria-required="true"
              aria-invalid={errors["your-message"] ? true : undefined}
              aria-describedby={errors["your-message"] ? fieldErrorId("your-message") : undefined}
              {...register("your-message")}
            />
            {errors["your-message"] && (
              <p id={fieldErrorId("your-message")} className="mt-1 font-shippori text-sm font-semibold text-accent" role="alert">
                {errors["your-message"].message}
              </p>
            )}
          </div>

          {/* プライバシー */}
          <div className="relative mt-2 flex items-center justify-center max-[359px]:text-[0.8rem]">
            <label
              htmlFor="js-your-privacy-checkbox"
              className="relative flex cursor-pointer flex-wrap items-center justify-center gap-1.5 text-center font-shippori"
            >
              <input
                id="js-your-privacy-checkbox"
                type="checkbox"
                className="peer sr-only focus:outline-none focus:ring-0"
                aria-required="true"
                aria-invalid={errors["your-privacy"] ? true : undefined}
                aria-describedby={errors["your-privacy"] ? fieldErrorId("your-privacy") : undefined}
                {...register("your-privacy")}
              />
              <span
                aria-hidden
                className="inline-flex h-5 w-5 shrink-0 items-center justify-center border border-solid border-primary bg-white peer-checked:[&>svg]:opacity-100"
              >
                <svg viewBox="0 0 12 10" className="pointer-events-none h-3 w-3 text-primary opacity-0" aria-hidden>
                  <path d="M1 5l3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <Link
                href="/privacy"
                className="rounded-sm text-primary underline decoration-1 decoration-primary underline-offset-2 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                onClick={(e) => e.stopPropagation()}
              >
                プライバシーポリシー
              </Link>
              に同意する
            </label>
          </div>
          {errors["your-privacy"] && (
            <p id={fieldErrorId("your-privacy")} className="mt-1 text-center font-shippori text-sm font-semibold text-accent" role="alert">
              {errors["your-privacy"].message}
            </p>
          )}

          {/* Turnstile ＋送信（幅 300px で揃える／狭すぎる max を戻す） */}
          <div className="mx-auto mt-4 flex w-full max-w-[300px] flex-col items-stretch gap-3">
            {turnstileSiteKey ? (
              <div className="flex min-h-[65px] flex-col items-center justify-center" aria-label="Turnstile">
                <Turnstile
                  key={turnstileMountKey}
                  siteKey={turnstileSiteKey}
                  onSuccess={(token) => { setTurnstileToken(token); setSubmitServerError(null); }}
                  onExpire={() => { setTurnstileToken(null); }}
                  onError={() => {
                    setTurnstileToken(null);
                    setSubmitServerError("送信前の確認に失敗しました。ページを再読み込みしてお試しください。");
                  }}
                />
              </div>
            ) : process.env.NODE_ENV === "development" ? (
              <p className="text-center font-shippori text-xs text-accent">
                開発用: .env.local に NEXT_PUBLIC_TURNSTILE_SITE_KEY を設定してください
              </p>
            ) : null}

            {/* 送信ボタン */}
            <button
              type="submit"
              className="w-full cursor-pointer appearance-none rounded-none border-2 border-solid border-primary bg-primary py-4 font-shippori font-bold leading-none tracking-[0.2em] text-white outline-none ring-0 transition-[background,color] duration-300 ease-in-out hover:bg-white hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting || (Boolean(turnstileSiteKey) && !turnstileToken)}
            >
              {isSubmitting ? "送信中…" : "送信する"}
            </button>
          </div>

          {/* フィードバック */}
          <div className="text-center" aria-live="polite">
            {submitServerError && (
              <span className="font-shippori font-semibold text-accent" role="alert">
                {submitServerError}
              </span>
            )}
            {submitSucceeded && !submitServerError && (
              <span className="font-shippori font-semibold text-primary">
                送信が完了しました。ありがとうございました。
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}