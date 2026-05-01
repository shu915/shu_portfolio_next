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

/** 一覧グリッド + ジャンルタブ（A案：md+ は下線タブ、未満は左ボーダー縦タブ） + ページネーション */
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

  // PC: 下線タブ（横並び）
  // SP: 左ボーダータブ（縦並び・全幅）
  const tabBase =
    "font-semibold tracking-widest no-underline transition-colors duration-200 " +
    // PC
    "md:inline-block md:px-5 md:py-2 md:pb-[10px] md:text-sm md:border-b-2 md:-mb-px md:border-l-0 md:w-auto md:bg-transparent " +
    // SP
    "flex w-full items-center border-b-0 border-l-2 px-4 py-3 text-[0.8125rem]";

  const tabActive =
    `${tabBase} border-l-primary bg-secondary text-primary md:border-b-primary md:bg-transparent`;

  const tabInactive =
    `${tabBase} border-l-transparent text-[#888] md:border-b-transparent ` +
    "hover:border-l-primary/30 hover:bg-secondary/60 hover:text-primary md:hover:border-b-primary/20 md:hover:bg-transparent";

  return (
    <div>
      <nav
        className="mx-auto mt-8 flex w-full flex-col border border-primary/10 md:w-fit md:flex-row md:border-x-0 md:border-t-0 md:border-b md:border-primary/10"
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
            className={activeServiceSlug === t.slug ? tabActive : tabInactive}
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
