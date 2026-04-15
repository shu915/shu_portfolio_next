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

/** `?page=` のたびにサーバーで取り直す（一覧キャッシュとクエリの取り違え防止） */
export const dynamic = "force-dynamic";

/*
 * `export const revalidate` は付けない。Next.js 16 では動的ルート（ƒ）と併用すると
 * 「Invalid segment configuration export」でビルドが失敗する。
 * 鮮度のフォールバックは gqlFetch（`@/lib/default-revalidate`）に任せる。
 */

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
      <div className="mx-auto max-w-[1232px] px-8 pb-32 max-md:px-4 md:px-6">
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
