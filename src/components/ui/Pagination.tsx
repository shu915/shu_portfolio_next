import Link from "next/link";

type Props = {
  currentPage: number;
  totalPages: number;
  /** 例: /articles … ?page= は 2 ページ目以降のみ付与 */
  pathname: string;
};

function buildHref(pathname: string, page: number): string {
  if (page <= 1) return pathname;
  return `${pathname}?page=${page}`;
}

/**
 * 投稿・一覧のページネーション（レガシー .p-pagination / .page-numbers に相当）
 */
/** 番号ボタンを並べる上限（超えたら「現在 / 合計」表示に切り替え） */
const MAX_PAGE_NUMBER_BUTTONS = 15;

export function Pagination({ currentPage, totalPages, pathname }: Props) {
  if (totalPages <= 1) return null;

  if (totalPages > MAX_PAGE_NUMBER_BUTTONS) {
    return (
      <nav
        aria-label="ページネーション"
        className="mt-14 flex w-fit max-w-full flex-wrap items-center justify-center gap-4 mx-auto"
      >
        {currentPage > 1 ? (
          <Link
            href={buildHref(pathname, currentPage - 1)}
            className="inline-flex h-[50px] min-w-[50px] items-center justify-center bg-secondary px-3 text-base transition-colors hover:bg-primary hover:text-white"
            aria-label="前のページへ"
          >
            <ChevronLeftIcon className="size-4" />
          </Link>
        ) : (
          <span className="inline-flex h-[50px] min-w-[50px] cursor-not-allowed items-center justify-center bg-secondary/50 px-3 text-[#999]">
            <ChevronLeftIcon className="size-4" />
          </span>
        )}
        <span className="text-base tracking-widest tabular-nums" aria-current="page">
          {currentPage} / {totalPages}
        </span>
        {currentPage < totalPages ? (
          <Link
            href={buildHref(pathname, currentPage + 1)}
            className="inline-flex h-[50px] min-w-[50px] items-center justify-center bg-secondary px-3 text-base transition-colors hover:bg-primary hover:text-white"
            aria-label="次のページへ"
          >
            <ChevronRightIcon className="size-4" />
          </Link>
        ) : (
          <span className="inline-flex h-[50px] min-w-[50px] cursor-not-allowed items-center justify-center bg-secondary/50 px-3 text-[#999]">
            <ChevronRightIcon className="size-4" />
          </span>
        )}
      </nav>
    );
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="ページネーション"
      className="mt-14 flex w-fit max-w-full justify-center mx-auto"
    >
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          {currentPage > 1 ? (
            <Link
              href={buildHref(pathname, currentPage - 1)}
              className="inline-flex h-[50px] w-[50px] items-center justify-center bg-secondary text-base transition-colors hover:bg-primary hover:text-white"
              aria-label="前のページへ"
            >
              <ChevronLeftIcon className="size-4" />
            </Link>
          ) : (
            <span
              className="inline-flex h-[50px] w-[50px] cursor-not-allowed items-center justify-center bg-secondary/50 text-[#999]"
              aria-disabled="true"
            >
              <ChevronLeftIcon className="size-4" />
            </span>
          )}
        </li>
        {pages.map((page) => {
          const isCurrent = page === currentPage;
          return (
            <li key={page}>
              {isCurrent ? (
                <span
                  className="inline-flex h-[50px] w-[50px] items-center justify-center bg-primary text-base text-white"
                  aria-current="page"
                  aria-label={`${page} ページ目`}
                >
                  {page}
                </span>
              ) : (
                <Link
                  href={buildHref(pathname, page)}
                  className="inline-flex h-[50px] w-[50px] items-center justify-center bg-secondary text-base transition-colors hover:bg-primary hover:text-white"
                >
                  {page}
                </Link>
              )}
            </li>
          );
        })}
        <li>
          {currentPage < totalPages ? (
            <Link
              href={buildHref(pathname, currentPage + 1)}
              className="inline-flex h-[50px] w-[50px] items-center justify-center bg-secondary text-base transition-colors hover:bg-primary hover:text-white"
              aria-label="次のページへ"
            >
              <ChevronRightIcon className="size-4" />
            </Link>
          ) : (
            <span
              className="inline-flex h-[50px] w-[50px] cursor-not-allowed items-center justify-center bg-secondary/50 text-[#999]"
              aria-disabled="true"
            >
              <ChevronRightIcon className="size-4" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  );
}
