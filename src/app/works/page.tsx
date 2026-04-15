import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WorksArchiveMain } from "@/components/works/WorksArchiveMain";
import { WorksPageShell } from "@/components/works/WorksPageShell";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SubHeader } from "@/components/ui/SubHeader";
import {
  getWorksArchiveOffsetPage,
  getWorksServiceTerms,
} from "@/lib/works-archive";

export const dynamic = "force-dynamic";

function parsePage(raw: string | string[] | undefined): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = parseInt(v ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.floor(n);
}

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
  const page = parsePage(sp.page);
  const serviceSlug = parseService(sp.service);
  const terms = await getWorksServiceTerms();
  const serviceName = serviceSlug
    ? terms.find((t) => t.slug === serviceSlug)?.name
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
  const page = parsePage(sp.page);
  const serviceSlug = parseService(sp.service);

  const [terms, archive] = await Promise.all([
    getWorksServiceTerms(),
    getWorksArchiveOffsetPage(page, { serviceSlug }),
  ]);

  if (serviceSlug) {
    const slugOk = terms.some((t) => t.slug === serviceSlug);
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
      <div className="mx-auto max-w-[1232px] px-8 pb-32 max-md:px-4 md:px-6">
        <Breadcrumbs items={[{ label: "Top", href: "/" }, { label: "Works" }]} />
        <WorksArchiveMain
          works={works}
          currentPage={page}
          totalPages={totalPages}
          activeServiceSlug={serviceSlug}
          serviceTerms={terms}
        />
      </div>
    </WorksPageShell>
  );
}
