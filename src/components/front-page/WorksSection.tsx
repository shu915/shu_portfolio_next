import Image from "next/image";
import Link from "next/link";
import { ArticleListItem } from "@/components/ui/ArticleListItem";
import { gqlFetch } from "@/lib/graphql";
import sectionsStyles from "@/styles/front-page/sections.module.css";

const GET_WORKS = `
  query GetWorksPortfolio {
    works(first: 4) {
      nodes {
        id
        title
        slug
        date
        excerpt
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        services {
          nodes {
            name
          }
        }
      }
    }
  }
`;

type WorksNode = {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  featuredImage?: {
    node: { sourceUrl: string; altText: string };
  };
  services?: {
    nodes: { name: string }[];
  };
};

const SERVICE_ITEMS = [
  {
    title: "ランディングページ",
    imageSrc: "/images/front-page/front-page-works-service-item1.svg",
    text: "レスポンシブデザイン、SEO対策、GA4などを駆使し、効果的なランディングページを構築します。ユーザーの関心を引き、コンバージョン率を向上させることで、売上アップに貢献します。",
    href: "/works?service=landing",
  },
  {
    title: "WordPress",
    imageSrc: "/images/front-page/front-page-works-service-item2.svg",
    text: "WordPressを活用して、企業のブランディングを強化するコーポレートサイトを構築します。ブログ投稿機能、問い合わせフォーム、SEO対策を標準装備。企業の魅力を最大限に引き出します。",
    href: "/works?service=wordpress",
  },
  {
    title: "WEBシステム開発",
    imageSrc: "/images/front-page/front-page-works-service-item3.svg",
    text: "モダンな技術スタックを用い、業務用ツールからWEBサービスまで幅広く開発を行います。ECサイト、SNS機能、その他カスタム仕様にも柔軟に対応します。",
    href: "/works?service=system",
  },
] as const;

/**
 * フロントページ Works セクション
 * - サービス紹介3カード（フロントページ固有）
 * - 制作実績ポートフォリオ一覧（WPGraphQL から取得）
 */
export async function WorksSection() {
  const data = await gqlFetch<{ works: { nodes: WorksNode[] } }>(GET_WORKS, {
    tags: ["works"],
  });

  const works = data.works.nodes ?? [];

  return (
    <section
      className="py-20 relative bg-center bg-cover bg-no-repeat max-[900px]:bg-scroll bg-fixed bg-[url('/images/front-page/bg-front.webp')]"
      aria-labelledby="works-section-title"
    >
      <div className="max-w-[1232px] mx-auto px-8 md:px-6 max-md:px-4">
        {/* セクションタイトル */}
        <h2
          id="works-section-title"
          className={`${sectionsStyles.sectionTitle} mx-auto text-[2.25rem] font-bold font-(family-name:--font-cormorant) tracking-[0.15em]`}
        >
          Works
        </h2>

        {/* サービス紹介カード（フロントページ固有） */}
        <ul className="mt-16 flex justify-center gap-6 max-[899px]:flex-col max-[899px]:items-center max-[899px]:px-[0.8rem]">
          {SERVICE_ITEMS.map((item) => (
            <li
              key={item.title}
              className="bg-[#fdfdfd] rounded-sm shadow-[0px_1px_5px_0px_rgba(0,0,0,0.25)] px-4 pt-6 pb-8 w-80 max-w-full max-[899px]:w-96"
            >
              <h3 className="text-center text-[1.25rem] font-bold tracking-[0.03em]">
                {item.title}
              </h3>
              <figure className="mt-5 w-10 h-10 mx-auto">
                <Image
                  src={item.imageSrc}
                  alt={item.title}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </figure>
              <p className="mt-5 text-justify">{item.text}</p>
              <div className="mt-5 w-31 mx-auto">
                <Link
                  href={item.href}
                  className="block text-base font-bold text-white bg-primary px-4 py-2 rounded-3xl w-full text-center tracking-widest transition-colors duration-300 hover:bg-secondary hover:text-black"
                >
                  More
                </Link>
              </div>
            </li>
          ))}
        </ul>

        {/* 制作実績タイトル */}
        <h3 className="flex w-60 bg-white rounded-4xl border border-primary items-center justify-center mx-auto px-0 py-2 mt-13.5 gap-[0.2rem] text-[1.375rem] font-bold tracking-widest">
          <figure className="w-8 h-8">
            <Image
              src="/images/front-page/front-page-works-sub-title.svg"
              alt="制作実績"
              width={32}
              height={32}
              className="w-full h-full align-baseline"
            />
          </figure>
          制作実績
        </h3>
        <p className="w-fit mx-auto mt-4 px-4 py-1 tracking-[0.05em] font-bold text-[clamp(1rem,0.912rem+0.376vw,1.25rem)] text-center">
          当ポートフォリオサイトも
          <br className="hidden max-md:block" />
          実績としてご覧下さい
        </p>

        {/* 制作実績グリッド */}
        <ul className="mt-6 grid grid-cols-4 gap-6 max-[1199px]:grid-cols-2 max-[1199px]:justify-center max-[629px]:grid-cols-1 max-[629px]:w-[16.6rem] max-[629px]:mx-auto">
          {works.map((work, index) => (
            <li key={work.id}>
              <ArticleListItem
                href={`/works/${work.slug}`}
                title={work.title}
                date={work.date}
                excerpt={work.excerpt.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}
                thumbnailUrl={work.featuredImage?.node.sourceUrl}
                thumbnailAlt={work.featuredImage?.node.altText}
                categoryName={work.services?.nodes[0]?.name}
                priority={index === 0}
              />
            </li>
          ))}
        </ul>

        {/* All Works リンク */}
        <div className="mt-6 flex justify-end">
          <div className="mt-2">
            <Link href="/works" className={sectionsStyles.arrowButton}>
              All Works
            </Link>
            <p className="text-[0.875rem] leading-none mt-2 tracking-[0.05em]">
              制作実績一覧はこちら
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
