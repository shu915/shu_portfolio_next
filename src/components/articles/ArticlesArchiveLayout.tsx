import type { ReactNode } from "react";

type Props = {
  /** 一覧・ページネーションなどメインカラム */
  main: ReactNode;
  /** サイドバー（ウィジェットは後から差し込み） */
  sidebar: ReactNode;
};

/**
 * 投稿アーカイブの2カラム（レガシー .p-articles__content + .l-container に相当）
 * - 1233px 以上: メイン | サイド（横並び）
 * - それ以下: 縦積み（サイドは下）
 * - 619px 以下: サイドバー最大幅 16.6rem / 620px〜1232px: 26rem / デスクトップ: 16.625rem
 */
export function ArticlesArchiveLayout({ main, sidebar }: Props) {
  return (
    <div className="mt-6 flex flex-col gap-16 min-[1233px]:flex-row min-[1233px]:justify-between">
      <div className="flex-1 min-w-0">{main}</div>
      <aside
        className="mx-auto w-full max-w-[16.6rem] shrink-0 min-[620px]:max-w-104 min-[1233px]:mx-0 min-[1233px]:w-66.5 min-[1233px]:max-w-none"
        aria-label="サイドバー"
      >
        {sidebar}
      </aside>
    </div>
  );
}
