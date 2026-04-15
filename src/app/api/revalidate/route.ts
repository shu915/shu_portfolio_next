import {
  DATA_CACHE_TAG_BY_POST_TYPE,
  singleEntryDataCacheTag,
} from "@/lib/cache-tags";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const configuredSecret = process.env.NEXTJS_REVALIDATE_SECRET;
  if (!configuredSecret) {
    throw new Error("NEXTJS_REVALIDATE_SECRET が環境変数に設定されていません");
  }

  const secret = req.headers.get("x-revalidate-secret");
  if (secret !== configuredSecret) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  let postType: string;
  let postSlug: string | undefined;
  try {
    const body: { postType?: string; postSlug?: string } = await req.json();
    postType = body.postType ?? "";
    postSlug =
      typeof body.postSlug === "string" && body.postSlug.length > 0
        ? body.postSlug
        : undefined;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const tag = DATA_CACHE_TAG_BY_POST_TYPE[postType];
  if (!tag) {
    return NextResponse.json(
      { message: `Unknown postType: ${postType}` },
      { status: 400 }
    );
  }

  /** 一覧・フロントのリスト等（`tags: ["posts"]` 系） */
  revalidateTag(tag, { expire: 0 });

  /** 個別記事の fetch（`posts:{slug}`）。`postSlug` があるときだけ明示的に落とす */
  let slugTag: string | null = null;
  if (postSlug) {
    slugTag = singleEntryDataCacheTag(postType, postSlug);
    revalidateTag(slugTag, { expire: 0 });
  }

  return NextResponse.json({
    revalidated: true,
    tag,
    slugTag,
    postSlug: postSlug ?? null,
  });
}
