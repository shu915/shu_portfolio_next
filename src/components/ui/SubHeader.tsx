import Image from "next/image";

/**
 * 各ページ上部のサブヘッダー（背景画像 + タイトル + サブタイトル）
 *
 * 背景は `next/image` + `priority`（LCP）。PC/SP で画像を切り替え。
 * テキストはテキスト幅だけのフロストパネル＋左アクセントバー。
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

/** PC は `public` にある最大幅（旧 image-set 2x 相当）。SP は *-sp-800 のみ */
const BG_BY_VARIANT: Record<
  Props["variant"],
  { pc: string; sp: string } | null
> = {
  articles: {
    pc: "/images/articles/sub-header-articles-pc-3150.webp",
    sp: "/images/articles/sub-header-articles-sp-800.webp",
  },
  search: {
    pc: "/images/search/sub-header-search-pc-3840.webp",
    sp: "/images/search/sub-header-search-sp-800.webp",
  },
  works: {
    pc: "/images/works/sub-header-works-pc-3840.webp",
    sp: "/images/works/sub-header-works-sp-800.webp",
  },
  profile: {
    pc: "/images/profile/sub-header-profile-pc-3840.webp",
    sp: "/images/profile/sub-header-profile-sp-800.webp",
  },
  contact: {
    pc: "/images/contact/sub-header-contact-pc-3840.webp",
    sp: "/images/contact/sub-header-contact-sp-800.webp",
  },
  archive: null,
  page: {
    pc: "/images/page/sub-header-page-pc-3840.webp",
    sp: "/images/page/sub-header-page-sp-800.webp",
  },
};

export function SubHeader({ variant, title, subtitle }: Props) {
  const bg = BG_BY_VARIANT[variant];

  return (
    <div className="relative h-75 max-md:h-50 overflow-hidden">
      {/* 背景画像 */}
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

      {/* フロストパネル */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1232px] items-center px-4 md:px-6 lg:px-8">
        <div className="flex items-stretch">
          {/* 左アクセントバー */}
          <div className="w-1 shrink-0 bg-primary" />

          {/* テキストパネル */}
          <div className="flex flex-col gap-2 bg-white/82 px-5 py-4 backdrop-blur-md md:gap-2.5 md:px-7 md:py-[18px]">
            {/* 英語タイトル */}
            <h2 className="font-cormorant font-semibold leading-none tracking-[0.08em] text-primary text-[clamp(2.25rem,1.8rem+1.9vw,4.5rem)]">
              {title}
            </h2>

            {/* サブタイトル */}
            <div className="flex items-center gap-2.5">
              <span
                className="h-px w-5 shrink-0 bg-primary opacity-50 max-md:w-3.5"
                aria-hidden="true"
              />
              <p className="font-semibold tracking-widest text-primary text-[clamp(0.75rem,0.65rem+0.4vw,1rem)]">
                {subtitle.trim()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
