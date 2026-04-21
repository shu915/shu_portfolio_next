import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WpFixedPageMain } from "@/components/fixed-page/WpFixedPageMain";
import { WpFixedPageShell } from "@/components/fixed-page/WpFixedPageShell";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SubHeader } from "@/components/ui/SubHeader";
import { getPageBySlug } from "@/lib/wp-page";
import staticPageStyles from "@/styles/static-page/staticPage.module.css";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

const WP_MISC_META_MAX = 160;
const WP_MISC_META_AFTER_TITLE =
  "Shu Digital Works（フルスタックエンジニア Shu）のサイトで公開している案内・説明です。";

function wpMiscPageMetaDescription(title: string): string {
  const s = `「${title}」。${WP_MISC_META_AFTER_TITLE}`;
  if (s.length <= WP_MISC_META_MAX) return s;
  return s.slice(0, WP_MISC_META_MAX - 1).trimEnd() + "…";
}

/**
 * サブヘッダー英語行用。生の slug は出さず、URL 最終セグメントを見出し風にする。
 * 日本語のみのスラッグなど ASCII が無いときは "Page"。
 */
function subHeaderEnglishFromSegments(segments: string[]): string {
  const raw = segments[segments.length - 1] ?? "";
  let last = raw;
  try {
    last = decodeURIComponent(raw.replace(/\+/g, " "));
  } catch {
    last = raw;
  }
  const ascii = last.replace(/[^\x00-\x7F]/g, "").trim();
  if (!ascii) {
    return "Page";
  }
  const words = ascii
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) {
    return "Page";
  }
  return words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * WordPress 固定ページ（任意スラッグ・階層 URI）。
 * `works` / `articles` / `contact` / `profile` 等の静的ルートより優先度が低く、被らないパスだけここに来る。
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const path = slug.join("/");
  const wpPage = await getPageBySlug(path);
  if (!wpPage) {
    return {
      title: "ページが見つかりません | Shu Digital Works",
      description:
        "お探しのページは Shu Digital Works 上に見つかりませんでした。URL をご確認のうえ、トップまたはメニューからお進みください。",
    };
  }
  return {
    title: `${wpPage.title} | Shu Digital Works`,
    description: wpMiscPageMetaDescription(wpPage.title),
  };
}

export default async function WpFixedPageRoute({ params }: PageProps) {
  const { slug } = await params;
  const path = slug.join("/");
  const wpPage = await getPageBySlug(path);
  if (!wpPage) {
    notFound();
  }

  return (
    <>
      <SubHeader
        variant="page"
        title={subHeaderEnglishFromSegments(slug)}
        subtitle={wpPage.title}
      />
      <WpFixedPageShell>
        <div className="mx-auto max-w-[1232px] px-4 md:px-6 lg:px-8">
          <Breadcrumbs
            items={[{ label: "Top", href: "/" }, { label: wpPage.title }]}
          />
          <main className={staticPageStyles.noSidebarMain}>
            <WpFixedPageMain page={wpPage} />
          </main>
        </div>
      </WpFixedPageShell>
    </>
  );
}
