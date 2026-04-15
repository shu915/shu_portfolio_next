"use client";

import Link from "next/link";
import { useState } from "react";
import "@/styles/contact/pContactForm.css";

/**
 * レガシー CF7 テンプレート + `_p-contact.scss` と同一クラス。
 * 送信は未接続。
 */
export function ContactForm() {
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

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
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div className="p-contact__form-items">
          <div className="p-contact__form-item">
            <label htmlFor="your-company" className="p-contact__form-label">
              会社名・屋号
            </label>
            <input
              id="your-company"
              name="your-company"
              type="text"
              autoComplete="organization"
              className="p-contact__form-input"
              placeholder="例)〇〇株式会社"
            />
          </div>

          <div className="p-contact__form-item">
            <label htmlFor="your-name" className="p-contact__form-label">
              お名前
              <span className="p-contact__form-label-required">必須</span>
            </label>
            <input
              id="your-name"
              name="your-name"
              type="text"
              autoComplete="name"
              required
              aria-required="true"
              className="p-contact__form-input"
              placeholder="例)山田 太郎"
            />
          </div>

          <div className="p-contact__form-item">
            <label htmlFor="your-email" className="p-contact__form-label">
              メールアドレス
              <span className="p-contact__form-label-required">必須</span>
            </label>
            <input
              id="your-email"
              name="your-email"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              className="p-contact__form-input"
              placeholder="例)info@example.com"
            />
          </div>

          <div className="p-contact__form-item">
            <label htmlFor="your-subject" className="p-contact__form-label">
              お問い合わせ件名
              <span className="p-contact__form-label-required">必須</span>
            </label>
            <input
              id="your-subject"
              name="your-subject"
              type="text"
              required
              aria-required="true"
              className="p-contact__form-input"
              placeholder="例)〇〇について"
            />
          </div>

          <div className="p-contact__form-item">
            <label htmlFor="your-message" className="p-contact__form-label">
              お問い合わせ内容
              <span className="p-contact__form-label-required">必須</span>
            </label>
            <textarea
              id="your-message"
              name="your-message"
              required
              aria-required="true"
              className="p-contact__form-textarea"
              placeholder="具体的な内容をご記入下さい"
            />
          </div>
        </div>

        <div className="p-contact__form-privacy">
          <input
            id="js-your-privacy-checkbox"
            name="your-privacy"
            type="checkbox"
            checked={privacyAccepted}
            onChange={(e) => setPrivacyAccepted(e.target.checked)}
            required
            className="p-contact__form-privacy-checkbox"
            aria-required="true"
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

        <button type="submit" className="p-contact__form-submit">
          送信する
        </button>

        <div className="wpcf7-response-output" aria-hidden="true" />
      </form>
    </div>
  );
}
