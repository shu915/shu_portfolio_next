import { ArticleListItem } from "@/components/ui/ArticleListItem";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EditorialUnderlineLink } from "@/components/ui/EditorialUnderlineLink";
import { gqlFetch } from "@/lib/graphql";

const GET_ARTICLES = `
  query GetFrontPageArticles {
    posts(first: 4) {
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
        categories {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;

type PostNode = {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  featuredImage?: {
    node: { sourceUrl: string; altText: string };
  };
  categories?: {
    nodes: { name: string; slug: string }[];
  };
};

/**
 * フロントページ Articles セクション
 *
 * レイアウト:
 *   - SectionTitle（中央: ── 投稿記事 ── + Articles、ダーク版）
 *   - 記事カード（共有 ArticleListItem、16.6rem 固定幅）
 *       Mobile : 1列
 *       Tablet : 2×2 グリッド（grid なので flex-wrap での 3:1 崩れが起きない）
 *       Desktop: 1行 4列
 *   - EditorialUnderlineLink（投稿記事一覧はこちら、ダーク版）
 *       Mobile : 中央寄せ
 *       Tablet+: 右寄せ（cards-block 内で justify-end → rightmost card 右端と縦ラインが揃う）
 *
 * カラムを `16.6rem` 固定で切ることでカードの引き伸ばしを防止。
 * アクセントは **ホバー時の底辺ラインのみ** `variant="soft"`（secondary と primary の color-mix）。
 */
export async function ArticlesSection() {
  const data = await gqlFetch<{ posts: { nodes: PostNode[] } }>(GET_ARTICLES, {
    tags: ["posts"],
  });

  const posts = data.posts.nodes ?? [];

  return (
    <section
      className="bg-primary py-20 md:py-30"
      aria-labelledby="articles-section-title"
    >
      <div className="mx-auto flex max-w-[1232px] flex-col items-center px-4 md:px-6 lg:px-8">
        <SectionTitle
          eyebrow="投稿記事"
          title="Articles"
          id="articles-section-title"
          tone="dark"
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
            {posts.map((post, index) => (
              <li key={post.id}>
                <ArticleListItem
                  href={`/articles/${post.slug}`}
                  variant="soft"
                  title={post.title}
                  date={post.date}
                  excerpt={post.excerpt
                    .replace(/<[^>]*>/g, " ")
                    .replace(/\s+/g, " ")
                    .trim()}
                  thumbnailUrl={post.featuredImage?.node.sourceUrl}
                  thumbnailAlt={post.featuredImage?.node.altText}
                  categoryName={post.categories?.nodes[0]?.name}
                  priority={index === 0}
                />
              </li>
            ))}
          </ul>

          <div className="mt-12 flex justify-center md:mt-14 md:justify-end">
            <EditorialUnderlineLink
              href="/articles"
              ariaLabel="投稿記事一覧を見る"
              tone="dark"
            >
              投稿記事一覧はこちら
            </EditorialUnderlineLink>
          </div>
        </div>
      </div>
    </section>
  );
}
