import type { MetadataRoute } from "next";
import { gqlFetch } from "@/lib/graphql";

const CHUNK = 100;

function siteBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw && /^https?:\/\//i.test(raw)) {
    return raw.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

/** スラッグの `/` 区切りに `encodeURIComponent` を当て、サイト内パス用の URL を作る */
function pathWithEncodedSegments(
  baseWithPath: string,
  slugOrPath: string,
): string {
  const b = baseWithPath.replace(/\/$/, "");
  const parts = slugOrPath.split("/").filter(Boolean);
  if (parts.length === 0) {
    return b;
  }
  return `${b}/${parts.map((p) => encodeURIComponent(p)).join("/")}`;
}

const GET_POSTS_SITEMAP_CHUNK = `
  query SitemapPostsChunk($size: Int!, $offset: Int!) {
    posts(where: { offsetPagination: { size: $size, offset: $offset } }) {
      pageInfo {
        offsetPagination {
          hasMore
        }
      }
      nodes {
        slug
        modified
        date
      }
    }
  }
`;

const GET_WORKS_SITEMAP_CHUNK = `
  query SitemapWorksChunk($size: Int!, $offset: Int!) {
    works(where: { offsetPagination: { size: $size, offset: $offset } }) {
      pageInfo {
        offsetPagination {
          hasMore
        }
      }
      nodes {
        slug
        modified
      }
    }
  }
`;

const GET_TAXONOMIES_SITEMAP = `
  query SitemapTaxonomies {
    categories(first: 100, where: { hideEmpty: true }) {
      nodes {
        slug
      }
    }
    tags(first: 100, where: { hideEmpty: true }) {
      nodes {
        slug
      }
    }
  }
`;

const GET_PAGES_URIS = `
  query SitemapPageUris {
    pages(first: 200, where: { status: PUBLISH }) {
      nodes {
        uri
        modified
      }
    }
  }
`;

type PostSlugRow = {
  slug: string;
  modified: string | null;
  date: string | null;
};
type WorkSlugRow = { slug: string; modified: string | null };

async function fetchAllPostRows(): Promise<PostSlugRow[]> {
  const out: PostSlugRow[] = [];
  let offset = 0;
  for (;;) {
    const data = await gqlFetch<{
      posts: {
        nodes: PostSlugRow[];
        pageInfo: { offsetPagination: { hasMore: boolean } | null } | null;
      };
    }>(GET_POSTS_SITEMAP_CHUNK, {
      variables: { size: CHUNK, offset },
      tags: ["posts"],
    });
    const nodes = data.posts?.nodes ?? [];
    for (const n of nodes) {
      if (n.slug) {
        out.push(n);
      }
    }
    if (nodes.length < CHUNK) {
      break;
    }
    if (!data.posts?.pageInfo?.offsetPagination?.hasMore) {
      break;
    }
    offset += CHUNK;
  }
  return out;
}

async function fetchAllWorkRows(): Promise<WorkSlugRow[]> {
  const out: WorkSlugRow[] = [];
  let offset = 0;
  for (;;) {
    const data = await gqlFetch<{
      works: {
        nodes: WorkSlugRow[];
        pageInfo: { offsetPagination: { hasMore: boolean } | null } | null;
      };
    }>(GET_WORKS_SITEMAP_CHUNK, {
      variables: { size: CHUNK, offset },
      tags: ["works"],
    });
    const nodes = data.works?.nodes ?? [];
    for (const n of nodes) {
      if (n.slug) {
        out.push(n);
      }
    }
    if (nodes.length < CHUNK) {
      break;
    }
    if (!data.works?.pageInfo?.offsetPagination?.hasMore) {
      break;
    }
    offset += CHUNK;
  }
  return out;
}

function yearMonthArchivePaths(
  base: string,
  dates: string[],
): MetadataRoute.Sitemap {
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  const seen = new Set<string>();
  const items: MetadataRoute.Sitemap = [];

  for (const iso of dates) {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    if (y > cy || (y === cy && m > cm)) {
      continue;
    }
    const key = `${y}-${String(m).padStart(2, "0")}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    const path = `${base}/articles/archive/${y}/${String(m).padStart(2, "0")}`;
    items.push({
      url: path,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    });
  }
  return items;
}

/**
 * 公開用サイトマップ。Next.js の MetadataRoute 形式で返す（`/sitemap.xml`）
 */
export async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteBaseUrl();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/articles`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/works`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/profile`, changeFrequency: "yearly", priority: 0.6 },
  ];

  const [postRows, workRows, taxonomies, fromPages] = await Promise.all([
    fetchAllPostRows(),
    fetchAllWorkRows(),
    gqlFetch<{
      categories: { nodes: { slug: string }[] };
      tags: { nodes: { slug: string }[] };
    }>(GET_TAXONOMIES_SITEMAP, { tags: ["posts"] }),
    fetchSitemapPageNodes(),
  ]);

  const postDatesForArchives = postRows
    .map((r) => r.date)
    .filter((d): d is string => Boolean(d));

  const fromPosts: MetadataRoute.Sitemap = postRows.map((row) => ({
    url: pathWithEncodedSegments(`${base}/articles`, row.slug),
    lastModified: row.modified
      ? new Date(row.modified)
      : undefined,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const fromWorks: MetadataRoute.Sitemap = workRows.map((row) => ({
    url: pathWithEncodedSegments(`${base}/works`, row.slug),
    lastModified: row.modified
      ? new Date(row.modified)
      : undefined,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const catNodes = taxonomies.categories?.nodes ?? [];
  const fromCategories: MetadataRoute.Sitemap = catNodes.map((c) => ({
    url: pathWithEncodedSegments(`${base}/articles/category`, c.slug),
    changeFrequency: "weekly" as const,
    priority: 0.55,
  }));

  const tagNodes = taxonomies.tags?.nodes ?? [];
  const fromTags: MetadataRoute.Sitemap = tagNodes.map((t) => ({
    url: pathWithEncodedSegments(`${base}/articles/tag`, t.slug),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const archiveEntries = yearMonthArchivePaths(
    base,
    postDatesForArchives
  );

  const merged: MetadataRoute.Sitemap = [
    ...staticEntries,
    ...fromPosts,
    ...fromWorks,
    ...fromCategories,
    ...fromTags,
    ...archiveEntries,
    ...fromPages,
  ];

  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>();
  for (const item of merged) {
    if (item.url && !byUrl.has(item.url)) {
      byUrl.set(item.url, item);
    }
  }
  return Array.from(byUrl.values());
}

async function fetchSitemapPageNodes(): Promise<MetadataRoute.Sitemap> {
  try {
    const data = await gqlFetch<{
      pages: {
        nodes: { uri: string | null; modified: string | null }[] | null;
      } | null;
    }>(GET_PAGES_URIS, { tags: ["pages"] });
    const base = siteBaseUrl();
    const out: MetadataRoute.Sitemap = [];
    for (const p of data.pages?.nodes ?? []) {
      const uri = p.uri?.replace(/^\/+|\/+$/g, "") ?? "";
      if (!uri) {
        continue;
      }
      out.push({
        url: pathWithEncodedSegments(base, uri),
        lastModified: p.modified ? new Date(p.modified) : undefined,
        changeFrequency: "monthly" as const,
        priority: 0.55,
      });
    }
    return out;
  } catch {
    return [];
  }
}
