import { parse } from "node-html-parser";

import { extractArticleTocItems, type ArticleTocItem } from "./article-toc";

/**
 * 記事本文 HTML を表示用に整える（見出しから目次データ取得）。
 * 画像の幅は Gutenberg のマークアップ（figure / img の style 等）をそのまま信頼する。
 */
export function prepareArticleBodyHtml(html: string): {
  html: string;
  tocItems: ArticleTocItem[];
} {
  const root = parse(html);

  const tocItems = extractArticleTocItems(root);

  return { html: root.toString(), tocItems };
}
