import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/og-metadata";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

/** Google Fonts を `<head>` で読み込み（preconnect で接続を先行）。フォント名は globals.css の @theme と一致 */
const GOOGLE_FONTS_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Shippori+Mincho:wght@400;500;600;700;800&display=swap";

const siteUrlRaw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const metadataBaseUrl =
  siteUrlRaw && /^https?:\/\//i.test(siteUrlRaw)
    ? siteUrlRaw.replace(/\/$/, "")
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: "Shu Digital Works",
  description:
    "フルスタックエンジニア Shu のポートフォリオサイトです。開発実務の知見やプロジェクト実績、技術ブログを掲載しています。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "Shu Digital Works",
    images: [
      {
        url: DEFAULT_OG_IMAGE_PATH,
        alt: "Shu Digital Works",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className="scroll-pt-18"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href={GOOGLE_FONTS_STYLESHEET} />
      </head>
      <body
        className="flex min-h-screen flex-col bg-white font-shippori-mincho text-base leading-[1.6] text-body"
      >
        <NextTopLoader
          color="#E4EBF7"
          height={3}
          showSpinner={false}
          crawlSpeed={200}
          shadow="0 0 10px rgba(33, 30, 85, 0.2)"
          zIndex={40}
        />
        <Header />
        {/* ヘッダーが fixed のため、コンテンツ上部に同じ高さの余白を確保 */}
        <main className="flex-1 mt-15">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
