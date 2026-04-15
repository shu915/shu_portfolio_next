import { ArticleListItem } from "@/components/ui/ArticleListItem";
import { stripExcerptHtml } from "@/lib/articles-archive";
import type { WorksArchiveNode } from "@/lib/works-archive";
import workDetailRelatedStyles from "@/styles/works/workDetailRelated.module.css";

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
      className={workDetailRelatedStyles.related}
      aria-labelledby="work-related-heading"
    >
      <h2
        id="work-related-heading"
        className={workDetailRelatedStyles.title}
      >
        関連記事
      </h2>
      <ul className={workDetailRelatedStyles.items}>
        {works.map((item, index) => (
          <li key={item.id}>
            <ArticleListItem
              href={`/works/${item.slug}`}
              title={item.title}
              date={item.date}
              excerpt={stripExcerptHtml(item.excerpt)}
              thumbnailUrl={item.featuredImage?.node.sourceUrl}
              thumbnailAlt={item.featuredImage?.node.altText}
              categoryName={item.services?.nodes[0]?.name}
              priority={index === 0}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
