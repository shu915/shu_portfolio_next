import { notFound } from "next/navigation";
import { GET_POST_BY_SLUG_QUERY } from "@/lib/article-single";
import { gqlFetchRaw } from "@/lib/graphql";

type PageProps = {
  searchParams: Promise<{ slug?: string }>;
};

/**
 * 開発時のみ: WPGraphQL の生レスポンスを確認する
 * 例: /debug/graphql?slug=hello-world
 */
export default async function DebugGraphqlPage({ searchParams }: PageProps) {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { slug } = await searchParams;
  const trimmed = slug?.trim();

  let result: Awaited<ReturnType<typeof gqlFetchRaw>> | null = null;
  if (trimmed) {
    result = await gqlFetchRaw(GET_POST_BY_SLUG_QUERY, { slug: trimmed });
  }

  const jsonText =
    result === null
      ? ""
      : JSON.stringify(result.body, null, 2);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 font-mono text-sm">
      <h1 className="mb-2 text-lg font-sans font-semibold">
        GraphQL デバッグ（開発のみ）
      </h1>
      <p className="mb-6 font-sans text-xs text-neutral-600">
        記事単体取得クエリ（GetPostBySlug）の HTTP レスポンス本文をそのまま表示します。
        本番ビルドでは 404 です。
      </p>

      <form
        action="/debug/graphql"
        method="get"
        className="mb-6 flex flex-wrap items-end gap-2 font-sans"
      >
        <label className="flex flex-col gap-1 text-xs">
          <span className="text-neutral-600">slug</span>
          <input
            type="text"
            name="slug"
            defaultValue={trimmed ?? ""}
            placeholder="投稿スラッグ"
            className="min-w-[16rem] rounded border border-neutral-300 px-2 py-1.5 text-sm"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-neutral-800 px-3 py-1.5 text-sm text-white hover:bg-neutral-700"
        >
          取得
        </button>
      </form>

      {result && (
        <p className="mb-2 text-xs text-neutral-600">
          HTTP {result.httpStatus} {result.httpOk ? "OK" : "(status を確認)"}
        </p>
      )}

      {trimmed && result && (
        <pre className="max-h-[calc(100vh-12rem)] overflow-auto whitespace-pre-wrap break-words rounded border border-neutral-200 bg-neutral-50 p-3 text-xs leading-relaxed">
          {jsonText}
        </pre>
      )}

      {!trimmed && (
        <p className="font-sans text-xs text-neutral-500">
          slug を入れて取得してください。
        </p>
      )}
    </div>
  );
}
