import Image from "next/image";

const PROFILE_MAIN =
  "mx-auto mt-8 w-[1080px] max-w-full bg-[url('/images/profile/bg-grid.webp')] bg-[length:1.5rem] bg-repeat px-[6.5rem] py-16 max-[1099px]:px-8 max-[1099px]:py-8 max-[430px]:px-0";

const PROFILE_CONTAINER =
  "flex justify-between gap-8 max-[1099px]:flex-col max-[1099px]:items-center";

const PROFILE_IMAGE_FIGURE = "m-0 w-[16.625rem] max-w-full";

const PROFILE_CONTENT = "w-[32rem] max-w-full";

const PROFILE_NAME =
  "text-5xl font-bold tracking-[0.1em] leading-none max-[1099px]:text-center max-[1099px]:text-[2rem]";

const PROFILE_INTRO =
  "mt-6 max-w-xl text-lg leading-relaxed tracking-[0.1em] text-justify max-[899px]:text-base max-[430px]:text-base";

const SECTION_TITLE =
  "relative mt-14 border-b border-primary pl-4 text-2xl font-medium tracking-[0.05rem] before:absolute before:left-0 before:top-1/2 before:h-[80%] before:w-2 before:-translate-y-1/2 before:bg-primary before:content-[''] max-[430px]:text-xl";

const SECTION_BODY =
  "mt-4 px-4 tracking-[0.05rem] max-[430px]:px-0 max-[430px]:text-sm";

const CAREER = "flex flex-col gap-4";

const CAREER_ROW =
  "flex justify-start pb-[0.2rem] max-[899px]:flex-col max-[899px]:border-b max-[899px]:border-primary";

const CAREER_YEAR = "w-28 shrink-0";

const MOTTO_LIST = "ml-8 list-disc leading-[1.8] max-[430px]:ml-4";

/**
 * プロフィール本文（レガシー page-profile.php のベタ書きを移植）
 */
export function ProfileMain() {
  return (
    <div className={PROFILE_MAIN}>
      <div className={PROFILE_CONTAINER}>
        <figure className={PROFILE_IMAGE_FIGURE}>
          <Image
            src="/images/profile/profile-image-target.webp"
            alt="プロフィール画像"
            width={400}
            height={520}
            className="h-auto w-full"
            sizes="(max-width: 1099px) 100vw, 16.625rem"
            priority
          />
        </figure>
        <div className={PROFILE_CONTENT}>
          <h3 className={PROFILE_NAME}>Shu</h3>
          <p className={PROFILE_INTRO}>
            Webエンジニアリングを通じて、実用的で信頼性の高い成果を提供しています。細部にこだわりながら、使いやすさとクオリティを追求し、一つひとつのプロジェクトで確かな価値を生み出すことを大切にしています。技術の力で未来を形にします。
          </p>
        </div>
      </div>

      <div>
        <section>
          <h3 className={SECTION_TITLE}>経歴</h3>
          <div className={SECTION_BODY}>
            <dl className={CAREER}>
              <div className={CAREER_ROW}>
                <dt className={CAREER_YEAR}>2020年3月</dt>
                <dd className="m-0">
                  文系大学卒業
                  <br />
                  リベラルアーツ、現代社会、ビジネス、語学などを学習した
                </dd>
              </div>
              <div className={CAREER_ROW}>
                <dt className={CAREER_YEAR}>2023年7月</dt>
                <dd className="m-0">
                  デイトラのWEB制作コースを卒業
                  <br />
                  LPやWordPressテーマを作成できるようになる
                </dd>
              </div>
              <div className={CAREER_ROW}>
                <dt className={CAREER_YEAR}>2025年12月</dt>
                <dd className="m-0">
                  Happiness Chainを卒業、フルスタック開発が可能になる
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section>
          <h3 className={SECTION_TITLE}>バックエンド</h3>
          <p className={SECTION_BODY}>
            Go言語 / Ruby / Rails / PostgreSQL
          </p>
        </section>

        <section>
          <h3 className={SECTION_TITLE}>フロントエンド</h3>
          <p className={SECTION_BODY}>
            JavaScript / TypeScript / React / Next.js / Tailwind CSS
          </p>
        </section>

        <section>
          <h3 className={SECTION_TITLE}>インフラ</h3>
          <p className={SECTION_BODY}>
            AWS / Docker / GitHub Actions / Terraform
          </p>
        </section>

        <section>
          <h3 className={SECTION_TITLE}>使用ツール</h3>
          <p className={SECTION_BODY}>
            Cursor / GitHub / Code Rabbit / Figma / Notion / Slack / Discord
          </p>
        </section>
      </div>

      <section>
        <h3 className={SECTION_TITLE}>語学</h3>
        <p className={SECTION_BODY}>
          日本語 / 中国語 / 英語(学習中)
        </p>
      </section>

      <section>
        <h3 className={SECTION_TITLE}>趣味</h3>
        <p className={SECTION_BODY}>
          読書 / ゲーム / 散歩 / AIとチャット
        </p>
      </section>

      <section>
        <h3 className={SECTION_TITLE}>保有資格</h3>
        <p className={SECTION_BODY}>基本情報技術者 / HSK5級 / 色彩検定1級</p>
      </section>

      <section>
        <h3 className={SECTION_TITLE}>座右の銘</h3>
        <div className={SECTION_BODY}>
          <ul className={MOTTO_LIST}>
            <li>雨だれ岩を穿つ</li>
            <li>神は細部に宿る</li>
          </ul>
        </div>
      </section>

      <section>
        <h3 className={SECTION_TITLE}>強み</h3>
        <div className={SECTION_BODY}>
          <ul className={MOTTO_LIST}>
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
        </div>
      </section>
    </div>
  );
}
