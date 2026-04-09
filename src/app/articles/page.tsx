import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlesArchiveLayout } from "@/components/articles/ArticlesArchiveLayout";
import { ArticlesArchiveMain } from "@/components/articles/ArticlesArchiveMain";
import { ArticlesSidebar } from "@/components/articles/ArticlesSidebar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SubHeader } from "@/components/ui/SubHeader";
import {
  ARTICLES_PER_PAGE,
  getArticlesArchivePageData,
} from "@/lib/articles-archive";

/** ISR: 1時間ごとに再検証（gqlFetch のフォールバックと揃える） */
export const revalidate = 3600;

function parsePage(raw: string | string[] | undefined): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = parseInt(v ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const title =
    page <= 1
      ? "Articles | Shu Digital Works"
      : `Articles（${page}ページ目）| Shu Digital Works`;
  return {
    title,
    description: "投稿記事一覧",
  };
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const sp = await searchParams;
  const page = parsePage(sp.page);

  const { posts: allPosts, categories, tags } =
    await getArticlesArchivePageData();

  const totalPages = Math.max(1, Math.ceil(allPosts.length / ARTICLES_PER_PAGE));

  if (page > totalPages) {
    notFound();
  }

  const start = (page - 1) * ARTICLES_PER_PAGE;
  const pagePosts = allPosts.slice(start, start + ARTICLES_PER_PAGE);

  const recentPosts = allPosts.slice(0, 3);
  const postDates = allPosts.map((p) => p.date);

  return (
    <>
      <SubHeader variant="articles" title="Articles" subtitle="投稿記事" />
      <div className="max-w-[1232px] mx-auto px-8 md:px-6 max-md:px-4 pb-32">
        <Breadcrumbs
          items={[
            { label: "Top", href: "/" },
            { label: "Articles" },
          ]}
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
              recentPosts={recentPosts}
              categories={categories}
              tags={tags}
              postDates={postDates}
            />
          }
        />
      </div>
    </>
  );
}
