import type { ReactNode } from "react";

type Props = {
  /** 上部の和文小見出し（例: "プロフィール"） */
  eyebrow: string;
  /** 英文の大見出し（Cormorant Garamond） */
  title: string;
  /** `dark`: `bg-primary` など暗背景向け（文字を白系に） */
  tone?: "light" | "dark";
  /**
   * 描画するタグ。デフォルトは `h2`。
   * 詳細ページなどで `h1` が別にある場合は `"div"` などに変更可。
   */
  as?: "h1" | "h2" | "h3" | "div";
  /** aria-labelledby などで参照するための id */
  id?: string;
  /** 追加のラッパー className */
  className?: string;
};

/**
 * セクションタイトル（フロントページ刷新用・`sections.module.css` の `.sectionTitle` とは別物）
 *
 * 構造:
 *   ── プロフィール ──     ← 和文 eyebrow（Shippori Mincho、両端細罫線）
 *      Profile             ← 英文タイトル（Cormorant Garamond、大）
 *
 * 配置は呼び出し側で（デフォルトは中央寄せ）。
 *
 * サイズ:
 *   - Mobile  : eyebrow 14px / 0.24em, title 48px
 *   - Desktop : eyebrow 14px / 0.32em, title 60px
 */
export function SectionTitle({
  eyebrow,
  title,
  tone = "light",
  as: Tag = "h2",
  id,
  className = "",
}: Props): ReactNode {
  const eyebrowTone =
    tone === "dark"
      ? "text-white/75"
      : "text-body-muted";
  const titleTone =
    tone === "dark" ? "text-white" : "text-primary";

  return (
    <div
      className={[
        "flex flex-col items-center gap-3 md:gap-3.5",
        className,
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex items-center leading-none",
          "font-shippori-mincho font-medium",
          eyebrowTone,
          "gap-2.5 md:gap-3.5",
          "text-[14px] tracking-[0.24em] md:tracking-[0.32em]",
          "before:content-[''] before:inline-block before:h-px before:bg-current before:opacity-60",
          "before:w-[18px] md:before:w-[28px]",
          "after:content-[''] after:inline-block after:h-px after:bg-current after:opacity-60",
          "after:w-[18px] md:after:w-[28px]",
        ].join(" ")}
      >
        {eyebrow}
      </span>

      <Tag
        id={id}
        className={[
          "m-0 font-cormorant font-medium",
          titleTone,
          "leading-none tracking-[0.04em]",
          "text-[48px] md:text-[60px]",
        ].join(" ")}
      >
        {title}
      </Tag>
    </div>
  );
}
