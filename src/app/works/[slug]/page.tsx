import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SubHeader } from "@/components/ui/SubHeader";
import { WorkDetailRelated } from "@/components/works/WorkDetailRelated";
import { WorkSingleMain } from "@/components/works/WorkSingleMain";
import { WorksPageShell } from "@/components/works/WorksPageShell";
import { stripExcerptHtml } from "@/lib/articles-archive";
import { getRelatedWorks } from "@/lib/work-related";
import { getWorkBySlug } from "@/lib/work-single";
import workNoSidebarMainStyles from "@/styles/works/workNoSidebarMain.module.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) {
    return { title: "制作実績が見つかりません | Shu Digital Works" };
  }
  const excerpt = work.excerpt ? stripExcerptHtml(work.excerpt) : undefined;
  return {
    title: `${work.title} | Shu Digital Works`,
    description: excerpt?.slice(0, 160) || undefined,
  };
}

export default async function WorkSinglePage({ params }: PageProps) {
  const { slug } = await params;
  const work = await getWorkBySlug(slug);
  if (!work) {
    notFound();
  }

  const relatedWorks = await getRelatedWorks(work.id);

  return (
    <WorksPageShell>
      <SubHeader variant="works" title="Works" subtitle="制作実績" />
      <div className="mx-auto max-w-[1232px] px-8 pb-32 max-md:px-4 md:px-6">
        <Breadcrumbs
          items={[
            { label: "Top", href: "/" },
            { label: "Works", href: "/works" },
            { label: work.title },
          ]}
        />
        <div className={workNoSidebarMainStyles.noSidebarMain}>
          <WorkSingleMain work={work} />
        </div>
        <WorkDetailRelated works={relatedWorks} />
      </div>
    </WorksPageShell>
  );
}
