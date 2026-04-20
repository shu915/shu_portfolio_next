import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  /** 省略時は現在ページ（リンクにしない） */
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
};

/**
 * パンくず（レガシー .p-breadcrumbs に相当）
 * 1 行の文章のように流し、幅が足りないときは左詰めで折り返す。
 */
export function Breadcrumbs({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="パンくずリスト"
      className="mt-2 text-left text-sm leading-relaxed tracking-widest text-[#333]"
    >
      <ol className="m-0 max-w-full list-none p-0 wrap-break-word [word-break:break-word]">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="inline">
              {index > 0 ? (
                <>
                  {" "}
                  <span className="text-[#333]" aria-hidden="true">
                    {">"}
                  </span>{" "}
                </>
              ) : null}
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-[#777]">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
