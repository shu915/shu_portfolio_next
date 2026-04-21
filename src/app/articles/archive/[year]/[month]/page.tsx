import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlesArchiveLayout } from "@/components/articles/ArticlesArchiveLayout";
import { ArticlesArchiveMain } from "@/components/articles/ArticlesArchiveMain";
import { ArticlesSidebar } from "@/components/articles/ArticlesSidebar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SubHeader } from "@/components/ui/SubHeader";
import {
  articlesYearMonthArchivePath,
  getArticlesSidebarBundle,
  getArticlesYearMonthArchivePage,
  parseYearMonthRouteParams,
} from "@/lib/articles-sidebar";

function parsePage(raw: string | string[] | undefined): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = parseInt(v ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

type PageProps = {
  params: Promise<{ year: string; month: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { year: yStr, month: mStr } = await params;
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const ym = parseYearMonthRouteParams(yStr, mStr);
  if (!ym) {
    return { title: "記事一覧 | Shu Digital Works" };
  }
  const data = await getArticlesYearMonthArchivePage(ym.year, ym.month, page);
  if (!data) {
    return { title: "記事一覧 | Shu Digital Works" };
  }
  const { year, month } = data;
  const heading = `${year}年${month}月`;
  const base = `${heading} | Articles | Shu Digital Works`;
  const title =
    page <= 1 ? base : `${heading}（${page}ページ目）| Articles | Shu Digital Works`;
  return {
    title,
    description: `${heading}の記事一覧`,
  };
}

export default async function ArticlesYearMonthArchivePage({
  params,
  searchParams,
}: PageProps) {
  const { year: yStr, month: mStr } = await params;
  const sp = await searchParams;
  const page = parsePage(sp.page);

  const ym = parseYearMonthRouteParams(yStr, mStr);
  if (!ym) {
    notFound();
  }

  const [sidebar, archive] = await Promise.all([
    getArticlesSidebarBundle(),
    getArticlesYearMonthArchivePage(ym.year, ym.month, page),
  ]);

  if (archive === null) {
    notFound();
  }

  const { posts: pagePosts, totalPages, year, month } = archive;
  const heading = `${year}年${month}月`;

  if (page > totalPages) {
    notFound();
  }

  const paginationPath = articlesYearMonthArchivePath(year, month);

  return (
    <>
      <SubHeader variant="articles" title="Articles" subtitle={heading} />
      <div className="mx-auto max-w-[1232px] px-4 pb-32 md:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Top", href: "/" },
            { label: "Articles", href: "/articles" },
            { label: "アーカイブ" },
            { label: heading },
          ]}
        />
        <ArticlesArchiveLayout
          main={
            <ArticlesArchiveMain
              posts={pagePosts}
              currentPage={page}
              totalPages={totalPages}
              paginationPathname={paginationPath}
            />
          }
          sidebar={
            <ArticlesSidebar
              recentPosts={sidebar.recentPosts}
              categories={sidebar.categories}
              tags={sidebar.tags}
              postDates={sidebar.postDates}
            />
          }
        />
      </div>
    </>
  );
}
