import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlesArchiveLayout } from "@/components/articles/ArticlesArchiveLayout";
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
    <h3 className="mb-4 flex flex-wrap items-center gap-1 text-2xl font-bold tracking-[0.075em] text-black max-md:text-xl max-[430px]:text-lg max-[360px]:text-[1.1rem]">
      {/* eslint-disable-next-line @next/next/no-img-element -- サイドバー「カテゴリー」と同じ装飾 SVG */}
      <img
        src="/images/articles/category-icon.svg"
        alt=""
        width={20}
        height={20}
        className="h-5 w-5 shrink-0"
        aria-hidden
      />
      <span className="max-[430px]:hidden">カテゴリー：</span>
      <span className="break-all">{category.name}</span>
      <span className="whitespace-nowrap">（{totalCount}件）</span>
    </h3>
  );

  return (
    <>
      <SubHeader
        variant="articles"
        title="Articles"
        subtitle={category.name}
      />
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
