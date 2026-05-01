import { ArticleListItem } from "@/components/ui/ArticleListItem";
import { stripExcerptHtml } from "@/lib/articles-archive";
import type { WorksArchiveNode } from "@/lib/works-archive";

type Props = {
  works: WorksArchiveNode[];
};

/**
 * 制作実績シングル下部の関連一覧。
 * 見出しは A 案。親の白カード（noSidebarMain）内で区切り線のみ—二重の箱にしない。
 */
export function WorkDetailRelated({ works }: Props) {
  if (works.length === 0) {
    return null;
  }

  return (
    <section
      className="mt-12 w-full border-t border-border-subtle pt-10 max-[929px]:mt-10 max-[929px]:pt-8"
      aria-labelledby="work-related-heading"
    >
      {/* 見出し */}
      <div className="text-center">
        <h2
          id="work-related-heading"
          className="font-cormorant text-[1.75rem] font-semibold leading-none tracking-[0.1em] text-primary"
        >
          Related Works
        </h2>
        <div className="mt-2 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-primary opacity-25" aria-hidden />
          <span className="text-[0.8125rem] font-semibold tracking-[0.12em] text-primary/50">
            関連する制作実績
          </span>
          <span className="h-px w-8 bg-primary opacity-25" aria-hidden />
        </div>
      </div>

      {/* グリッド */}
      <ul className="mx-auto mt-8 grid w-fit grid-cols-[repeat(3,16.6rem)] gap-4 max-[929px]:grid-cols-[16.6rem] max-[929px]:justify-center max-[929px]:gap-8 max-[430px]:w-full max-[430px]:grid-cols-1 max-[430px]:justify-items-center">
        {works.map((item, index) => (
          <li key={item.id} className="w-full max-w-[16.6rem] min-w-0">
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
