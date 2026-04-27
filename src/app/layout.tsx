import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

/** Google Fonts を `<head>` で読み込み（preconnect で接続を先行）。フォント名は globals.css の :root と一致 */
const GOOGLE_FONTS_STYLESHEET =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Noto+Serif+JP:wght@200;300;400;500;600;700;900&display=swap";

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
        url: "/images/front-page/front-page-main-visual-pc-3840.webp",
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
        className="flex min-h-screen flex-col bg-white font-noto-serif-jp text-base leading-[1.6] text-body"
      >
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
