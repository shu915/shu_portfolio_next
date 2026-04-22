import Image from "next/image";

const HERO_PC = "/images/front-page/front-page-main-visual-pc-1920.webp";
const HERO_SP = "/images/front-page/front-page-main-visual-sp-767.webp";

/**
 * フロントページのメインビジュアル（ヒーローセクション）
 * WordPress テーマの .p-front-page__main-visual を移植
 *
 * 背景は `next/image` + `priority`（LCP / fetchpriority 用）。PC/SP で画像を切り替え。
 */
export function HeroSection() {
  return (
    <section
      className={[
        "relative overflow-hidden pt-15 aspect-3/1",
        "max-md:pt-0 max-md:aspect-auto max-md:h-140",
      ].join(" ")}
      aria-label="メインビジュアル"
    >
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        <Image
          src={HERO_PC}
          alt=""
          fill
          priority
          sizes="(min-width: 768px) 100vw, 0px"
          className="hidden object-cover object-center md:block"
        />
        <Image
          src={HERO_SP}
          alt=""
          fill
          priority
          sizes="(max-width: 767px) 100vw, 0px"
          className="object-cover object-center md:hidden"
        />
      </div>

      {/* 内側コンテナ */}
      <div className="relative z-10 mx-auto h-full max-w-[1232px] px-4 max-md:flex max-md:items-center md:px-6 lg:px-8">
        {/* キャッチコピーブロック：PC は右寄せ中段、SP は中央 */}
        <div
          className={[
            "absolute top-[40%] right-0 -translate-y-1/2 flex flex-col items-end",
            "max-[1280px]:right-[3%] max-[1280px]:top-[35%]",
            "max-[999px]:top-[30%]",
            "max-md:static max-md:items-center max-md:translate-y-0 max-md:mx-auto",
          ].join(" ")}
        >
          {/* 日本語キャッチコピー */}
          <h1
            className={[
              "w-fit flex flex-col gap-[0.8rem] items-end",
              "text-[clamp(1.5rem,0.357rem+2.381vw,2.5rem)]",
              "max-md:items-center max-md:gap-2",
            ].join(" ")}
          >
            {["WEBエンジニアリングで", "あなたの課題を解決いたします"].map(
              (line) => (
                <span
                  key={line}
                  className="px-4 py-[0.3rem] w-fit bg-white/80 leading-normal font-semibold max-md:text-[clamp(1.25rem,0.357rem+2.381vw,2rem)]"
                >
                  {line}
                </span>
              )
            )}
          </h1>

          {/* 英語サブコピー */}
          <p
            className={[
              "text-white leading-loose tracking-[0.02em] w-fit",
              "text-[clamp(1rem,0.429rem+1.19vw,1.5rem)]",
              "max-md:bg-black/50 max-md:px-4 max-md:py-[0.3rem] max-md:mt-2 max-md:text-center max-md:leading-[1.4]",
            ].join(" ")}
          >
            Construct the Future with{" "}
            <br className="hidden max-md:block" />
            Web Engineering.
          </p>
        </div>
      </div>

      {/* ボトムバー：「Shu Digital Works」大文字テキスト（SP では非表示） */}
      <div className="absolute bottom-0 left-0 z-10 w-full bg-black/40 max-md:hidden">
        <div className="mx-auto max-w-[1232px] px-4 md:px-6 lg:px-8">
          <p
            className={[
              "font-semibold text-white tracking-[0.03em] leading-none select-none overflow-hidden",
              "font-cormorant",
              "text-[clamp(2.5rem,-3.5rem+12.5vw,7.75rem)]",
              "relative bottom-[calc(clamp(0.5rem,-0.529rem+2.143vw,1.4rem)*-0.4)]",
              "max-[899px]:text-center",
            ].join(" ")}
            aria-hidden="true"
          >
            Shu Digital Works
          </p>
        </div>
      </div>

      {/* スクロールガイド（SP のみ表示） */}
      <div className="absolute bottom-0 left-1/2 z-10 hidden h-[100px] w-[100px] -translate-x-1/2 text-center max-md:block">
        <span className="mb-[10px] block text-base tracking-widest text-primary">
          Scroll
        </span>
        <div
          className="relative -bottom-16 mx-auto h-[60px] w-[2px] animate-[scrollLine_2.2s_cubic-bezier(0.76,0,0.3,1)_infinite] bg-primary"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
