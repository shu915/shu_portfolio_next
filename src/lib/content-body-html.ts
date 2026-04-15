import { parse } from "node-html-parser";

import {
  extractContentTocItems,
  type ContentTocItem,
} from "@/lib/content-toc";

/**
 * WordPress `the_content` 相当の HTML を表示用に整える（見出しから目次データ取得）。
 * 画像の幅は Gutenberg のマークアップ（figure / img の style 等）をそのまま信頼する。
 */
export function prepareContentBodyHtml(html: string): {
  html: string;
  tocItems: ContentTocItem[];
} {
  const root = parse(html);

  const tocItems = extractContentTocItems(root);

  return { html: root.toString(), tocItems };
}
