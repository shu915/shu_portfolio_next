import {
  flatTocToTree,
  type ArticleTocItem,
  type TocTreeNode,
} from "@/lib/article-toc";
import tocStyles from "@/styles/articles/articleToc.module.css";

type Props = {
  items: ArticleTocItem[];
};

function TocBranch({ nodes }: { nodes: TocTreeNode[] }) {
  if (nodes.length === 0) return null;
  return (
    <ol className={tocStyles.list}>
      {nodes.map((n) => (
        <li key={n.item.id} className={tocStyles.listItem}>
          <a href={`#${n.item.id}`} className={tocStyles.link}>
            {n.item.text}
          </a>
          <TocBranch nodes={n.children} />
        </li>
      ))}
    </ol>
  );
}

/**
 * 記事目次（WP プラグインの HTML ではなく、h2〜h6 から生成したセマンティックな ol）
 */
export function ArticleToc({ items }: Props) {
  if (items.length === 0) return null;
  const tree = flatTocToTree(items);

  return (
    <nav className={tocStyles.root} aria-label="記事の目次">
      <p className={tocStyles.title}>目次</p>
      <TocBranch nodes={tree} />
    </nav>
  );
}
