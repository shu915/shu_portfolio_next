import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SubHeader } from "@/components/ui/SubHeader";
import { WorkDetailRelated } from "@/components/works/WorkDetailRelated";
import { WorkSingleMain } from "@/components/works/WorkSingleMain";
import { WorksPageShell } from "@/components/works/WorksPageShell";
import { stripExcerptHtml } from "@/lib/articles-archive";
import { getRelatedWorks } from "@/lib/work-related";
import { previewOptionsFromSearchParams } from "@/lib/draft-signature";
import { ogFromFeaturedImage } from "@/lib/og-metadata";
import { getWorkBySlug } from "@/lib/work-single";
import { noSidebarMainClassName } from "@/lib/no-sidebar-main";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWorkBySlug(
    slug,
    previewOptionsFromSearchParams(await searchParams)
  );
  if (!work) {
    return { title: "制作実績が見つかりません | Shu Digital Works" };
  }
  const excerpt = work.excerpt ? stripExcerptHtml(work.excerpt) : undefined;
  const imageAlt =
    work.featuredImage?.node.altText?.trim() || work.title || "Shu Digital Works";
  return {
    title: `${work.title} | Shu Digital Works`,
    description: excerpt?.slice(0, 160) || undefined,
    ...ogFromFeaturedImage(work.featuredImage?.node.sourceUrl, imageAlt),
  };
}

export default async function WorkSinglePage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const work = await getWorkBySlug(
    slug,
    previewOptionsFromSearchParams(await searchParams)
  );
  if (!work) {
    notFound();
  }

  const relatedWorks = await getRelatedWorks(work.id);

  return (
    <WorksPageShell>
      <SubHeader variant="works" title="Works" subtitle="制作実績" />
      <div className="mx-auto max-w-[1232px] px-4 pb-32 md:px-6 lg:px-8">
        <Breadcrumbs
          items={[
            { label: "Top", href: "/" },
            { label: "Works", href: "/works" },
            { label: work.title },
          ]}
        />
        <div className={noSidebarMainClassName}>
          <WorkSingleMain work={work} />
        </div>
        <WorkDetailRelated works={relatedWorks} />
      </div>
    </WorksPageShell>
  );
}
