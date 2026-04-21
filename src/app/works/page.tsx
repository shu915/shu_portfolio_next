import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorksArchiveMain } from "@/components/works/WorksArchiveMain";
import { WorksPageShell } from "@/components/works/WorksPageShell";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SubHeader } from "@/components/ui/SubHeader";
import {
  getWorksArchiveOffsetPage,
  WORKS_SERVICE_TAB_TERMS,
} from "@/lib/works-archive";
import { parsePaginationPage } from "@/lib/parse-pagination-page";

function parseService(raw: string | string[] | undefined): string | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v || typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length > 0 ? t : undefined;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[];
    service?: string | string[];
  }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const page = parsePaginationPage(sp.page);
  const serviceSlug = parseService(sp.service);
  const serviceName = serviceSlug
    ? WORKS_SERVICE_TAB_TERMS.find((t) => t.slug === serviceSlug)?.name
    : undefined;

  const titleParts = ["Works"];
  if (serviceName) titleParts.push(serviceName);
  if (page > 1) titleParts.push(`${page}ページ目`);
  const title =
    titleParts.length > 1
      ? `${titleParts.join(" · ")} | Shu Digital Works`
      : "Works | Shu Digital Works";

  return {
    title,
    description: "制作実績一覧",
  };
}

export default async function WorksPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[];
    service?: string | string[];
  }>;
}) {
  const sp = await searchParams;
  const page = parsePaginationPage(sp.page);
  const serviceSlug = parseService(sp.service);

  const archive = await getWorksArchiveOffsetPage(page, { serviceSlug });

  if (serviceSlug) {
    const slugOk = WORKS_SERVICE_TAB_TERMS.some((t) => t.slug === serviceSlug);
    if (!slugOk) {
      notFound();
    }
  }

  if (archive === null) {
    notFound();
  }

  const { works, totalPages } = archive;

  if (page > totalPages) {
    notFound();
  }

  return (
    <WorksPageShell>
      <SubHeader variant="works" title="Works" subtitle="制作実績" />
      <div className="mx-auto max-w-[1232px] px-4 pb-32 md:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Top", href: "/" }, { label: "Works" }]} />
        <WorksArchiveMain
          works={works}
          currentPage={page}
          totalPages={totalPages}
          activeServiceSlug={serviceSlug}
          serviceTerms={WORKS_SERVICE_TAB_TERMS}
        />
      </div>
    </WorksPageShell>
  );
}
