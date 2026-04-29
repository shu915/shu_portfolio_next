import { ArticleListItem } from "@/components/ui/ArticleListItem";
import { stripExcerptHtml } from "@/lib/articles-archive";
import type { WorksArchiveNode } from "@/lib/works-archive";

type Props = {
  works: WorksArchiveNode[];
};

/**
 * 制作実績シングル下部の関連一覧（レガシー `article-detail-related.php`・`--white`）
 */
export function WorkDetailRelated({ works }: Props) {
  if (works.length === 0) {
    return null;
  }

  return (
    <section
      className="mx-auto mt-32 w-full max-w-260 rounded-lg border border-border-subtle bg-neutral-50 p-8 shadow-[0_0_10px_rgba(0,0,0,0.1)] max-[929px]:mt-24 max-[929px]:max-w-full max-[430px]:p-4"
      aria-labelledby="work-related-heading"
    >
      <h2
        id="work-related-heading"
        className="mx-auto w-fit border-b-4 border-primary pb-1 text-center text-2xl font-bold tracking-widest text-primary"
      >
        関連記事
      </h2>
      <ul className="mx-auto mt-8 grid w-fit grid-cols-[repeat(3,16.6rem)] gap-4 max-[929px]:grid-cols-[16.6rem] max-[929px]:justify-center max-[929px]:gap-8 max-[430px]:w-full max-[430px]:grid-cols-1 max-[430px]:justify-items-center">
        {works.map((item, index) => (
          <li
            key={item.id}
            className="w-full max-w-[16.6rem] max-[430px]:w-full max-[430px]:max-w-[min(100%,16.6rem)] min-w-0 justify-self-center"
          >
            <ArticleListItem
              href={`/works/${item.slug}`}
              title={item.title}
              date={item.date}
              excerpt={stripExcerptHtml(item.excerpt)}
              thumbnailUrl={item.featuredImage?.node.sourceUrl}
              thumbnailAlt={item.featuredImage?.node.altText}
              categoryName={item.services?.nodes[0]?.name}
              priority={index === 0}
              prefetch={false}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
