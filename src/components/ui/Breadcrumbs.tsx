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
 */
export function Breadcrumbs({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="パンくずリスト" className="mt-2 text-sm leading-loose tracking-widest text-[#333]">
      <ol className="flex flex-wrap items-center">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center">
              {index > 0 ? (
                <span className="mx-1 text-[#333]" aria-hidden="true">
                  /
                </span>
              ) : null}
              {item.href && !isLast ? (
                <Link href={item.href} className="hover:text-[#777] transition-colors">
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
