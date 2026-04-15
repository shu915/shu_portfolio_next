"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  contactFormSchema,
  type ContactFormValues,
} from "@/lib/validations/contact-form";
import "@/styles/contact/pContactForm.css";

function fieldErrorId(name: keyof ContactFormValues): string {
  return `error-${String(name).replace(/[^a-z0-9-]/gi, "-")}`;
}

/**
 * レガシー CF7 テンプレート + `_p-contact.scss` と同一クラス。
 * バリデーションは React Hook Form + Zod。
 */
export function ContactForm() {
  const [submitSucceeded, setSubmitSucceeded] = useState(false);
  const [submitServerError, setSubmitServerError] = useState<string | null>(
    null
  );

  const {
    register,
    handleSubmit,
    control,
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

  const privacyAccepted = useWatch({
    control,
    name: "your-privacy",
    defaultValue: false,
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
    <div className="p-contact__form">
      <h3 className="p-contact__form-title">Contact Form</h3>
      <p className="p-contact__form-text">
        お問い合わせ内容は
        <br />
        こちらにご記入下さい
      </p>

      <form
        className="wpcf7-form init"
        onSubmit={handleSubmit(onSubmit)}
        onChange={(e) => {
          if (!e.nativeEvent.isTrusted) return;
          setSubmitSucceeded((prev) => (prev ? false : prev));
        }}
        noValidate
      >
        <div className="p-contact__form-items">
          <div className="p-contact__form-item">
            <label htmlFor="your-company" className="p-contact__form-label">
              会社名・屋号
            </label>
            <input
              id="your-company"
              autoComplete="organization"
              className="p-contact__form-input"
              placeholder="例)〇〇株式会社"
              {...register("your-company")}
            />
          </div>

          <div className="p-contact__form-item">
            <label htmlFor="your-name" className="p-contact__form-label">
              お名前
              <span className="p-contact__form-label-required">必須</span>
            </label>
            <input
              id="your-name"
              autoComplete="name"
              className="p-contact__form-input"
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
                className="p-contact__form-field-error"
                role="alert"
              >
                {errors["your-name"].message}
              </p>
            )}
          </div>

          <div className="p-contact__form-item">
            <label htmlFor="your-email" className="p-contact__form-label">
              メールアドレス
              <span className="p-contact__form-label-required">必須</span>
            </label>
            <input
              id="your-email"
              autoComplete="email"
              inputMode="email"
              className="p-contact__form-input"
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
                className="p-contact__form-field-error"
                role="alert"
              >
                {errors["your-email"].message}
              </p>
            )}
          </div>

          <div className="p-contact__form-item">
            <label htmlFor="your-subject" className="p-contact__form-label">
              お問い合わせ件名
              <span className="p-contact__form-label-required">必須</span>
            </label>
            <input
              id="your-subject"
              className="p-contact__form-input"
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
                className="p-contact__form-field-error"
                role="alert"
              >
                {errors["your-subject"].message}
              </p>
            )}
          </div>

          <div className="p-contact__form-item">
            <label htmlFor="your-message" className="p-contact__form-label">
              お問い合わせ内容
              <span className="p-contact__form-label-required">必須</span>
            </label>
            <textarea
              id="your-message"
              className="p-contact__form-textarea"
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
                className="p-contact__form-field-error"
                role="alert"
              >
                {errors["your-message"].message}
              </p>
            )}
          </div>
        </div>

        <div className="p-contact__form-privacy">
          <input
            id="js-your-privacy-checkbox"
            type="checkbox"
            className="p-contact__form-privacy-checkbox"
            aria-required="true"
            aria-invalid={errors["your-privacy"] ? true : undefined}
            aria-describedby={
              errors["your-privacy"] ? fieldErrorId("your-privacy") : undefined
            }
            {...register("your-privacy")}
          />
          <label
            htmlFor="js-your-privacy-checkbox"
            id="js-your-privacy-label"
            className={`p-contact__form-privacy-label ${privacyAccepted ? "is-active" : ""}`}
          >
            <Link
              href="/privacy"
              className="p-contact__form-privacy-link"
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
            className="p-contact__form-field-error p-contact__form-field-error--center"
            role="alert"
          >
            {errors["your-privacy"].message}
          </p>
        )}

        <button
          type="submit"
          className="p-contact__form-submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "送信中…" : "送信する"}
        </button>

        <div className="wpcf7-response-output" aria-live="polite">
          {submitServerError && (
            <span className="p-contact__form-response p-contact__form-response--error">
              {submitServerError}
            </span>
          )}
          {submitSucceeded && !submitServerError && (
            <span className="p-contact__form-response p-contact__form-response--success">
              送信が完了しました。ありがとうございました。
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
