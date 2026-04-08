import Link from "next/link";
import { gql } from "@apollo/client";
import { query } from "@/lib/apollo-client";
import { ArticleListItem } from "@/components/ui/ArticleListItem";

const GET_ARTICLES = gql`
  query GetFrontPageArticles {
    posts(first: 3) {
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

/** フロントページに表示するカテゴリリンク（WordPress に合わせて固定） */
const CATEGORY_LINKS = [
  { label: "プログラミング", slug: "programming" },
  { label: "準備中", slug: "design" },
  { label: "準備中", slug: "business" },
] as const;

/**
 * フロントページ Articles セクション
 * - 左: 最新3件の一般投稿カード（WPGraphQL から取得）
 * - 右: セクションタイトル・カテゴリリンク・All Articles ボタン
 * - 1239px 以下でカラム切り替え（右カラムは display:contents で親のflexに合流）
 */
export async function ArticlesSection() {
  const { data } = await query<{ posts: { nodes: PostNode[] } }>({
    query: GET_ARTICLES,
  });

  const posts = data?.posts.nodes ?? [];

  return (
    <section className="py-20 bg-primary" aria-labelledby="articles-section-title">
      <div className="max-w-[1232px] mx-auto px-8 md:px-6 max-md:px-4">
        <div className="flex justify-between gap-12 items-start max-[1239px]:flex-col max-[1239px]:items-center max-[1239px]:gap-6">

          {/* 記事カードリスト（3列）*/}
          <ul className="flex justify-between gap-10 max-[1239px]:order-2 max-[1239px]:gap-6 max-[899px]:flex-col max-[899px]:items-center max-[899px]:w-[16.6rem]">
            {posts.map((post) => (
              <li key={post.id} className="w-[16.6rem] shrink-0">
                <ArticleListItem
                  href={`/articles/${post.slug}`}
                  title={post.title}
                  date={post.date}
                  excerpt={post.excerpt.replace(/<[^>]*>/g, "")}
                  thumbnailUrl={post.featuredImage?.node.sourceUrl}
                  thumbnailAlt={post.featuredImage?.node.altText}
                  categoryName={post.categories?.nodes[0]?.name}
                />
              </li>
            ))}
          </ul>

          {/*
           * 右カラム：1239px 以下では display:contents になり
           * 子要素が親 flex コンテナに直接参加する（order で並び順制御）
           */}
          <div className="max-[1239px]:contents">

            {/* セクションタイトル + カテゴリ */}
            <div className="max-[1239px]:order-1">
              <h2
                id="articles-section-title"
                className="section-title section-title--secondary text-[2.25rem] font-bold font-(family-name:--font-cormorant) tracking-[0.15em] max-[1239px]:mx-auto"
              >
                Articles
              </h2>

              <div className="mt-6">
                <h3 className="text-[1.25rem] font-bold tracking-widest text-white font-(family-name:--font-cormorant) max-[1239px]:text-center">
                  Category
                </h3>
                <ul className="mt-3 flex flex-col gap-4 max-[1239px]:flex-row max-[767px]:flex-col max-[767px]:items-start max-[767px]:w-fit max-[767px]:mx-auto">
                  {CATEGORY_LINKS.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/articles/category/${cat.slug}`}
                        className="text-base font-semibold bg-secondary text-primary rounded px-[0.7rem] py-1 tracking-widest transition-colors duration-300 hover:bg-white hover:text-primary"
                      >
                        {cat.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* All Articles ボタン */}
            <div className="mt-8 max-[1239px]:order-3 max-[1239px]:ml-auto max-[1239px]:mt-4 max-[767px]:mx-auto">
              <Link href="/articles" className="arrow-button arrow-button--white">
                All Articles
              </Link>
              <p className="text-[0.875rem] leading-none mt-2 tracking-[0.05em] text-white">
                投稿記事一覧はこちら
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
