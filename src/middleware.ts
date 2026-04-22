import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  LEGACY_ROOT_PAGE_URI_SEGMENTS,
  LEGACY_ROOT_POST_SLUGS,
  LEGACY_ROOT_WORK_SLUGS,
} from "@/lib/legacy-root-redirect-slugs.generated";

/**
 * アプリの静的ルート1セグメント（`/{seg}` がここに該当する場合はリダイレクトしない）
 */
const RESERVED_SINGLE_SEGMENTS = new Set([
  "articles",
  "works",
  "contact",
  "profile",
  "debug",
]);

function singlePathSegment(pathname: string): string | null {
  const m = pathname.match(/^\/([^/]+)\/?$/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return m[1];
  }
}

/**
 * 旧 WordPress（`/%postname%/` 等）でドメイン直下だった URL を、
 * Next の `/articles/*`・`/works/*` に 308 で寄せる。
 * 直下1セグメントの固定ページ（WP `pages` の URI が `/slug` のもの）は除外。
 */
export function middleware(request: NextRequest) {
  const seg = singlePathSegment(request.nextUrl.pathname);
  if (!seg) {
    return NextResponse.next();
  }

  if (RESERVED_SINGLE_SEGMENTS.has(seg)) {
    return NextResponse.next();
  }

  if (LEGACY_ROOT_PAGE_URI_SEGMENTS.has(seg)) {
    return NextResponse.next();
  }

  if (LEGACY_ROOT_POST_SLUGS.has(seg)) {
    const url = request.nextUrl.clone();
    url.pathname = `/articles/${encodeURIComponent(seg)}`;
    return NextResponse.redirect(url, 308);
  }

  if (LEGACY_ROOT_WORK_SLUGS.has(seg)) {
    const url = request.nextUrl.clone();
    url.pathname = `/works/${encodeURIComponent(seg)}`;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
