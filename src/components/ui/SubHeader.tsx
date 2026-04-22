import Image from "next/image";

/**
 * 各ページ上部のサブヘッダー（背景画像 + タイトル + サブタイトル）
 *
 * 背景は `next/image` + `priority`（LCP）。PC/SP で画像を切り替え。
 */
type Props = {
  variant:
    | "works"
    | "articles"
    | "search"
    | "profile"
    | "contact"
    | "archive"
    | "page";
  title: string;
  /** 英字見出しの下に出す日本語など（固定ページでは WP タイトル） */
  subtitle: string;
};

const BG_BY_VARIANT: Record<
  Props["variant"],
  { pc: string; sp: string } | null
> = {
  articles: {
    pc: "/images/articles/sub-header-articles-pc-1920.webp",
    sp: "/images/articles/sub-header-articles-sp-800.webp",
  },
  search: {
    pc: "/images/search/sub-header-search-pc-1920.webp",
    sp: "/images/search/sub-header-search-sp-800.webp",
  },
  works: {
    pc: "/images/works/sub-header-works-pc-1920.webp",
    sp: "/images/works/sub-header-works-sp-800.webp",
  },
  profile: {
    pc: "/images/profile/sub-header-profile-pc-1920.webp",
    sp: "/images/profile/sub-header-profile-sp-800.webp",
  },
  contact: {
    pc: "/images/contact/sub-header-contact-pc-1920.webp",
    sp: "/images/contact/sub-header-contact-sp-800.webp",
  },
  archive: null,
  page: {
    pc: "/images/page/sub-header-page-pc-1920.webp",
    sp: "/images/page/sub-header-page-sp-800.webp",
  },
};

export function SubHeader({ variant, title, subtitle }: Props) {
  const bg = BG_BY_VARIANT[variant];

  return (
    <div className="relative h-75 max-md:h-50 overflow-hidden">
      {bg ? (
        <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
          <Image
            src={bg.pc}
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 100vw, 0px"
            className="hidden object-cover object-center md:block"
          />
          <Image
            src={bg.sp}
            alt=""
            fill
            priority
            sizes="(max-width: 767px) 100vw, 0px"
            className="object-cover object-center md:hidden"
          />
        </div>
      ) : null}

      <div className="relative z-10 mx-auto h-full max-w-[1232px] px-4 md:px-6 lg:px-8">
        <div className="flex h-full flex-col justify-center gap-4">
          <h2 className="w-fit bg-white/70 px-2 font-bold leading-[1.3] tracking-widest text-primary text-[clamp(3rem,2.781rem+0.933vw,3.5rem)] max-md:text-[2.5rem]">
            {title}
          </h2>
          <p className="w-fit bg-white/70 px-2 font-bold leading-relaxed tracking-widest text-primary text-[clamp(1.25rem,1.141rem+0.467vw,1.5rem)]">
            {subtitle.trim()}
          </p>
        </div>
      </div>
    </div>
  );
}
