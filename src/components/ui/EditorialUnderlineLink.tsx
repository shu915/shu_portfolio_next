import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  /** Next.js `<Link prefetch>` を明示制御したい場合のみ指定。 */
  prefetch?: boolean;
  /** スクリーンリーダー用ラベル（文脈で必要な場合のみ） */
  ariaLabel?: string;
  /** 追加 className */
  className?: string;
};

/**
 * 編集的な下線リンク（和文ラベル + 矢印アイコン + 下線）
 *
 *   詳しいプロフィールはこちら  →
 *   ────────────────────────────
 *
 * - 和文ラベル（Shippori Mincho、本文と同フォント）
 * - 右端に細い矢印アイコン
 * - 下端に primary 色の細い罫線
 * - ホバーで矢印が右に 6px シフト
 *
 * 用途: フロントページ各セクションの「もっと見る」誘導など。
 */
export function EditorialUnderlineLink({
  href,
  children,
  prefetch,
  ariaLabel,
  className = "",
}: Props) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      aria-label={ariaLabel}
      className={[
        "group inline-flex items-center gap-3.5",
        "py-2.5",
        "border-b border-primary",
        "font-shippori-mincho font-medium text-primary",
        "text-[14px] md:text-[16px]",
        "tracking-widest md:tracking-[0.12em]",
        "min-w-[240px] md:min-w-[280px]",
        className,
      ].join(" ")}
    >
      <span className="flex-1">{children}</span>
      <svg
        width="22"
        height="10"
        viewBox="0 0 22 10"
        aria-hidden="true"
        style={{ overflow: "visible" }}
        className="shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5"
      >
        <path
          d="M0 5 H20 M16 1 L20 5 L16 9"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
        />
      </svg>
    </Link>
  );
}
