import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticlesArchiveLayout } from "@/components/articles/ArticlesArchiveLayout";
import { ArticleSingleMain } from "@/components/articles/ArticleSingleMain";
import { ArticlesSidebar } from "@/components/articles/ArticlesSidebar";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SubHeader } from "@/components/ui/SubHeader";
import { getPostBySlug } from "@/lib/article-single";
import {
  getArticlesSidebarBundle,
  stripExcerptHtml,
} from "@/lib/articles-archive";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "記事が見つかりません | Shu Digital Works" };
  }
  const excerpt = post.excerpt ? stripExcerptHtml(post.excerpt) : undefined;
  return {
    title: `${post.title} | Shu Digital Works`,
    description: excerpt?.slice(0, 160) || undefined,
  };
}

export default async function ArticleSinglePage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  const sidebar = await getArticlesSidebarBundle();
  const { categories, tags, recentPosts, postDates } = sidebar;

  return (
    <>
      <SubHeader variant="articles" title="Articles" subtitle="投稿記事" />
      <div className="mx-auto max-w-[1232px] px-4 pb-32 md:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Top", href: "/" },
            { label: "Articles", href: "/articles" },
            { label: post.title },
          ]}
        />
        <ArticlesArchiveLayout
          main={<ArticleSingleMain post={post} />}
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
