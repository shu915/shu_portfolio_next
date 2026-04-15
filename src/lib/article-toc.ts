import type { HTMLElement as ParserHTMLElement } from "node-html-parser";

export type ArticleTocItem = {
  level: number;
  id: string;
  text: string;
};

/**
 * パース済み本文から h2〜h6 を拾い目次用データを作る。
 * id が無い見出しには `toc-heading-n` を付与する（アンカー用）。
 */
export function extractArticleTocItems(root: ParserHTMLElement): ArticleTocItem[] {
  const headings = root.querySelectorAll("h2, h3, h4, h5, h6");
  const tocItems: ArticleTocItem[] = [];
  let autoId = 0;

  for (const h of headings) {
    const level = Number.parseInt(h.tagName[1] ?? "2", 10);
    let id = h.getAttribute("id")?.trim();
    if (!id) {
      id = `toc-heading-${autoId++}`;
      h.setAttribute("id", id);
    }
    const text = h.textContent?.trim() ?? "";
    if (text) {
      tocItems.push({ level, id, text });
    }
  }

  return tocItems;
}

export type TocTreeNode = {
  item: ArticleTocItem;
  children: TocTreeNode[];
};

/** フラットな見出し一覧からネストしたツリーへ（ネストした ol 用） */
export function flatTocToTree(items: ArticleTocItem[]): TocTreeNode[] {
  const root: TocTreeNode[] = [];
  const stack: TocTreeNode[] = [];

  for (const item of items) {
    const node: TocTreeNode = { item, children: [] };
    while (stack.length > 0 && stack[stack.length - 1].item.level >= item.level) {
      stack.pop();
    }
    if (stack.length === 0) {
      root.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }
    stack.push(node);
  }

  return root;
}
