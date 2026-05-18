import Image from "next/image";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { SectionMoreLink } from "@/components/ui/SectionMoreLink";

const DESCRIPTION =
  "Webエンジニアリングを通じて、実用的で信頼性の高い成果を提供しています。細部にこだわりながら、使いやすさとクオリティを追求し、一つひとつのプロジェクトで確かな価値を生み出すことを大切にしています。技術の力で未来を形にします。";

/**
 * フロントページ Profile セクション
 *
 * 構造（上から）:
 *   1. SectionTitle（中央: ── プロフィール ── + Profile）
 *   2. 本体 — md〜lg未満: 横並び・画像・テキストとも lg より一段コンパクト
 *           lg 以上: 画像 320px / ギャップ 72px / テキスト最大 520px
 *           - Mobile : 縦積み・中央寄せ
 *
 * 右カラムの内訳:
 *   名前(Shu) → 肩書(Full Stack Engineer) → 短い罫線 → 説明 → ボタン
 */
export function ProfileSection() {
  return (
    <section
      className="bg-white py-16 md:py-30"
      aria-labelledby="profile-section-title"
    >
      <div className="mx-auto flex max-w-[1232px] flex-col items-center px-4 md:px-6 lg:px-8">
        <SectionTitle
          eyebrow="プロフィール"
          title="Profile"
          id="profile-section-title"
        />

        <div
          className={[
            "mt-11 md:mt-18",
            "flex w-full max-w-[960px] flex-col items-center",
            "md:w-fit md:max-w-none md:flex-row md:items-start",
            "md:gap-12 lg:gap-[72px]",
          ].join(" ")}
        >
          {/* 左：イラスト / 画像 */}
          <figure className="w-60 shrink-0 md:w-64 lg:w-80">
            <Image
              src="/images/common/profile-image.webp"
              alt="プロフィール画像"
              width={497}
              height={446}
              className="h-auto w-full"
              sizes="(min-width: 1024px) 320px, (min-width: 768px) 256px, 240px"
            />
          </figure>

          {/* 右：テキスト */}
          <div className="mt-7 flex w-full flex-col items-center md:mt-0 md:w-auto md:max-w-[440px] md:items-start lg:max-w-[520px]">
            <div className="flex flex-col items-center md:items-start">
              <p
                className={[
                  "m-0 font-cormorant font-semibold leading-none text-primary",
                  "text-[36px] md:text-[40px] lg:text-[48px]",
                  "tracking-[0.06em] md:tracking-[0.04em]",
                ].join(" ")}
              >
                Shu
              </p>

              {/*
                Mobile : ── Full Stack Engineer ──（サイドバー揃え）
                Desktop: 左寄せ・両端罫線なし（詳細ページ揃え）
              */}
              <div
                className={[
                  "mt-3 md:mt-3.5",
                  "flex items-center whitespace-nowrap",
                  "font-cormorant font-semibold leading-none text-primary/55",
                  "text-[14px] tracking-[0.2em] md:text-[16px] md:tracking-[0.22em]",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className="mr-2.5 inline-block h-px w-[22px] bg-primary/30 md:hidden"
                />
                <span>Full Stack Engineer</span>
                <span
                  aria-hidden="true"
                  className="ml-2.5 inline-block h-px w-[22px] bg-primary/30 md:hidden"
                />
              </div>
            </div>

            <span
              aria-hidden="true"
              className="mx-auto mt-5 hidden h-px w-8 bg-primary/25 md:mx-0 md:mt-6 md:block md:w-9"
            />

            <p
              className={[
                "m-0 mt-7 max-w-full",
                "text-[14px] tracking-[0.06em] text-[#444]",
                "leading-[1.95]",
                "text-justify [text-align-last:center]",
                "md:text-[15px] md:text-left md:[text-align-last:auto]",
              ].join(" ")}
            >
              {DESCRIPTION}
            </p>

            <div className="mt-7 md:mt-8">
              <SectionMoreLink
                href="/profile"
                ariaLabel="詳しいプロフィールを見る"
              >
                詳しいプロフィールはこちら
              </SectionMoreLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
