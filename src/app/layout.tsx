import type { Metadata } from "next";
import { Cormorant_Garamond, Noto_Serif_JP } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "900"],
});

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
        url: "/images/front-page/front-page-main-visual-pc-1920.webp",
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
      className={`${cormorantGaramond.variable} ${notoSerifJP.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <Header />
        {/* ヘッダーが fixed のため、コンテンツ上部に同じ高さの余白を確保 */}
        <main className="flex-1 mt-15">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
