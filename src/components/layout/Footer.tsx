import Link from "next/link";
import navStyles from "@/styles/layout/navUnderline.module.css";

const NAV_LINKS = [
  { label: "Top", href: "/" },
  { label: "Works", href: "/works" },
  { label: "Articles", href: "/articles" },
  { label: "Profile", href: "/profile" },
  { label: "Contact", href: "/contact" },
] as const;

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="bg-primary text-white pt-6 min-h-40 max-md:min-h-100">
      <div className="mx-auto max-w-[1232px] px-4 md:px-6 lg:px-8">
        {/* 上段：サイトタイトル + ナビ */}
        <div className="flex justify-between items-center max-md:flex-col max-md:items-start">
          <h2 className="text-white text-[1.875rem] font-medium tracking-[0.03em] font-cormorant">
            <Link href="/">Shu Digital Works</Link>
          </h2>
          <nav aria-label="フッターナビゲーション">
            <ul className="flex items-center gap-6 lg:gap-8 max-md:flex-col max-md:items-start max-md:mt-6 max-md:gap-4">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={`${navStyles.navUnderline} text-white text-[1.25rem] font-medium tracking-[0.03em] font-cormorant`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* 下段：コピーライト */}
        <div className="text-center mt-6 max-md:text-left">
          <small className="text-[0.9rem] tracking-[0.05rem]">
            ©︎Shu Digital Works {CURRENT_YEAR}
          </small>
        </div>
      </div>
    </footer>
  );
}
