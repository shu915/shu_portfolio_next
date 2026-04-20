import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ArchivePostNode, TaxonomyNode } from "@/lib/articles-archive";
import { groupPostDatesByYearMonth } from "@/lib/articles-archive";
import { SidebarSearchForm } from "@/components/articles/SidebarSearchForm";
import { formatDateJa } from "@/lib/format-date-ja";

type Props = {
  /** 新着は `posts` の先頭（日付降順想定）から最大3件 */
  recentPosts: ArchivePostNode[];
  categories: TaxonomyNode[];
  tags: TaxonomyNode[];
  /** アーカイブ集計用（取得済み投稿の date のみ使用） */
  postDates: string[];
};

function trimTitle(title: string, maxChars = 36): string {
  const t = title.trim();
  if (t.length <= maxChars) return t;
  return `${t.slice(0, maxChars)}…`;
}

/**
 * 記事一覧サイドバー（レガシー sidebar.php に相当）
 *
 * next/image はデフォルトで lazy になり、ファーストビュー内のサムネが LCP になると
 * 開発時に警告が出る。上側に固定表示される画像には loading="eager" を付ける。
 */
export function ArticlesSidebar({
  recentPosts,
  categories,
  tags,
  postDates,
}: Props) {
  const archiveYears = groupPostDatesByYearMonth(postDates);

  return (
    <aside className="w-full">
      {/* プロフィール */}
      <section aria-labelledby="sidebar-profile-heading">
        <h2
          id="sidebar-profile-heading"
          className="text-center text-2xl font-bold"
        >
          プロフィール
        </h2>
        <figure className="mx-auto mt-2 w-45">
          <Image
            src="/images/common/profile-image.webp"
            alt="プロフィール"
            width={180}
            height={162}
            className="h-auto w-full object-contain"
            loading="eager"
          />
        </figure>
        <p className="mt-2 text-center text-2xl font-bold tracking-widest">
          Shu
        </p>
        <p className="mt-2 text-justify text-sm leading-normal tracking-widest">
          Webエンジニアリングを通じて、実用的で信頼性の高い成果を提供。細部にこだわり、使いやすさとクオリティを追求。技術の力で未来を形にします。
        </p>
      </section>

      {/* 検索 */}
      <section className="mt-10" aria-labelledby="sidebar-search-heading">
        <SidebarSectionHeading
          id="sidebar-search-heading"
          icon="/images/articles/sidebar-search-icon.svg"
          iconClassName="h-[1.3rem] w-[1.3rem]"
        >
          検索
        </SidebarSectionHeading>
        <SidebarSearchForm />
      </section>

      {/* 新着記事 */}
      <section className="mt-10" aria-labelledby="sidebar-recent-heading">
        <SidebarSectionHeading
          id="sidebar-recent-heading"
          icon="/images/articles/sidebar-recent-icon.svg"
        >
          新着記事
        </SidebarSectionHeading>
        <div className="mt-0.5 flex flex-col">
          {recentPosts.map((post) => (
            <article
              key={post.id}
              className="group w-full border-b border-[#eee] last:border-b-0 hover:bg-[#fafafa]"
            >
              <Link
                href={`/articles/${post.slug}`}
                className="mt-4 flex gap-2 items-start"
              >
                <div className="relative aspect-square w-[35%] max-w-20 shrink-0 overflow-hidden">
                  <Image
                    src={
                      post.featuredImage?.node.sourceUrl ?? "/images/common/no-image.webp"
                    }
                    alt={post.featuredImage?.node.altText || post.title}
                    fill
                    sizes="80px"
                    className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-[1.08]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 h-[2.2rem] text-sm font-bold leading-[1.3]">
                    {trimTitle(post.title)}
                  </h3>
                  {/*
                    .p-sidebar-article-item__meta 相当：
                    カテゴリは inline-block、日付は block で必ず改行（横並びにしない）
                  */}
                  <div className="mt-[0.1rem]">
                    {post.categories?.nodes[0]?.name ? (
                      <span className="inline-block rounded-sm bg-secondary px-1 py-0.5 text-[0.75rem] font-semibold tracking-widest">
                        {post.categories.nodes[0].name}
                      </span>
                    ) : null}
                    <time
                      dateTime={post.date}
                      className="block text-[0.8rem] tracking-[0.05em] text-[#333] max-md:ml-4"
                    >
                      {formatDateJa(post.date)}
                    </time>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* カテゴリー */}
      {categories.length > 0 && (
        <section className="mt-10" aria-labelledby="sidebar-cat-heading">
          <SidebarSectionHeading
            id="sidebar-cat-heading"
            icon="/images/articles/category-icon.svg"
          >
            カテゴリー
          </SidebarSectionHeading>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/articles/category/${cat.slug}`}
                className="inline-block rounded-sm bg-secondary px-1.5 py-0.5 text-sm font-semibold tracking-widest transition-colors hover:bg-primary hover:text-white max-[430px]:px-1 max-[430px]:text-xs"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* タグ */}
      {tags.length > 0 && (
        <section className="mt-10" aria-labelledby="sidebar-tags-heading">
          <SidebarSectionHeading
            id="sidebar-tags-heading"
            icon="/images/articles/tag-icon.svg"
          >
            タグ
          </SidebarSectionHeading>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/articles/tag/${tag.slug}`}
                className="inline-block rounded-sm bg-[#eee] px-1.5 py-0.5 text-sm font-semibold tracking-widest transition-colors hover:bg-primary hover:text-white max-[430px]:px-1 max-[430px]:text-xs"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* アーカイブ（取得済み投稿に基づく月別件数） */}
      {archiveYears.length > 0 && (
        <section className="mt-10" aria-labelledby="sidebar-archive-heading">
          <SidebarSectionHeading
            id="sidebar-archive-heading"
            icon="/images/articles/archive-icon.svg"
          >
            アーカイブ
          </SidebarSectionHeading>
          <div className="mt-2">
            {archiveYears.map(({ year, months }) => (
              <details
                key={year}
                className="border-b border-dotted border-[#ccc] group"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 bg-white py-1.5 px-2 text-[1.2rem] text-[#333] [&::-webkit-details-marker]:hidden">
                  <span>{year}年</span>
                  <span className="inline-flex shrink-0 origin-center transition-transform duration-200 ease-out group-open:rotate-180">
                    <ArchiveChevron className="size-4" />
                  </span>
                </summary>
                <ul className="pb-1">
                  {months.map(({ month, count }) => (
                    <li
                      key={`${year}-${month}`}
                      className="block border-b border-dotted border-[#ccc] py-1.5 pl-6 pr-2 text-base text-[#333] last:border-b-0"
                    >
                      <Link
                        href={`/articles?ym=${year}-${String(month).padStart(2, "0")}`}
                        className="block w-full hover:text-primary"
                      >
                        {month}月({count})
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </section>
      )}
    </aside>
  );
}

function SidebarSectionHeading({
  id,
  icon,
  iconClassName,
  children,
}: {
  id?: string;
  icon: string;
  iconClassName?: string;
  children: ReactNode;
}) {
  return (
    <h2
      id={id}
      className="flex items-center gap-4 border-b-2 border-[#d9d9d9] pb-1 text-[clamp(1.375rem,1.232rem+0.3vw,1.5rem)] font-bold tracking-widest"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- 小さな装飾 SVG */}
      <img
        src={icon}
        alt=""
        className={`size-6 shrink-0 ${iconClassName ?? ""}`}
        width={24}
        height={24}
      />
      {children}
    </h2>
  );
}

function ArchiveChevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
    </svg>
  );
}
