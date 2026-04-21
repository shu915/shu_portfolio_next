import Image from "next/image";
import Link from "next/link";
import sectionsStyles from "@/styles/front-page/sections.module.css";

/**
 * フロントページ Profile セクション
 *
 * レスポンシブ挙動（SCSS の display:contents 戦略をそのまま移植）:
 * - PC (>1239px)   : 左=テキスト+画像 flex / 右=タイトル+ボタン
 * - Tab (≤1239px) : flex-col。右カラムが display:contents になり
 *                   子要素が親 flex に合流（order で並び順制御）
 * - SP  (≤799px)  : 左カラムも display:contents になりさらに細分化
 *                   order 1:タイトル / 2:画像 / 3:テキスト / 4:ボタン
 */
export function ProfileSection() {
  return (
    <section className="py-20" aria-labelledby="profile-section-title">
      <div className="mx-auto max-w-[1232px] px-4 md:px-6 lg:px-8">
        <div className="flex justify-between gap-8 items-start max-[1239px]:flex-col max-[1239px]:items-center">

          {/* 左カラム：テキスト + プロフィール画像 */}
          <div className="flex gap-10 items-center max-[1239px]:order-2 max-[799px]:contents">

            {/* テキストブロック */}
            <div className="max-[799px]:order-3">
              <p className="text-[2.5rem] font-bold tracking-widest font-cormorant text-center leading-none">
                Shu
              </p>
              <p className="text-xl tracking-widest leading-normal mt-6 max-w-xl max-[899px]:text-base">
                Webエンジニアリングを通じて、実用的で信頼性の高い成果を提供しています。細部にこだわりながら、使いやすさとクオリティを追求し、一つひとつのプロジェクトで確かな価値を生み出すことを大切にしています。技術の力で未来を形にします。
              </p>
            </div>

            {/* プロフィール画像 */}
            <figure className="w-60 shrink-0 max-[799px]:order-2">
              <Image
                src="/images/common/profile-image.webp"
                alt="プロフィール画像"
                width={497}
                height={446}
                className="w-full h-auto object-contain"
              />
            </figure>
          </div>

          {/*
           * 右カラム：1239px 以下では display:contents になり
           * 子要素が親 flex コンテナに直接参加する（order で並び順制御）
           */}
          <div className="w-60 ml-auto max-[767px]:mx-auto max-[1239px]:contents">

            {/* セクションタイトル */}
            <h2
              id="profile-section-title"
              className={`${sectionsStyles.sectionTitle} text-[2.25rem] font-bold font-cormorant tracking-[0.15em] max-[1239px]:order-1 max-[1239px]:mx-auto`}
            >
              Profile
            </h2>

            {/*
             * ボタンラップ
             * - PC     : ブロック配置（各ボタンに mt-14）
             * - ≤1239px: flex row、width: 100%、space-evenly
             * - ≤799px : flex col、ml-auto（右寄せ）
             * - ≤767px : mx-auto（中央）
             */}
            <div className="max-[1239px]:order-3 max-[1239px]:flex max-[1239px]:justify-evenly max-[1239px]:w-full max-[799px]:order-4 max-[799px]:flex-col max-[799px]:items-center max-[799px]:ml-auto max-[799px]:w-fit max-[767px]:mx-auto">

              <div className="mt-14 max-[767px]:mt-6">
                <Link href="/profile" className={sectionsStyles.arrowButton}>
                  Details
                </Link>
                <p className="text-[0.875rem] leading-none mt-2 tracking-[0.05em]">
                  プロフィール詳細はこちら
                </p>
              </div>

              <div className="mt-14 max-[767px]:mt-6">
                <Link href="/contact" className={sectionsStyles.arrowButton}>
                  Contact
                </Link>
                <p className="text-[0.875rem] leading-none mt-2 tracking-[0.05em]">
                  ご相談、お問い合わせはこちら
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
