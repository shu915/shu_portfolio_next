/**
 * 旧サイト（パーマリンクがドメイン直下 `/{slug}`）からの移行用に、
 * 記事・Works・直下固定ページのスラッグ一覧を取得し middleware 用の TS を生成する。
 *
 * 使い方: リポジトリルートで
 *   npm run generate:legacy-root-slugs
 * （`.env.local` / `.env` をこのスクリプトが読みます。Next 本体と同様の変数を使えます）
 * または Vercel の Build Command 先頭に同コマンドを足す。
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

/** `next dev` とは別プロセスのため、`.env*` を自前で読む */
function loadDotenvFiles() {
  const root = process.cwd();
  for (const name of [".env.local", ".env"]) {
    const p = resolve(root, name);
    if (!existsSync(p)) continue;
    const text = readFileSync(p, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (!key || process.env[key] !== undefined) continue;
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

loadDotenvFiles();

const url = process.env.NEXTJS_WORDPRESS_GRAPHQL_URL;
const secret = process.env.NEXTJS_WORDPRESS_GRAPHQL_SECRET;

if (!url?.trim()) {
  console.error(
    "NEXTJS_WORDPRESS_GRAPHQL_URL が未設定です。.env.local または .env に記載し、リポジトリルートで実行してください。"
  );
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  ...(secret ? { "X-GraphQL-Secret": secret } : {}),
};

async function gql(query, variables) {
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(json).slice(0, 500)}`);
  }
  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }
  return json.data;
}

function singleSegmentFromUri(uri) {
  if (uri == null || typeof uri !== "string") return null;
  const trimmed = uri.replace(/^\/+|\/+$/g, "");
  if (!trimmed || trimmed.includes("/")) return null;
  return trimmed;
}

async function collectAllSlugs(connectionField, nodeFields) {
  const slugs = [];
  let after = null;
  let hasNextPage = true;
  const query = `
    query LegacySlugs($after: String) {
      ${connectionField}(first: 100, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes { ${nodeFields} }
      }
    }
  `;
  while (hasNextPage) {
    const data = await gql(query, { after });
    const conn = data[connectionField];
    const nodes = conn?.nodes ?? [];
    for (const n of nodes) {
      if (n?.slug && typeof n.slug === "string") {
        slugs.push(n.slug);
      }
    }
    hasNextPage = conn?.pageInfo?.hasNextPage ?? false;
    after = conn?.pageInfo?.endCursor ?? null;
  }
  return slugs;
}

async function collectRootPageUriSegments() {
  const segments = new Set();
  let after = null;
  let hasNextPage = true;
  const query = `
    query LegacyPageUris($after: String) {
      pages(first: 100, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes { uri }
      }
    }
  `;
  while (hasNextPage) {
    const data = await gql(query, { after });
    const conn = data.pages;
    for (const n of conn?.nodes ?? []) {
      const seg = singleSegmentFromUri(n?.uri);
      if (seg) segments.add(seg);
    }
    hasNextPage = conn?.pageInfo?.hasNextPage ?? false;
    after = conn?.pageInfo?.endCursor ?? null;
  }
  return segments;
}

function uniqueSorted(arr) {
  return [...new Set(arr)].sort((a, b) => a.localeCompare(b));
}

async function main() {
  const [postSlugs, workSlugs, pageRoot] = await Promise.all([
    collectAllSlugs("posts", "slug"),
    collectAllSlugs("works", "slug"),
    collectRootPageUriSegments(),
  ]);

  const pageRootArr = uniqueSorted([...pageRoot]);

  const postRedirects = uniqueSorted(
    postSlugs.filter((s) => !pageRoot.has(s))
  );
  const workRedirects = uniqueSorted(
    workSlugs.filter((s) => !pageRoot.has(s))
  );

  const inBoth = postRedirects.filter((s) => workRedirects.includes(s));
  const workFinal = workRedirects.filter((s) => !inBoth.includes(s));
  if (inBoth.length) {
    console.warn(
      "[legacy-root-slugs] 記事と Works で同一スラッグ（記事へリダイレクト）:",
      inBoth.join(", ")
    );
  }

  const ts = `/**
 * 自動生成（scripts/generate-legacy-root-slugs.mjs）— 手編集しない
 * 旧パス \`/{slug}\` を \`/articles/{slug}\` / \`/works/{slug}\` へ寄せる middleware 用
 */
export const LEGACY_ROOT_PAGE_URI_SEGMENTS = new Set<string>([
${pageRootArr.map((s) => `  ${JSON.stringify(s)},`).join("\n")}
]);

export const LEGACY_ROOT_POST_SLUGS = new Set<string>([
${postRedirects.map((s) => `  ${JSON.stringify(s)},`).join("\n")}
]);

export const LEGACY_ROOT_WORK_SLUGS = new Set<string>([
${workFinal.map((s) => `  ${JSON.stringify(s)},`).join("\n")}
]);
`;

  const out = resolve("src/lib/legacy-root-redirect-slugs.generated.ts");
  writeFileSync(out, ts, "utf8");
  console.log(
    `Wrote ${out} (pages@${pageRootArr.length}, posts@${postRedirects.length}, works@${workFinal.length})`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
