"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/validations/contact-form";

const inputClassName =
  "mt-1 w-full appearance-none rounded-none border border-solid border-primary bg-white px-2 py-2 text-[0.9375rem] tracking-widest outline-none ring-0 transition-shadow duration-300 ease-in-out focus:border-primary focus:outline-none focus:ring-0 focus:shadow-[0_0_0_2px_rgba(33,30,85,0.2)] aria-invalid:border-accent";

function fieldErrorId(name: keyof ContactFormValues): string {
  return `error-${String(name).replace(/[^a-z0-9-]/gi, "-")}`;
}

/**
 * レガシー CF7 レイアウト相当。バリデーションは React Hook Form + Zod。
 */
export function ContactForm() {
  const [submitSucceeded, setSubmitSucceeded] = useState(false);
  const [submitServerError, setSubmitServerError] = useState<string | null>(
    null
  );

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
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      setSubmitSucceeded(true);
    } catch {
      setSubmitServerError(
        "送信に失敗しました。時間をおいて再度お試しください。"
      );
    }
  };

  return (
    <div className="mx-auto mt-20 w-200 max-w-full rounded-[1.25rem] border border-solid border-[#e0e0e0] bg-[#fafafa] px-30 py-16 max-[899px]:mt-12 max-[899px]:px-8 max-[899px]:py-12 max-[430px]:mt-8 max-[430px]:px-4 max-[430px]:py-8">
      <h3 className="text-center font-(family-name:--font-cormorant) text-[2rem] font-bold tracking-[0.05em] max-md:text-2xl">
        Contact Form
      </h3>
      <p className="mt-2 text-center font-bold tracking-widest [&>br]:hidden max-[599px]:[&>br]:block">
        お問い合わせ内容は
        <br />
        こちらにご記入下さい
      </p>

      <form
        className="mt-15 max-md:mt-8 border-0 outline-none"
        onSubmit={handleSubmit(onSubmit)}
        onChange={(e) => {
          if (!e.nativeEvent.isTrusted) return;
          setSubmitSucceeded((prev) => (prev ? false : prev));
        }}
        noValidate
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col font-bold">
            <label htmlFor="your-company" className="tracking-widest">
              会社名・屋号
            </label>
            <input
              id="your-company"
              autoComplete="organization"
              className={inputClassName}
              placeholder="例)〇〇株式会社"
              {...register("your-company")}
            />
          </div>

          <div className="flex flex-col font-bold">
            <label htmlFor="your-name" className="tracking-widest">
              お名前
              <span className="relative -top-0.5 ml-1 rounded bg-accent px-1 py-0.5 text-[0.8rem] text-white">
                必須
              </span>
            </label>
            <input
              id="your-name"
              autoComplete="name"
              className={inputClassName}
              placeholder="例)山田 太郎"
              aria-required="true"
              aria-invalid={errors["your-name"] ? true : undefined}
              aria-describedby={
                errors["your-name"] ? fieldErrorId("your-name") : undefined
              }
              {...register("your-name")}
            />
            {errors["your-name"] && (
              <p
                id={fieldErrorId("your-name")}
                className="mt-1 text-sm font-semibold text-accent"
                role="alert"
              >
                {errors["your-name"].message}
              </p>
            )}
          </div>

          <div className="flex flex-col font-bold">
            <label htmlFor="your-email" className="tracking-widest">
              メールアドレス
              <span className="relative -top-0.5 ml-1 rounded bg-accent px-1 py-0.5 text-[0.8rem] text-white">
                必須
              </span>
            </label>
            <input
              id="your-email"
              autoComplete="email"
              inputMode="email"
              className={inputClassName}
              placeholder="例)info@example.com"
              aria-required="true"
              aria-invalid={errors["your-email"] ? true : undefined}
              aria-describedby={
                errors["your-email"] ? fieldErrorId("your-email") : undefined
              }
              {...register("your-email")}
            />
            {errors["your-email"] && (
              <p
                id={fieldErrorId("your-email")}
                className="mt-1 text-sm font-semibold text-accent"
                role="alert"
              >
                {errors["your-email"].message}
              </p>
            )}
          </div>

          <div className="flex flex-col font-bold">
            <label htmlFor="your-subject" className="tracking-widest">
              お問い合わせ件名
              <span className="relative -top-0.5 ml-1 rounded bg-accent px-1 py-0.5 text-[0.8rem] text-white">
                必須
              </span>
            </label>
            <input
              id="your-subject"
              className={inputClassName}
              placeholder="例)〇〇について"
              aria-required="true"
              aria-invalid={errors["your-subject"] ? true : undefined}
              aria-describedby={
                errors["your-subject"] ? fieldErrorId("your-subject") : undefined
              }
              {...register("your-subject")}
            />
            {errors["your-subject"] && (
              <p
                id={fieldErrorId("your-subject")}
                className="mt-1 text-sm font-semibold text-accent"
                role="alert"
              >
                {errors["your-subject"].message}
              </p>
            )}
          </div>

          <div className="flex flex-col font-bold">
            <label htmlFor="your-message" className="tracking-widest">
              お問い合わせ内容
              <span className="relative -top-0.5 ml-1 rounded bg-accent px-1 py-0.5 text-[0.8rem] text-white">
                必須
              </span>
            </label>
            <textarea
              id="your-message"
              className={`${inputClassName} h-40 resize-none`}
              placeholder="具体的な内容をご記入下さい"
              aria-required="true"
              aria-invalid={errors["your-message"] ? true : undefined}
              aria-describedby={
                errors["your-message"] ? fieldErrorId("your-message") : undefined
              }
              {...register("your-message")}
            />
            {errors["your-message"] && (
              <p
                id={fieldErrorId("your-message")}
                className="mt-1 text-sm font-semibold text-accent"
                role="alert"
              >
                {errors["your-message"].message}
              </p>
            )}
          </div>
        </div>

        <div className="relative mt-8 flex items-center justify-center max-[359px]:text-[0.8rem]">
          <label
            htmlFor="js-your-privacy-checkbox"
            className="relative flex cursor-pointer flex-wrap items-center justify-center gap-1 text-center"
          >
            <input
              id="js-your-privacy-checkbox"
              type="checkbox"
              className="peer sr-only focus:outline-none focus:ring-0"
              aria-required="true"
              aria-invalid={errors["your-privacy"] ? true : undefined}
              aria-describedby={
                errors["your-privacy"] ? fieldErrorId("your-privacy") : undefined
              }
              {...register("your-privacy")}
            />
            <span
              aria-hidden
              className="inline-flex h-5 w-5 shrink-0 items-center justify-center border border-solid border-primary bg-white peer-checked:[&>svg]:opacity-100"
            >
              <svg
                viewBox="0 0 12 10"
                className="pointer-events-none h-3 w-3 text-primary opacity-0"
                aria-hidden
              >
                <path
                  d="M1 5l3 3 7-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
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
          <p
            id={fieldErrorId("your-privacy")}
            className="mt-2 text-center text-sm font-semibold text-accent"
            role="alert"
          >
            {errors["your-privacy"].message}
          </p>
        )}

        <button
          type="submit"
          className="mx-auto mt-8 block w-50 cursor-pointer appearance-none rounded-none border-2 border-solid border-primary bg-primary py-4 font-bold leading-none tracking-widest text-white outline-none ring-0 transition-[filter] duration-300 ease-in-out hover:brightness-110 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? "送信中…" : "送信する"}
        </button>

        <div
          className="mt-4 text-center max-[430px]:text-[0.8rem]"
          aria-live="polite"
        >
          {submitServerError && (
            <span className="font-semibold text-accent" role="alert">
              {submitServerError}
            </span>
          )}
          {submitSucceeded && !submitServerError && (
            <span className="font-semibold text-primary">
              送信が完了しました。ありがとうございました。
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
