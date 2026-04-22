import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlesArchiveLayout } from "@/components/articles/ArticlesArchiveLayout";
import { ArticlesArchiveMain } from "@/components/articles/ArticlesArchiveMain";
import { ArticlesSidebar } from "@/components/articles/ArticlesSidebar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SubHeader } from "@/components/ui/SubHeader";
import {
  getArticlesSidebarBundle,
  getTagArchivePage,
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
  const data = await getTagArchivePage(slug, page);
  if (!data) {
    return { title: "タグが見つかりません | Shu Digital Works" };
  }
  const { tag } = data;
  const base = `${tag.name} | Articles | Shu Digital Works`;
  const title =
    page <= 1 ? base : `${tag.name}（${page}ページ目）| Articles | Shu Digital Works`;
  return {
    title,
    description: `タグ「${tag.name}」の記事一覧です。Shu Digital Works（フルスタックエンジニア Shu）が公開する技術ブログ記事のうち、${tag.name}に関連するトピックをまとめています。`,
  };
}

export default async function ArticlesTagArchivePage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parsePaginationPage(sp.page);

  const [sidebar, archive] = await Promise.all([
    getArticlesSidebarBundle(),
    getTagArchivePage(slug, page),
  ]);

  if (archive === null) {
    notFound();
  }

  const { tag, posts: pagePosts, totalPages, totalCount } = archive;

  if (page > totalPages) {
    notFound();
  }

  const paginationPath = `/articles/tag/${tag.slug}`;

  const leading = (
    <h3 className="mb-4 flex flex-wrap items-center gap-1 text-2xl font-bold tracking-[0.075em] text-black max-md:text-xl max-[430px]:text-lg max-[360px]:text-[1.1rem]">
      {/* eslint-disable-next-line @next/next/no-img-element -- サイドバー「タグ」と同じ装飾 SVG */}
      <img
        src="/images/articles/tag-icon.svg"
        alt=""
        width={20}
        height={20}
        className="h-5 w-5 shrink-0"
        aria-hidden
      />
      <span className="max-[430px]:hidden">タグ：</span>
      <span className="break-all">{tag.name}</span>
      <span className="whitespace-nowrap">（{totalCount}件）</span>
    </h3>
  );

  return (
    <>
      <SubHeader
        variant="articles"
        title="Articles"
        subtitle={tag.name}
      />
      <div className="mx-auto max-w-[1232px] px-4 pb-32 md:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Top", href: "/" },
            { label: "Articles", href: "/articles" },
            { label: tag.name },
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
