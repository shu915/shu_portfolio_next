import { withSentryConfig } from "@sentry/nextjs";
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

export default withSentryConfig(nextConfig, {
 // For all available options, see:
 // https://www.npmjs.com/package/@sentry/webpack-plugin#options

 org: "shu-digital-works-org",

 project: "shu-digital-works-next",

 authToken: process.env.SENTRY_AUTH_TOKEN,

 // Only print logs for uploading source maps in CI
 silent: !process.env.CI,

 sourcemaps: {
   disable: !process.env.SENTRY_AUTH_TOKEN?.trim(),
 },

 // For all available options, see:
 // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

 // Upload a larger set of source maps for prettier stack traces (increases build time)
 widenClientFileUpload: true,

 // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
 // This can increase your server load as well as your hosting bill.
 // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
 // side errors will fail.
 // tunnelRoute: "/monitoring",

 webpack: {
   // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
   // See the following for more information:
   // https://docs.sentry.io/product/crons/
   // https://vercel.com/docs/cron-jobs
   automaticVercelMonitors: true,

   // Tree-shaking options for reducing bundle size
   treeshake: {
     // Automatically tree-shake Sentry logger statements to reduce bundle size
     removeDebugLogging: true,
   },
 }
});
