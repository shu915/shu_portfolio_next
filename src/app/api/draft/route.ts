import { NextRequest, NextResponse } from "next/server";
import { isDraftSignatureValid } from "@/lib/draft-signature";
import { gqlFetch } from "@/lib/graphql";
import { normalizeSlugForWpQuery } from "@/lib/slug-query-variants";

/**
 * WordPress 管理画面「プレビュー」→ `NEXTJS_DRAFT_URL`（本ルート）
 * wp-config の NEXTJS_DRAFT_SECRET と環境変数 NEXTJS_DRAFT_SECRET を一致させる。
 *
 * 認証: クエリ `id`, `type`, `exp`, `sig` のみ（HMAC 対象は id + type + exp。WordPress 側と同一手順）。
 *
 * 成功後: 記事パスへリダイレクト（`preview_id` / `exp` / `sig` を付与。プレビューはこのクエリのみで続行）。
 */

function buildPreviewPath(type: string, slug: string): string | null {
  const decoded = normalizeSlugForWpQuery(slug);
  const normalized = decoded.replace(/^\/+/, "").replace(/\/+$/, "");
  if (normalized === "" || normalized.includes("..")) {
    return null;
  }
  const segments = normalized.split("/").filter(Boolean);
  const encoded = segments.map((s) => encodeURIComponent(s)).join("/");

  switch (type) {
    case "post":
      return `/articles/${encoded}`;
    case "works":
      return `/works/${encoded}`;
    case "page":
      return `/${encoded}`;
    default:
      return null;
  }
}

async function resolveSlugFromWordPressById(
  id: string,
  type: string
): Promise<string | null> {
  const variables = { id };
  try {
    if (type === "post") {
      const data = await gqlFetch<{ post: { slug: string } | null }>(
        `query DraftResolvePostSlug($id: ID!) {
          post(id: $id, idType: DATABASE_ID) { slug }
        }`,
        { variables, cache: "no-store", tags: [], forDraftPreview: true }
      );
      const post = data.post;
      if (!post) {
        return null;
      }
      const s = post.slug?.trim();
      if (s && s.length > 0) {
        return s;
      }
      return id;
    }
    if (type === "works") {
      const data = await gqlFetch<{ work: { slug: string } | null }>(
        `query DraftResolveWorkSlug($id: ID!) {
          work(id: $id, idType: DATABASE_ID) { slug }
        }`,
        { variables, cache: "no-store", tags: [], forDraftPreview: true }
      );
      const work = data.work;
      if (!work) {
        return null;
      }
      const s = work.slug?.trim();
      if (s && s.length > 0) {
        return s;
      }
      return id;
    }
    if (type === "page") {
      const data = await gqlFetch<{ page: { uri: string | null } | null }>(
        `query DraftResolvePageUri($id: ID!) {
          page(id: $id, idType: DATABASE_ID) { uri }
        }`,
        { variables, cache: "no-store", tags: [], forDraftPreview: true }
      );
      const page = data.page;
      if (!page) {
        return null;
      }
      const uri = page.uri?.replace(/^\/+|\/+$/g, "").trim() ?? "";
      if (uri.length > 0) {
        return uri;
      }
      return id;
    }
  } catch {
    return null;
  }
  return null;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const configured = process.env.NEXTJS_DRAFT_SECRET;
  if (!configured) {
    return NextResponse.json(
      { message: "NEXTJS_DRAFT_SECRET が環境変数に設定されていません" },
      { status: 500 }
    );
  }

  const id = request.nextUrl.searchParams.get("id") ?? "";
  const type = request.nextUrl.searchParams.get("type") ?? "";
  const expQ = request.nextUrl.searchParams.get("exp");
  const sigQ = request.nextUrl.searchParams.get("sig");

  if (!id || !type) {
    return NextResponse.json(
      { message: "Missing id or type" },
      { status: 400 }
    );
  }

  if (!expQ || !sigQ) {
    return NextResponse.json(
      { message: "Missing exp or sig" },
      { status: 401 }
    );
  }
  if (!isDraftSignatureValid(id, type, expQ, sigQ, configured)) {
    return NextResponse.json({ message: "Invalid exp/sig" }, { status: 401 });
  }

  const slug = (await resolveSlugFromWordPressById(id, type)) ?? "";
  if (!slug) {
    return NextResponse.json(
      {
        message:
          "Could not resolve slug from WordPress for this id. Save the post with a title/slug or check WPGraphQL.",
      },
      { status: 400 }
    );
  }

  const path = buildPreviewPath(type, slug);
  if (!path) {
    return NextResponse.json(
      { message: "Invalid type or resolved slug" },
      { status: 400 }
    );
  }

  const built = new URL(path, request.nextUrl.origin);
  if (/^\d+$/.test(id)) {
    built.searchParams.set("preview_id", id);
    built.searchParams.set("exp", expQ);
    built.searchParams.set("sig", sigQ);
  }

  const target = request.nextUrl.clone();
  target.pathname = built.pathname;
  target.search = built.search;
  return NextResponse.redirect(target, 302);
}
