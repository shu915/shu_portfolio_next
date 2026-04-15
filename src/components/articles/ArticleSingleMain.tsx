import Image from "next/image";
import Link from "next/link";
import { ArticleBodyHtml } from "@/components/articles/ArticleBodyHtml";
import { ArticleToc } from "@/components/articles/ArticleToc";
import type { ArticleSinglePost } from "@/lib/article-single";
import { formatDateJa } from "@/lib/format-date-ja";
import { prepareArticleBodyHtml } from "@/lib/article-body-html";
import articleBodyStyles from "@/styles/articles/articleBody.module.css";

type Props = {
  post: ArticleSinglePost;
};

/**
 * 記事本文エリア（タイトル・メタ・サムネ・the_content 相当）
 */
export function ArticleSingleMain({ post }: Props) {
  const category = post.categories?.nodes[0];
  const tags = post.tags?.nodes ?? [];

  const prepared: ReturnType<typeof prepareArticleBodyHtml> = post.content
    ? prepareArticleBodyHtml(post.content)
    : { html: "", tocItems: [] };

  return (
    <article className="min-w-0">
      <h1 className="text-2xl font-bold tracking-wide max-md:text-xl md:text-[2rem] md:tracking-[0.075rem]">
        {post.title}
      </h1>

      <div className="mt-4 flex flex-col gap-4 max-md:gap-3 md:flex-row md:flex-wrap md:items-start md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {category && (
            <Link
              href={`/articles/category/${category.slug}`}
              className="inline-block rounded-sm bg-secondary px-1.5 py-0.5 text-sm font-semibold tracking-widest transition-colors hover:bg-primary hover:text-white"
            >
              {category.name}
            </Link>
          )}
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/articles/tag/${tag.slug}`}
              className="inline-block rounded-sm bg-[#eee] px-1.5 py-0.5 text-sm font-semibold tracking-widest transition-colors hover:bg-primary hover:text-white"
            >
              {tag.name}
            </Link>
          ))}
        </div>
        <div className="flex shrink-0 flex-col gap-1 text-sm tracking-wide text-body md:items-end">
          <span className="inline-flex items-center gap-1">
            <CalendarIcon className="size-4 shrink-0 text-body" aria-hidden />
            <span className="inline-block w-[2.8rem] shrink-0 text-[0.85em] text-body-muted">
              公開日
            </span>
            <time
              className="inline-block min-w-20 tabular-nums"
              dateTime={post.date}
            >
              {formatDateJa(post.date)}
            </time>
          </span>
          <span className="inline-flex items-center gap-1">
            <PencilSquareIcon
              className="size-4 shrink-0 text-body"
              aria-hidden
            />
            <span className="inline-block w-[2.8rem] shrink-0 text-[0.85em] text-body-muted">
              更新日
            </span>
            <time
              className="inline-block min-w-20 tabular-nums"
              dateTime={post.modified}
            >
              {formatDateJa(post.modified)}
            </time>
          </span>
        </div>
      </div>

      {post.featuredImage?.node.sourceUrl && (
        <figure className="relative mt-6 aspect-[1.618/1] w-full overflow-hidden border border-border-subtle bg-secondary">
          <Image
            src={post.featuredImage.node.sourceUrl}
            alt={post.featuredImage.node.altText || post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1232px) calc(100vw - 4rem), 900px"
            priority
          />
        </figure>
      )}

      {post.content ? (
        <div className="mt-8 min-w-0 space-y-8">
          {prepared.tocItems.length > 0 && (
            <ArticleToc items={prepared.tocItems} />
          )}
          <div className={articleBodyStyles.articleBody}>
            <ArticleBodyHtml html={prepared.html} />
          </div>
        </div>
      ) : (
        <p className="mt-8 text-base">本文がありません。</p>
      )}
    </article>
  );
}

/** レガシー fa-regular fa-calendar-days 相当 */
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5"
      />
    </svg>
  );
}

/** レガシー fa-solid fa-pen-to-square 相当 */
function PencilSquareIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
      <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a.75.75 0 0 0-1.5 0v6.75a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h6.75a.75.75 0 0 0 0-1.5H5.25Z" />
    </svg>
  );
}
