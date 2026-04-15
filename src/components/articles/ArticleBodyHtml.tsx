import { isTag } from "domhandler";
import parse, {
  attributesToProps,
  domToReact,
  type DOMNode,
  type HTMLReactParserOptions,
} from "html-react-parser";
import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ComponentProps,
  ImgHTMLAttributes,
} from "react";
import { createElement } from "react";
import articleBodyStyles from "@/styles/articles/articleBody.module.css";

type Props = {
  html: string;
};

/** 本文リンクの見た目（articleBody.module.css の .link） */
const LINK_CLASS = articleBodyStyles.link;

function mergeClassName(...parts: (string | undefined)[]): string | undefined {
  const s = parts.filter(Boolean).join(" ");
  return s || undefined;
}

/** `/path` または NEXT_PUBLIC_SITE_URL と同一オリジンの URL をアプリ内遷移とみなす */
function isInternalHref(href: string): boolean {
  if (href.startsWith("/")) return true;
  const base = process.env.NEXT_PUBLIC_SITE_URL;
  if (!base) return false;
  try {
    return new URL(href).origin === new URL(base).origin;
  } catch {
    return false;
  }
}

function toInternalHref(href: string): ComponentProps<typeof Link>["href"] {
  if (href.startsWith("/")) return href;
  try {
    const u = new URL(href);
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return href;
  }
}

/**
 * 個別記事の本文: 先頭の img 1 枚だけ eager（アイキャッチ相当の大きい画像想定）。
 * 2 枚目以降は lazy（WP の loading を上書き）。
 */
function buildParseOptions(): HTMLReactParserOptions {
  let imgIndex = 0;
  const options: HTMLReactParserOptions = {
    replace(domNode) {
      if (isTag(domNode) && domNode.name === "img") {
        const i = imgIndex++;
        const raw = attributesToProps(
          domNode.attribs,
        ) as ImgHTMLAttributes<HTMLImageElement>;
        const src = raw.src;
        if (!src || typeof src !== "string") {
          return createElement("img", raw);
        }

        const isFirst = i === 0;
        return createElement("img", {
          ...raw,
          loading: isFirst ? "eager" : "lazy",
          ...(isFirst ? { fetchPriority: "high" as const } : {}),
          decoding: raw.decoding ?? "async",
        });
      }

      if (!isTag(domNode) || domNode.name !== "a") return undefined;

      const raw = attributesToProps(
        domNode.attribs,
      ) as AnchorHTMLAttributes<HTMLAnchorElement>;
      const { href, className, target, rel, ...rest } = raw;
      const cn = mergeClassName(LINK_CLASS, className);
      const children = domToReact(domNode.children as DOMNode[], options);

      if (!href) {
        return createElement("a", { ...rest, className: cn }, children);
      }

      if (href.startsWith("#")) {
        return createElement("a", { ...rest, href, className: cn }, children);
      }

      if (/^(mailto:|tel:)/i.test(href)) {
        return createElement("a", { ...rest, href, className: cn }, children);
      }

      if (isInternalHref(href)) {
        const path = toInternalHref(href);
        return createElement(
          Link,
          {
            href: path,
            className: cn,
            ...rest,
          } as ComponentProps<typeof Link>,
          children,
        );
      }

      return createElement(
        "a",
        {
          ...rest,
          href,
          className: cn,
          target: target ?? "_blank",
          rel: rel ?? "noopener noreferrer",
        },
        children,
      );
    },
  };
  return options;
}

/**
 * WordPress の the_content 相当 HTML をパースして React ノードとして描画する。
 * リンクは内部を next/link、外部は別タブ＋noopener。
 * img は属性をそのまま渡し、先頭 1 枚だけ fetchPriority=high・loading=eager を上書き。
 */
export function ArticleBodyHtml({ html }: Props) {
  return <>{parse(html, buildParseOptions())}</>;
}
