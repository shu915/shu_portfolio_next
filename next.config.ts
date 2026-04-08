import type { NextConfig } from "next";

const WORDPRESS_HOSTNAME = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL
  ? new URL(process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL).hostname
  : "shu-web-creation.local";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  images: {
    /**
     * 開発環境では Next.js の画像最適化サーバーが .local ドメインを
     * 名前解決できず 400 を返すため、最適化をスキップする。
     * 本番環境では通常どおり最適化が有効になる。
     */
    unoptimized: isDev,
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
