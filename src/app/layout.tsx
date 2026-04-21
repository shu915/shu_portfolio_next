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

export const metadata: Metadata = {
  title: "Shu Digital Works",
  description:
    "フルスタックエンジニア Shu のポートフォリオサイトです。開発実務の知見やプロジェクト実績、技術ブログを掲載しています。",
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
