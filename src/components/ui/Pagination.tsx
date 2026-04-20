import Link from "next/link";

type Props = {
  currentPage: number;
  totalPages: number;
  /** 例: /articles … ?page= は 2 ページ目以降のみ付与 */
  pathname: string;
  /** `?page=` 以外に維持するクエリ（例: `service`） */
  searchParams?: Record<string, string>;
};

function buildHref(
  pathname: string,
  page: number,
  extra?: Record<string, string>
): string {
  const params = new URLSearchParams();
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v) params.set(k, v);
    }
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const q = params.toString();
  return q ? `${pathname}?${q}` : pathname;
}

/**
 * 現在ページの左右に何ページずつ並べるか。
 * 1 なら `… 3 4 5 …`（3 件）、2 なら `… 2 3 4 5 6 …`（5 件）。
 */
const SIBLING = 1;

type PageSlot = number | "ellipsis";

/**
 * `1` と最終ページと、現在±SIBLING だけを候補にし、飛びがあれば … を挟む。
 * 例: 全10ページ・現在4 → `1 … 3 4 5 … 10`
 */
function buildPageSlots(current: number, total: number): PageSlot[] {
  if (total <= 1) {
    return [];
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);

  for (let p = current - SIBLING; p <= current + SIBLING; p++) {
    if (p >= 1 && p <= total) {
      pages.add(p);
    }
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const slots: PageSlot[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const n = sorted[i];
    if (i > 0 && n - sorted[i - 1] > 1) {
      slots.push("ellipsis");
    }
    slots.push(n);
  }
  return slots;
}

const numberBtnClass =
  "inline-flex h-[50px] min-w-[50px] items-center justify-center bg-secondary text-base transition-colors hover:bg-primary hover:text-white";
const currentBtnClass =
  "inline-flex h-[50px] min-w-[50px] items-center justify-center bg-primary text-base text-white";
const disabledNavClass =
  "inline-flex h-[50px] w-[50px] cursor-not-allowed items-center justify-center bg-secondary/50 text-[#999]";

/**
 * 投稿・一覧のページネーション（レガシー .p-pagination / .page-numbers に相当）
 *
 * `searchParams` 付きの動的 URL では Link の prefetch が誤った RSC を引くことがあるため、
 * ページ送りの Link は prefetch しない。
 */
export function Pagination({
  currentPage,
  totalPages,
  pathname,
  searchParams: extraSearchParams,
}: Props) {
  if (totalPages <= 1) return null;

  const slots = buildPageSlots(currentPage, totalPages);

  return (
    <nav
      aria-label="ページネーション"
      className="mx-auto mt-14 flex w-fit max-w-full justify-center"
    >
      <ul className="flex max-w-full flex-wrap items-center justify-center gap-2">
        <li>
          {currentPage > 1 ? (
            <Link
              href={buildHref(pathname, currentPage - 1, extraSearchParams)}
              prefetch={false}
              className={`${numberBtnClass} w-[50px]`}
              aria-label="前のページへ"
            >
              <ChevronLeftIcon className="size-4" />
            </Link>
          ) : (
            <span className={disabledNavClass} aria-disabled="true">
              <ChevronLeftIcon className="size-4" />
            </span>
          )}
        </li>
        {slots.map((slot, i) =>
          slot === "ellipsis" ? (
            <li
              key={`nav-${i}-ellipsis`}
              className="flex h-[50px] w-[50px] shrink-0 select-none items-center justify-center bg-[#f0f0f0] text-base leading-none text-[#999]"
              aria-hidden
            >
              …
            </li>
          ) : (
            <li key={`nav-${i}-p${slot}`}>
              {slot === currentPage ? (
                <span
                  className={currentBtnClass}
                  aria-current="page"
                  aria-label={`${slot} ページ目`}
                >
                  {slot}
                </span>
              ) : (
                <Link
                  href={buildHref(pathname, slot, extraSearchParams)}
                  prefetch={false}
                  className={numberBtnClass}
                  aria-label={`${slot} ページ目へ`}
                >
                  {slot}
                </Link>
              )}
            </li>
          )
        )}
        <li>
          {currentPage < totalPages ? (
            <Link
              href={buildHref(pathname, currentPage + 1, extraSearchParams)}
              prefetch={false}
              className={`${numberBtnClass} w-[50px]`}
              aria-label="次のページへ"
            >
              <ChevronRightIcon className="size-4" />
            </Link>
          ) : (
            <span className={disabledNavClass} aria-disabled="true">
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
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
    </svg>
  );
}
