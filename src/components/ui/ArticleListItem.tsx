import Image from "next/image";
import Link from "next/link";
import { formatDateJa } from "@/lib/format-date-ja";
import styles from "@/styles/ui/articleListItem.module.css";

type Props = {
  href: string;
  title: string;
  date: string;
  /** HTML タグを含む可能性があるため、呼び出し元でストリップして渡すこと */
  excerpt: string;
  thumbnailUrl?: string;
  thumbnailAlt?: string;
  categoryName?: string;
  /**
   * ファーストビューに載る1枚だけ true（LCP 向けに preload）
   * @see https://nextjs.org/docs/app/api-reference/components/image#priority
   */
  priority?: boolean;
};

/**
 * 記事・Works カード（一覧ページ・フロントページで共通使用）
 *
 * - Props・データフローは変更なし
 * - サムネイル：黄金比（aspect-ratio: 1.618/1）
 * - カテゴリ：画像左下リボンバッジ（sectionTitle の DNA を継承）
 * - 日付：ショートダッシュ＋Shippori Mincho で視認性重視
 * - ホバー：カード浮き上がり・底辺ラインが伸びる・セパレーター伸長
 */
export function ArticleListItem({
  href,
  title,
  date,
  excerpt,
  thumbnailUrl,
  thumbnailAlt = "",
  categoryName,
  priority = false,
}: Props) {
  return (
    <Link href={href} className={styles.card}>
      {/* サムネイル */}
      <div className={styles.thumb}>
        <Image
          src={thumbnailUrl ?? "/images/common/no-image.webp"}
          alt={thumbnailAlt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className={styles.thumbImg}
        />
        <div className={styles.thumbOverlay} aria-hidden="true" />
        {categoryName && (
          <span className={styles.category}>{categoryName}</span>
        )}
      </div>

      {/* ボディ */}
      <div className={styles.body}>
        {/* 日付 */}
        <div className={styles.dateRow}>
          <div className={styles.dateLine} aria-hidden="true" />
          <time dateTime={date} className={styles.date}>
            {formatDateJa(date)}
          </time>
        </div>

        {/* タイトル */}
        <p className={styles.title}>{title}</p>

        {/* セパレーター */}
        <div className={styles.sep} aria-hidden="true" />

        {/* 抜粋 */}
        <p className={styles.excerpt}>{excerpt}</p>
      </div>
    </Link>
  );
}
