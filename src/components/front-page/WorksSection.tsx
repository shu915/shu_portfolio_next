import { ArticleListItem } from "@/components/ui/ArticleListItem";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionMoreLink } from "@/components/ui/SectionMoreLink";
import { stripExcerptHtml } from "@/lib/articles-archive";
import { gqlFetch } from "@/lib/graphql";

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

/**
 * フロントページ Works セクション
 *
 * レイアウト（Articles セクションを踏襲）:
 *   - SectionTitle（中央: ── 制作実績 ── + Works、light tone）
 *   - 制作実績カード（共有 ArticleListItem、16.6rem 固定幅）
 *       Mobile : 1列
 *       Tablet : 2×2 グリッド（flex-wrap での 3:1 崩れを防ぐため grid 固定）
 *       Desktop: 1行 4列
 *   - SectionMoreLink（制作実績一覧はこちら、light tone）
 *       Mobile : 中央寄せ
 *       Tablet+: 右寄せ（cards-block 内で justify-end → rightmost card 右端と縦ラインが揃う）
 *
 * 廃止した旧 UI:
 *   - 上段の3サービス紹介カード（ランディングページ / WordPress / WEBシステム開発）
 *   - リボン型「制作実績」サブタイトル + 「当ポートフォリオサイトも実績としてご覧下さい」説明
 *   - bg-front.webp の背景画像（白背景に変更）
 *
 * Props・GraphQL クエリは変更なし（works first: 4 / services は categoryName に流用）。
 */
export async function WorksSection() {
  const data = await gqlFetch<{ works: { nodes: WorksNode[] } }>(GET_WORKS, {
    tags: ["works"],
  });

  const works = data.works.nodes ?? [];

  return (
    <section
      className="bg-white py-20 md:py-30"
      aria-labelledby="works-section-title"
    >
      <div className="mx-auto flex max-w-[1232px] flex-col items-center px-4 md:px-6 lg:px-8">
        <SectionTitle
          eyebrow="制作実績"
          title="Works"
          id="works-section-title"
        />

        {/*
          cards-block:
          - w-fit でグリッド自体の自然幅（カード列の合計）に合わせる
          - 内側で CTA を justify-end すると rightmost card の右端と縦ラインが一致する
        */}
        <div className="mt-11 w-fit max-w-full md:mt-16">
          <ul
            className={[
              "grid justify-center",
              "grid-cols-[16.6rem] gap-7",
              "md:grid-cols-[repeat(2,16.6rem)] md:gap-8",
              "xl:grid-cols-[repeat(4,16.6rem)] xl:gap-8",
            ].join(" ")}
          >
            {works.map((work) => (
              <li key={work.id}>
                <ArticleListItem
                  href={`/works/${work.slug}`}
                  title={work.title}
                  date={work.date}
                  excerpt={stripExcerptHtml(work.excerpt)}
                  thumbnailUrl={work.featuredImage?.node.sourceUrl}
                  thumbnailAlt={work.featuredImage?.node.altText}
                  categoryName={work.services?.nodes[0]?.name}
                />
              </li>
            ))}
          </ul>

          <div className="mt-12 flex justify-center md:mt-14 md:justify-end">
            <SectionMoreLink
              href="/works"
              ariaLabel="制作実績一覧を見る"
            >
              制作実績一覧はこちら
            </SectionMoreLink>
          </div>
        </div>
      </div>
    </section>
  );
}
