import Image from "next/image";
import dotBg from "@/styles/profile/profileMainDotBg.module.css";

/** プロフィール本文（カード枠はページ側の noSidebarMain） */
export function ProfileMain() {
  const sections: { label: string; content: React.ReactNode }[] = [
    {
      label: "経歴",
      content: (
        <div>
          {(
            [
              [
                "2020年3月",
                <>
                  文系大学卒業
                  <br />
                  リベラルアーツ、現代社会、ビジネス、語学などを学習した
                </>,
              ],
              [
                "2023年7月",
                <>
                  デイトラのWEB制作コースを卒業
                  <br />
                  LPやWordPressテーマを作成できるようになる
                </>,
              ],
              [
                "2025年12月",
                <>Happiness Chainを卒業、フルスタック開発が可能になる</>,
              ],
            ] as const
          ).map(([year, body]) => (
            <div
              key={year}
              className="mb-2 flex gap-4 max-md:mb-3 max-md:flex-col max-md:gap-1"
            >
              <span className="w-[88px] shrink-0 text-sm font-semibold text-primary max-md:w-auto">
                {year}
              </span>
              <span>{body}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: "バックエンド",
      content: "Go言語 / Ruby / Rails / PostgreSQL",
    },
    {
      label: "フロントエンド",
      content: "JavaScript / TypeScript / React / Next.js / Tailwind CSS",
    },
    {
      label: "インフラ",
      content: "AWS / Docker / GitHub Actions / Terraform",
    },
    {
      label: "使用ツール",
      content:
        "Cursor / GitHub / Gemini Code Assist / Claude Design / Notion / Slack / Discord",
    },
    {
      label: "語学",
      content: "日本語 / 中国語 / 英語(学習中)",
    },
    {
      label: "趣味",
      content: "読書 / ゲーム / 散歩 / AIとチャット",
    },
    {
      label: "保有資格",
      content: "基本情報技術者 / 簿記3級 /HSK5級 / 色彩検定1級",
    },
    {
      label: "座右の銘",
      content: (
        <ul className="ml-4 list-disc [&>li]:mb-0.5">
          <li>雨だれ岩を穿つ</li>
          <li>神は細部に宿る</li>
        </ul>
      ),
    },
    {
      label: "強み",
      content: (
        <ul className="ml-4 list-disc [&>li]:mb-0.5">
          <li>戦略、ビジョン、計画などを考えるのが得意</li>
          <li>全体像だけでなく、細部までこだわり抜く</li>
          <li>主体性を持って、改善をし続ける事ができる</li>
          <li>継続的に努力ができる</li>
          <li>柔軟性を持ち、新しいことを学び続けられる</li>
          <li>
            ユーザー視点を大切にし、価値を届けることに意識を向けている
          </li>
          <li>エンジニアリングの力でより良い未来を創造していく</li>
        </ul>
      ),
    },
  ];

  return (
    <article className={`min-w-0 w-full ${dotBg.dotBg}`}>
      <div className="relative grid grid-cols-[240px_1fr] items-stretch gap-8 border-b border-primary/8 pt-2 pb-7 max-[899px]:gap-6 max-[899px]:py-5 max-md:grid-cols-1 max-md:py-5 max-[430px]:py-4">
        <div className="flex w-60 shrink-0 self-stretch max-md:mx-auto max-md:w-full max-md:max-w-[240px]">
          <div className="w-full leading-none">
            <Image
              src="/images/common/profile-image.webp"
              alt="プロフィール画像"
              width={400}
              height={520}
              className="mx-auto h-auto w-full max-w-[240px] object-contain"
              sizes="240px"
              priority
            />
          </div>
        </div>
        <div className="flex min-h-0 flex-col justify-between max-md:min-h-0 max-md:gap-5">
          <div className="flex flex-col gap-1.5 max-md:items-center max-md:text-center">
            <h3 className="font-cormorant text-[56px] font-semibold leading-none tracking-[0.04em] text-primary max-[899px]:text-[42px] max-md:text-center max-md:text-[2rem] max-[430px]:text-[1.75rem]">
              Shu
            </h3>
            <p className="m-0 font-cormorant text-base font-semibold tracking-[0.22em] text-primary/50">
              Full Stack Engineer
            </p>
          </div>
          <div>
            <div className="my-3.5 h-px w-8 bg-primary/20 max-md:mx-auto" />
            <p className="text-[15px] leading-loose tracking-[0.06em] text-[#444] max-md:text-justify max-md:[text-align-last:auto]">
              Webエンジニアリングを通じて、実用的で信頼性の高い成果を提供しています。細部にこだわりながら、使いやすさとクオリティを追求し、一つひとつのプロジェクトで確かな価値を生み出すことを大切にしています。技術の力で未来を形にします。
            </p>
          </div>
        </div>
      </div>

      <div className="pt-3 max-[899px]:pt-2 max-[430px]:pt-2">
        {sections.map(({ label, content }, i) => {
          const isFirst = i === 0;
          return (
            <div
              key={label}
              className={`grid grid-cols-[132px_1fr] gap-0 max-md:grid-cols-1 ${isFirst ? "mt-0" : "mt-5"}`}
            >
              <div
                className={`border-t border-primary/10 pt-3 font-shippori-mincho text-[15px] font-semibold tracking-[0.2em] text-primary max-md:pb-1 ${isFirst ? "border-t-0" : ""}`}
              >
                {label}
              </div>
              <div
                className={`border-t border-primary/10 pl-4 pt-3 text-[15px] leading-[1.9] tracking-[0.04em] text-[#444] max-md:border-t-0 max-md:px-0 max-md:pt-2 ${isFirst ? "border-t-0 pt-3 max-md:pt-2" : ""}`}
              >
                {content}
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
