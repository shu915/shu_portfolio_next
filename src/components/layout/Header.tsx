"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import headerStyles from "@/styles/layout/header.module.css";
import navStyles from "@/styles/layout/navUnderline.module.css";

const NAV_LINKS = [
  { label: "Top", href: "/" },
  { label: "Works", href: "/works" },
  { label: "Articles", href: "/articles" },
  { label: "Profile", href: "/profile" },
  { label: "Contact", href: "/contact" },
] as const;

const SITE_TITLE_CLASS =
  "text-white text-[1.875rem] font-medium tracking-[0.03em] font-(family-name:--font-cormorant)";

const NAV_LINK_CLASS = [
  navStyles.navUnderline,
  "text-white text-[1.25rem] font-medium tracking-[0.03em] font-(family-name:--font-cormorant)",
].join(" ");

/**
 * 投稿・Works詳細ページではサイトタイトルを div にする
 * （各ページの記事タイトルが h1 になるため）
 */
function useSinglePage() {
  const pathname = usePathname();
  return pathname.startsWith("/works/") || pathname.startsWith("/articles/");
}

export function Header() {
  const isSinglePage = useSinglePage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const SiteTitleTag = isSinglePage ? "div" : "h1";

  return (
    <header className="bg-primary fixed top-0 left-0 w-full h-15 z-35">
      {/* 内側コンテナ */}
      <div className="flex justify-between items-center h-15 max-w-[1232px] mx-auto px-4 md:px-6 lg:px-8">
        <SiteTitleTag className={SITE_TITLE_CLASS}>
          <Link href="/">Shu Digital Works</Link>
        </SiteTitleTag>

        {/* デスクトップナビ（768px以上で表示） */}
        <nav className="max-md:hidden" aria-label="グローバルナビゲーション">
          <ul className="flex gap-6 lg:gap-8">
            {NAV_LINKS.map(({ label, href }) => (
              <li key={href}>
                <Link href={href} className={NAV_LINK_CLASS}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ハンバーガーボタン（767px以下で表示） */}
        <button
          className="hidden max-md:block relative z-35 w-9 h-[1.2rem] bg-transparent border-none cursor-pointer"
          aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {/* バー2本 */}
          <span className="relative block h-[0.6rem] w-7.5">
            <span
              className={`${headerStyles.bar} left-0 w-full ${
                isMenuOpen ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`${headerStyles.bar} left-0 ${
                isMenuOpen
                  ? "w-full top-1/2 -translate-y-1/2 -rotate-45"
                  : "w-[66%] bottom-0"
              }`}
            />
          </span>
          {!isMenuOpen && (
            <span className="text-[0.75rem] inline-block leading-none relative top-[-0.3rem] font-(family-name:--font-cormorant) text-white">
              MENU
            </span>
          )}
        </button>
      </div>

      {/* モバイルナビ */}
      <nav
        className={`fixed top-15 right-0 w-75 bg-primary z-34 h-screen pt-2 pl-6 pr-6 md:hidden transition-transform duration-300 ease-out ${
          isMenuOpen ? "translate-x-0" : "translate-x-[105%]"
        }`}
        aria-label="モバイルナビゲーション"
        aria-hidden={!isMenuOpen}
      >
        <ul>
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href} className="not-last:border-b not-last:border-white/20">
              <Link
                href={href}
                className="text-[1.25rem] inline-block py-4 px-4 w-full tracking-[0.15rem] font-(family-name:--font-cormorant) text-white text-center transition-colors duration-300 hover:text-white/70"
                onClick={() => setIsMenuOpen(false)}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
