import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlesArchiveLayout } from "@/components/articles/ArticlesArchiveLayout";
import { ArticlesArchiveMain } from "@/components/articles/ArticlesArchiveMain";
import { ArticlesSidebar } from "@/components/articles/ArticlesSidebar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SubHeader } from "@/components/ui/SubHeader";
import {
  getArticlesArchiveOffsetPage,
  getArticlesSidebarBundle,
} from "@/lib/articles-archive";
import { parsePaginationPage } from "@/lib/parse-pagination-page";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const page = parsePaginationPage(sp.page);
  const title =
    page <= 1
      ? "Articles | Shu Digital Works"
      : `Articles（${page}ページ目）| Shu Digital Works`;
  return {
    title,
    description:
      "Shu Digital Works（フルスタックエンジニア Shu）が公開する技術ブログ記事です。フルスタック開発の実務で得た知見を中心に、Next.js・Rails・API・データベースなど、フロントからサーバーまでのメモを掲載しています。",
  };
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const sp = await searchParams;
  const page = parsePaginationPage(sp.page);

  const [sidebar, archive] = await Promise.all([
    getArticlesSidebarBundle(),
    getArticlesArchiveOffsetPage(page),
  ]);

  if (archive === null) {
    notFound();
  }

  const { posts: pagePosts, totalPages } = archive;

  if (page > totalPages) {
    notFound();
  }

  return (
    <>
      <SubHeader variant="articles" title="Articles" subtitle="投稿記事" />
      <div className="mx-auto max-w-[1232px] px-4 pb-32 md:px-6 lg:px-8">
        <Breadcrumbs
          items={[{ label: "Top", href: "/" }, { label: "Articles" }]}
        />
        <ArticlesArchiveLayout
          main={
            <ArticlesArchiveMain
              posts={pagePosts}
              currentPage={page}
              totalPages={totalPages}
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
