import { ContentBodyHtml } from "@/components/content/ContentBodyHtml";
import { ContentToc } from "@/components/content/ContentToc";
import { prepareContentBodyHtml } from "@/lib/content-body-html";
import type { WpPage } from "@/lib/wp-page";
import articleBodyStyles from "@/styles/articles/articleBody.module.css";

type Props = {
  page: WpPage;
};

/**
 * レガシー `page.php` の `<article class="p-page__article">` 以内
 *（白カード `<main>` はルート側でラップ）
 */
export function WpFixedPageMain({ page }: Props) {
  const prepared = page.content
    ? prepareContentBodyHtml(page.content)
    : { html: "", tocItems: [] };

  return (
    <article className="min-w-0 pt-12">
      <h1 className="text-center text-2xl font-bold tracking-wide text-primary max-md:text-xl md:text-[2rem] md:tracking-[0.075rem]">
        {page.title}
      </h1>
      {prepared.html ? (
        <div className="min-w-0 space-y-8 pt-8">
          {prepared.tocItems.length > 0 && (
            <ContentToc items={prepared.tocItems} />
          )}
          <div className={articleBodyStyles.articleBody}>
            <ContentBodyHtml html={prepared.html} />
          </div>
        </div>
      ) : (
        <p className="min-w-0 pt-8 text-base text-body">
          本文がありません。
        </p>
      )}
    </article>
  );
}
