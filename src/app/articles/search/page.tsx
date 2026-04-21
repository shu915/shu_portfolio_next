import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlesArchiveLayout } from "@/components/articles/ArticlesArchiveLayout";
import { ArticlesArchiveMain } from "@/components/articles/ArticlesArchiveMain";
import { ArticlesSidebar } from "@/components/articles/ArticlesSidebar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SubHeader } from "@/components/ui/SubHeader";
import {
  articlesSearchQueryFromSearchParams,
  getArticlesSearchPage,
  getArticlesSidebarBundle,
} from "@/lib/articles-sidebar";
import { parsePaginationPage } from "@/lib/parse-pagination-page";

/** 検索フォームのみ・キーワードなしのときの説明（このファイル内ベタ書き） */
const ARTICLES_SEARCH_INDEX_DESCRIPTION =
  "Shu Digital Works（フルスタックエンジニア Shu）が公開する技術ブログ記事をキーワードで検索できます。フルスタック開発やバックエンド・インフラに関する記事からお探しください。";

type PageProps = {
  searchParams: Promise<{ s?: string | string[]; page?: string | string[] }>;
};

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const sp = await searchParams;
  const q = articlesSearchQueryFromSearchParams(sp.s);
  const page = parsePaginationPage(sp.page);
  if (!q && page > 1) {
    return {
      title: "検索 | Shu Digital Works",
      description: ARTICLES_SEARCH_INDEX_DESCRIPTION,
    };
  }

  const data = await getArticlesSearchPage(q, page);
  if (data === null) {
    return {
      title: "検索 | Shu Digital Works",
      description: ARTICLES_SEARCH_INDEX_DESCRIPTION,
    };
  }

  if (!data.query) {
    return {
      title: "検索 | Articles | Shu Digital Works",
      description: ARTICLES_SEARCH_INDEX_DESCRIPTION,
    };
  }

  const withCount = `「${data.query}」の検索結果（${data.totalCount}件）`;
  const title =
    page <= 1
      ? `${withCount} | Articles | Shu Digital Works`
      : `${withCount}（${page}ページ目）| Articles | Shu Digital Works`;

  return {
    title,
    description: `「${data.query}」を含む記事の検索結果です。Shu Digital Works（フルスタックエンジニア Shu）が公開する技術ブログ記事の該当投稿を一覧しています。`,
  };
}

export default async function ArticlesSearchPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const q = articlesSearchQueryFromSearchParams(sp.s);
  const page = parsePaginationPage(sp.page);

  if (!q && page > 1) {
    notFound();
  }

  const [sidebar, data] = await Promise.all([
    getArticlesSidebarBundle(),
    getArticlesSearchPage(q, page),
  ]);

  if (data === null) {
    notFound();
  }

  const { query, posts, totalPages, totalCount } = data;

  const paginationPath = "/articles/search";
  const paginationSearchParams = query ? { s: query } : undefined;

  const leading = query ? (
    <h3 className="mb-6 flex flex-wrap items-center gap-1 text-2xl font-bold tracking-[0.075em] text-primary max-md:text-xl max-[430px]:text-lg max-[360px]:text-[1.1rem]">
      {/* eslint-disable-next-line @next/next/no-img-element -- サイドバー「検索」と同じ装飾 SVG */}
      <img
        src="/images/articles/sidebar-search-icon.svg"
        alt=""
        width={20}
        height={20}
        className="h-5 w-5 shrink-0"
        aria-hidden
      />
      <span className="max-[430px]:hidden">検索結果：</span>
      <span className="break-all">{query}</span>
      <span className="whitespace-nowrap">（{totalCount}件）</span>
    </h3>
  ) : null;

  const emptyMessage = query
    ? "検索結果がありません。"
    : "キーワードを入力して検索してください。";

  return (
    <>
      <SubHeader variant="search" title="Search" subtitle="検索" />
      <div className="mx-auto max-w-[1232px] px-4 pb-32 md:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Top", href: "/" },
            { label: "Articles", href: "/articles" },
            { label: "検索" },
          ]}
        />
        <ArticlesArchiveLayout
          main={
            <ArticlesArchiveMain
              posts={posts}
              currentPage={page}
              totalPages={totalPages}
              paginationPathname={paginationPath}
              paginationSearchParams={paginationSearchParams}
              leading={leading}
              emptyMessage={emptyMessage}
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
