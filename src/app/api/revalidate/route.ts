import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * WordPress の post_type → 再検証する Next.js キャッシュタグのマッピング
 * 個別ページタグ（post-[slug] / works-[slug]）は postSlug から動的生成する
 */
const POST_TYPE_LIST_TAGS: Record<string, string[]> = {
  post:  ["posts"],
  works: ["works"],
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const secret = req.headers.get("x-revalidate-secret");

  if (secret !== process.env.NEXTJS_REVALIDATE_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  let postType: string;
  let postSlug: string | undefined;
  try {
    const body = await req.json();
    postType = body.postType;
    postSlug = body.postSlug;
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const listTags = POST_TYPE_LIST_TAGS[postType];
  if (!listTags) {
    return NextResponse.json(
      { message: `Unknown postType: ${postType}` },
      { status: 400 }
    );
  }

  // 一覧・フロントページのタグ
  const tags = [...listTags];

  // 個別ページのタグ（例: works-my-slug）
  if (postSlug) {
    tags.push(`${postType}-${postSlug}`);
  }

  tags.forEach((tag) => revalidateTag(tag, {}));

  return NextResponse.json({ revalidated: true, tags });
}
