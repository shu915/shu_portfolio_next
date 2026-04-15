import Image from "next/image";
import profilePageStyles from "@/styles/profile/profilePage.module.css";
import profileItemStyles from "@/styles/profile/profileItem.module.css";

/**
 * プロフィール本文（レガシー page-profile.php のベタ書きを移植）
 */
export function ProfileMain() {
  return (
    <main className={profilePageStyles.main}>
      <div className={profilePageStyles.container}>
        <figure className={profilePageStyles.imageFigure}>
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
        <div className={profilePageStyles.content}>
          <h3 className={profilePageStyles.contentName}>Shu</h3>
          <p className={profilePageStyles.contentText}>
            Webエンジニアリングを通じて、実用的で信頼性の高い成果を提供しています。細部にこだわりながら、使いやすさとクオリティを追求し、一つひとつのプロジェクトで確かな価値を生み出すことを大切にしています。技術の力で未来を形にします。
          </p>
        </div>
      </div>

      <div>
        <section>
          <h3 className={profileItemStyles.title}>経歴</h3>
          <div className={profileItemStyles.detail}>
            <dl className={profileItemStyles.career}>
              <div className={profileItemStyles.careerRow}>
                <dt className={profileItemStyles.careerYear}>2020年3月</dt>
                <dd className="m-0">
                  文系大学卒業
                  <br />
                  リベラルアーツ、現代社会、ビジネス、語学などを学習した
                </dd>
              </div>
              <div className={profileItemStyles.careerRow}>
                <dt className={profileItemStyles.careerYear}>2023年7月</dt>
                <dd className="m-0">
                  デイトラのWEB制作コースを卒業
                  <br />
                  LPやWordPressテーマを作成できるようになる
                </dd>
              </div>
              <div className={profileItemStyles.careerRow}>
                <dt className={profileItemStyles.careerYear}>2025年12月</dt>
                <dd className="m-0">
                  Happiness Chainを卒業、フルスタック開発が可能になる
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section>
          <h3 className={profileItemStyles.title}>バックエンド</h3>
          <p className={profileItemStyles.detail}>
            Go言語 / Ruby / Rails / PostgreSQL
          </p>
        </section>

        <section>
          <h3 className={profileItemStyles.title}>フロントエンド</h3>
          <p className={profileItemStyles.detail}>
            JavaScript / TypeScript / React / Next.js / Tailwind CSS
          </p>
        </section>

        <section>
          <h3 className={profileItemStyles.title}>インフラ</h3>
          <p className={profileItemStyles.detail}>
            AWS / Docker / GitHub Actions / Terraform
          </p>
        </section>

        <section>
          <h3 className={profileItemStyles.title}>使用ツール</h3>
          <p className={profileItemStyles.detail}>
            Cursor / GitHub / Code Rabbit / Figma / Notion / Slack / Discord
          </p>
        </section>
      </div>

      <section>
        <h3 className={profileItemStyles.title}>語学</h3>
        <p className={profileItemStyles.detail}>
          日本語 / 中国語 / 英語(学習中)
        </p>
      </section>

      <section>
        <h3 className={profileItemStyles.title}>趣味</h3>
        <p className={profileItemStyles.detail}>
          読書 / ゲーム / 散歩 / AIとチャット
        </p>
      </section>

      <section>
        <h3 className={profileItemStyles.title}>保有資格</h3>
        <p className={profileItemStyles.detail}>基本情報技術者 / HSK5級 / 色彩検定1級</p>
      </section>

      <section>
        <h3 className={profileItemStyles.title}>座右の銘</h3>
        <div className={profileItemStyles.detail}>
          <ul className={profileItemStyles.list}>
            <li>雨だれ岩を穿つ</li>
            <li>神は細部に宿る</li>
          </ul>
        </div>
      </section>

      <section>
        <h3 className={profileItemStyles.title}>強み</h3>
        <div className={profileItemStyles.detail}>
          <ul className={profileItemStyles.list}>
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
    </main>
  );
}
