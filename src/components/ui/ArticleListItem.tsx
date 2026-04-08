import Image from "next/image";
import Link from "next/link";

type Props = {
  href: string;
  title: string;
  date: string;
  /** HTML タグを含む可能性があるため、呼び出し元でストリップして渡すこと */
  excerpt: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  categoryName?: string;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr)
    .toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, ".");
}

/**
 * 記事・Works カード（一覧ページ・フロントページで共通使用）
 * WordPress テーマの article-list-item.php を移植
 *
 * - h-full でグリッドセルの高さを使い切る
 * - タイトルエリアを h-[3.94rem] 固定にすることで
 *   日付・抜粋の縦位置をカード間で揃える
 * - 抜粋エリアを flex-1 にすることでカード底面を揃える
 */
export function ArticleListItem({
  href,
  title,
  date,
  excerpt,
  thumbnailUrl,
  thumbnailAlt = "",
  categoryName,
}: Props) {
  return (
    <Link
      href={href}
      className="group flex flex-col h-full w-full bg-white rounded-sm shadow-[1px_2px_4px_0px_rgba(0,0,0,0.25)] p-2 pb-4"
    >
      {/* サムネイル：featuredImage 未設定時は no-image.webp を表示 */}
      <div className="relative w-full aspect-[1.618/1] overflow-hidden border-b border-[#eee] bg-secondary">
        <Image
          src={thumbnailUrl ?? "/img/no-image.webp"}
          alt={thumbnailAlt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.07]"
        />
      </div>

      {/* タイトル：3行分の固定高さでカード間の縦位置を揃える */}
      <p className="text-base font-bold tracking-widest mt-[0.2rem] leading-[1.3] h-[3.94rem] overflow-hidden">
        {title}
      </p>

      {/* メタ情報（日付・カテゴリ） */}
      <div className="flex justify-between mt-[0.4rem]">
        <time
          dateTime={new Date(date).toISOString()}
          className="text-[0.8rem] flex items-center gap-1 tracking-widest"
        >
          {formatDate(date)}
        </time>
        {categoryName && (
          <span className="text-[0.75rem] bg-secondary inline-flex items-center rounded-sm tracking-widest px-1 py-[0.1rem] font-semibold">
            {categoryName}
          </span>
        )}
      </div>

      {/* 抜粋：flex-1 でカード底面を揃える */}
      <p className="flex-1 mt-3 text-md font-normal leading-relaxed">
        {excerpt}
      </p>
    </Link>
  );
}
