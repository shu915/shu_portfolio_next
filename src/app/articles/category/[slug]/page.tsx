import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlesArchiveLayout } from "@/components/articles/ArticlesArchiveLayout";
import { ArticlesArchiveLeading } from "@/components/articles/ArticlesArchiveLeading";
import { ArticlesArchiveMain } from "@/components/articles/ArticlesArchiveMain";
import { ArticlesSidebar } from "@/components/articles/ArticlesSidebar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SubHeader } from "@/components/ui/SubHeader";
import {
  getArticlesSidebarBundle,
  getCategoryArchivePage,
} from "@/lib/articles-sidebar";
import { parsePaginationPage } from "@/lib/parse-pagination-page";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parsePaginationPage(sp.page);
  const data = await getCategoryArchivePage(slug, page);
  if (!data) {
    return { title: "カテゴリが見つかりません | Shu Digital Works" };
  }
  const { category } = data;
  const base = `${category.name} | Articles | Shu Digital Works`;
  const title =
    page <= 1 ? base : `${category.name}（${page}ページ目）| Articles | Shu Digital Works`;
  return {
    title,
    description: `カテゴリ「${category.name}」の記事一覧です。Shu Digital Works（フルスタックエンジニア Shu）が公開する技術ブログ記事から、${category.name}に関する投稿をまとめています。`,
  };
}

export default async function ArticlesCategoryArchivePage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parsePaginationPage(sp.page);

  const [sidebar, archive] = await Promise.all([
    getArticlesSidebarBundle(),
    getCategoryArchivePage(slug, page),
  ]);

  if (archive === null) {
    notFound();
  }

  const { category, posts: pagePosts, totalPages, totalCount } = archive;

  if (page > totalPages) {
    notFound();
  }

  const paginationPath = `/articles/category/${category.slug}`;

  const leading = (
    <ArticlesArchiveLeading
      iconSrc="/images/articles/category-icon.svg"
      prefixLabel="カテゴリー："
      title={category.name}
      totalCount={totalCount}
    />
  );

  return (
    <>
      <SubHeader variant="articles" title="Articles" subtitle="投稿記事" />
      <div className="mx-auto max-w-[1232px] px-4 pb-32 md:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Top", href: "/" },
            { label: "Articles", href: "/articles" },
            { label: category.name },
          ]}
        />
        <ArticlesArchiveLayout
          main={
            <ArticlesArchiveMain
              posts={pagePosts}
              currentPage={page}
              totalPages={totalPages}
              paginationPathname={paginationPath}
              leading={leading}
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
