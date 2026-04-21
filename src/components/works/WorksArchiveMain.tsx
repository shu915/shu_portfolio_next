import Link from "next/link";
import { ArticleListItem } from "@/components/ui/ArticleListItem";
import { Pagination } from "@/components/ui/Pagination";
import type { WorksArchiveNode } from "@/lib/works-archive";
import { stripExcerptHtml } from "@/lib/articles-archive";

type Props = {
  works: WorksArchiveNode[];
  currentPage: number;
  totalPages: number;
  /** レガシー `?service=` に対応（未指定は All） */
  activeServiceSlug?: string;
  serviceTerms: { name: string; slug: string }[];
};

/** 一覧グリッド + ジャンルタブ + ページネーション */
export function WorksArchiveMain({
  works,
  currentPage,
  totalPages,
  activeServiceSlug,
  serviceTerms,
}: Props) {
  const basePath = "/works";
  const withService = (slug?: string) => {
    const s = slug?.trim();
    if (!s) return basePath;
    return `${basePath}?service=${encodeURIComponent(s)}`;
  };

  /** 競合（text-primary / text-white）を避けるため、非アクティブとアクティブでクラスを分ける */
  const tabInactive =
    "inline-block rounded px-3 py-1 text-base font-semibold tracking-widest text-primary no-underline transition-colors duration-300 bg-secondary hover:bg-primary hover:text-white";
  const tabActive =
    "inline-block rounded px-3 py-1 text-base font-semibold tracking-widest text-white no-underline transition-colors duration-300 bg-primary hover:bg-primary hover:text-white";

  return (
    <div>
      <nav
        className="mx-auto mt-8 flex w-fit flex-col items-start gap-4 md:flex-row md:items-center md:justify-center"
        aria-label="制作実績のジャンル"
      >
        <Link
          href={withService()}
          prefetch={false}
          className={!activeServiceSlug ? tabActive : tabInactive}
          aria-current={!activeServiceSlug ? "page" : undefined}
        >
          All
        </Link>
        {serviceTerms.map((t) => (
          <Link
            key={t.slug}
            href={withService(t.slug)}
            prefetch={false}
            className={
              activeServiceSlug === t.slug ? tabActive : tabInactive
            }
            aria-current={activeServiceSlug === t.slug ? "page" : undefined}
          >
            {t.name}
          </Link>
        ))}
      </nav>

      {works.length === 0 ? (
        <p className="mt-12 text-base">該当する制作実績はありません。</p>
      ) : (
        <>
          {/* レガシー `.p-archive-works__main` の margin-top: 3rem に相当 */}
          <ul className="mt-12 grid w-full grid-cols-[16.6rem] place-content-center gap-6 min-[620px]:grid-cols-[repeat(2,16.6rem)] min-[930px]:grid-cols-[repeat(3,16.6rem)]">
            {works.map((work, index) => (
              <li key={work.id} className="w-full min-w-0 justify-self-center">
                <ArticleListItem
                  href={`/works/${work.slug}`}
                  title={work.title}
                  date={work.date}
                  excerpt={stripExcerptHtml(work.excerpt)}
                  thumbnailUrl={work.featuredImage?.node.sourceUrl}
                  thumbnailAlt={work.featuredImage?.node.altText}
                  categoryName={work.services?.nodes[0]?.name}
                  priority={index === 0}
                />
              </li>
            ))}
          </ul>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pathname={basePath}
            searchParams={
              activeServiceSlug
                ? { service: activeServiceSlug }
                : undefined
            }
          />
        </>
      )}
    </div>
  );
}
