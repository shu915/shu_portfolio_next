import type { NextConfig } from "next";

const WORDPRESS_HOSTNAME = (() => {
  try {
    const url = process.env.NEXTJS_WORDPRESS_GRAPHQL_URL;
    return url
      ? new URL(url).hostname
      : "api.shu-digital-works.com";
  } catch {
    return "api.shu-digital-works.com";
  }
})();

const isDev = process.env.NODE_ENV === "development";

/**
 * WordPress が .local ドメインの間は本番モードでも画像最適化をスキップする。
 * プライベートIPに解決されるため、Next.js のセキュリティブロックにかかるため。
 * 本番サーバーに公開ドメインの WordPress を使う場合は自動的に最適化が有効になる。
 */
const isLocalWordPress = WORDPRESS_HOSTNAME.endsWith(".local") ||
  WORDPRESS_HOSTNAME === "localhost";

const nextConfig: NextConfig = {
  images: {
    unoptimized: isDev || isLocalWordPress,
    remotePatterns: [
      {
        protocol: "http",
        hostname: WORDPRESS_HOSTNAME,
      },
      {
        protocol: "https",
        hostname: WORDPRESS_HOSTNAME,
      },
    ],
  },
};

export default nextConfig;
