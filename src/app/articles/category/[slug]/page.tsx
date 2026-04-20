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
} from "@/lib/articles-archive";

function parsePage(raw: string | string[] | undefined): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = parseInt(v ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

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
  const page = parsePage(sp.page);
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
    description: `「${category.name}」の記事一覧`,
  };
}

export default async function ArticlesCategoryArchivePage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const page = parsePage(sp.page);

  const [sidebar, archive] = await Promise.all([
    getArticlesSidebarBundle(),
    getCategoryArchivePage(slug, page),
  ]);

  if (archive === null) {
    notFound();
  }

  const { category, posts: pagePosts, totalPages } = archive;

  if (page > totalPages) {
    notFound();
  }

  const paginationPath = `/articles/category/${category.slug}`;

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
