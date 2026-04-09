import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * WordPress の webhook を受け取り、該当タグのキャッシュを即時無効化する
 *
 * 呼び出し例（WordPress 側の設定）:
 *   POST https://your-site.com/api/revalidate
 *   Header: x-revalidate-secret: YOUR_SECRET
 *   Body: { "post_type": "post" }  // または "works"
 *
 * 環境変数:
 *   REVALIDATE_SECRET — WordPress 側と共有するシークレットトークン
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret");

  if (!process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { message: "REVALIDATE_SECRET が設定されていません" },
      { status: 500 }
    );
  }

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(
      { message: "Invalid secret" },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => ({})) as { post_type?: string };
  const postType = body.post_type;

  // post_type に応じてタグを選択
  // WordPress カスタム投稿タイプ "works" → works タグ
  // 一般投稿（post）→ posts タグ
  const tag = postType === "works" ? "works" : "posts";
  revalidateTag(tag, "max");

  return NextResponse.json({ revalidated: true, tag });
}
