import type { ReactNode } from "react";
import { ArticleListItem } from "@/components/ui/ArticleListItem";
import { Pagination } from "@/components/ui/Pagination";
import type { ArchivePostNode } from "@/lib/articles-types";
import { stripExcerptHtml } from "@/lib/articles-archive";

type Props = {
  posts: ArchivePostNode[];
  currentPage: number;
  totalPages: number;
  /** ページネーションのベース URL（デフォルト `/articles`） */
  paginationPathname?: string;
  /** `?page=` 以外に付与するクエリ（検索の `s` など） */
  paginationSearchParams?: Record<string, string>;
  /** グリッド直上（検索結果見出しなど） */
  leading?: ReactNode;
  /** 0 件のときの文言（デフォルトは一覧向け） */
  emptyMessage?: string;
};

/** 一覧グリッド + ページネーション（見出しは SubHeader に任せる） */
export function ArticlesArchiveMain({
  posts,
  currentPage,
  totalPages,
  paginationPathname = "/articles",
  paginationSearchParams,
  leading,
  emptyMessage = "投稿はまだありません。",
}: Props) {
  return (
    <div>
      {leading}
      {posts.length === 0 ? (
        <p className="text-base">{emptyMessage}</p>
      ) : (
        <>
          <ul className="grid w-full grid-cols-[16.6rem] place-content-center gap-6 min-[620px]:grid-cols-[repeat(2,16.6rem)] min-[930px]:grid-cols-[repeat(3,16.6rem)]">
            {posts.map((post, index) => (
              <li key={post.id} className="w-full min-w-0 justify-self-center">
                <ArticleListItem
                  href={`/articles/${post.slug}`}
                  title={post.title}
                  date={post.date}
                  excerpt={stripExcerptHtml(post.excerpt)}
                  thumbnailUrl={post.featuredImage?.node.sourceUrl}
                  thumbnailAlt={post.featuredImage?.node.altText}
                  categoryName={post.categories?.nodes[0]?.name}
                  priority={index === 0}
                />
              </li>
            ))}
          </ul>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            pathname={paginationPathname}
            searchParams={paginationSearchParams}
          />
        </>
      )}
    </div>
  );
}
