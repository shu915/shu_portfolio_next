import { HeroHudBackground } from "./HeroHudBackground";
import styles from "@/styles/front-page/heroSection.module.css";

const CURRENT_YEAR = new Date().getFullYear();

/**
 * フロントページのメインビジュアル（ヒーローセクション）
 *
 * - 100vh / 100dvh フルサイズ
 * - 背景は HUD 風の同心円アニメーション（HeroHudBackground / Canvas）
 * - 既存の global Header（fixed h-15）がこの上に乗る前提で、
 *   コピーの padding-top で header 分を確保している
 */
export function HeroSection() {
  return (
    <section
      className={[
        "relative w-full overflow-hidden isolate text-white",
        "h-screen min-h-[640px]",
        "supports-[height:100dvh]:h-dvh",
        "max-md:min-h-[560px]",
        styles.hero,
      ].join(" ")}
      aria-label="メインビジュアル"
    >
      {/* HUD canvas (背景) */}
      <HeroHudBackground />

      {/* スキャンライン + ビネット */}
      <div className={styles.scanline} aria-hidden="true" />
      <div className={styles.vignette} aria-hidden="true" />

      {/* HUD コーナーマーカー（左下・右下） */}
      <span className={`${styles.corner} ${styles.cornerBl}`} aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerBr}`} aria-hidden="true" />

      {/* 中央ステージ：header 60px + 余白 56px (= 116px) 確保 */}
      <div
        className={[
          "relative z-4 h-full grid place-items-center",
          "px-5 md:px-10 lg:px-14",
          "pt-[116px] pb-20",
          "max-md:pl-[clamp(32px,9vw,56px)] max-md:pr-6 max-md:pt-20 max-md:pb-10 max-md:place-items-stretch",
        ].join(" ")}
      >
        <div
          className={[
            "relative w-full max-w-[980px]",
            "flex flex-col items-start gap-[26px]",
            "max-md:gap-[18px] max-md:h-full max-md:justify-center max-md:max-w-[min(100%,440px)]",
          ].join(" ")}
        >
          {/* Eyebrow */}
          <span
            className={[
              "inline-flex items-center gap-3.5",
              "font-mono uppercase",
              "text-[11px] tracking-[0.34em] text-white/65",
              "max-md:text-[9.5px] max-md:tracking-[0.28em] max-md:gap-2.5",
              styles.fadeUpEyebrow,
            ].join(" ")}
          >
            <span className="inline-block w-7 h-px bg-white/55 max-md:w-5" />
            <span className={styles.pulseDot} />
            Full Stack Engineer · Portfolio
          </span>

          {/* JP メインキャッチ */}
          <h1
            className={[
              "m-0 text-white text-balance",
              "font-shippori-mincho font-medium leading-[1.35]",
              "text-[clamp(36px,6vw,80px)] tracking-[0.06em]",
              "max-md:text-[clamp(30px,9vw,44px)] max-md:tracking-[0.04em]",
              styles.catchJp,
            ].join(" ")}
          >
            <span className={styles.reveal}>
              <span>全体を見通し、</span>
            </span>
            <br />
            <span className={styles.reveal}>
              <span>
                <span className={styles.accent}>細部</span>で応える
                <span className={styles.punct}>。</span>
              </span>
            </span>
          </h1>

          {/* 英語サブキャッチ */}
          <p
            className={[
              "m-0 font-cormorant italic font-normal",
              "text-[clamp(20px,2.4vw,32px)] tracking-[0.03em] leading-[1.4]",
              "text-[rgb(232_238_255/0.82)]",
              "max-md:text-[clamp(16px,4.6vw,20px)] max-md:tracking-[0.02em]",
              styles.fadeUpEn,
            ].join(" ")}
          >
            From <span className="text-[rgb(184_205_255/0.85)]">architecture</span>{" "}
            to every detail.
          </p>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Brand 行 + Meta */}
          <div
            className={[
              "w-full flex items-end justify-between gap-6 flex-wrap",
              "max-md:flex-col max-md:items-start max-md:gap-5 max-md:mt-1.5",
              styles.fadeUpBrand,
            ].join(" ")}
          >
            <div className="flex flex-col gap-1.5">
              <div
                className={[
                  "font-cormorant font-medium leading-none text-white",
                  "text-[clamp(28px,3.4vw,44px)] tracking-[0.04em]",
                  "max-md:text-[clamp(22px,7vw,30px)] max-md:tracking-[0.03em]",
                ].join(" ")}
              >
                Shu <em className={styles.brandEm}>Digital</em> Works
              </div>
            </div>

            {/* Meta — PC は横並び / 狭い幅では縦積み */}
            <div
              className={[
                "flex gap-7 font-mono uppercase text-white/55",
                "text-[10.5px] tracking-[0.28em]",
                "max-md:flex-col max-md:gap-4 max-md:w-full max-md:text-[9px] max-md:tracking-[0.22em]",
              ].join(" ")}
            >
              <div>
                <span className="block text-white/40 text-[10.5px] tracking-[0.28em] mb-1 max-md:text-[8.5px] max-md:tracking-[0.24em] max-md:mb-[3px]">
                  Status
                </span>
                <span className="text-[rgb(232_238_255/0.95)] font-medium max-md:text-[10px] max-md:tracking-[0.18em]">
                  Available · {CURRENT_YEAR}
                </span>
              </div>
              <div>
                <span className="block text-white/40 text-[10.5px] tracking-[0.28em] mb-1 max-md:text-[8.5px] max-md:tracking-[0.24em] max-md:mb-[3px]">
                  Based
                </span>
                <span className="text-[rgb(232_238_255/0.95)] font-medium max-md:text-[10px] max-md:tracking-[0.18em]">
                  Anywhere, JP
                </span>
              </div>
              <div>
                <span className="block text-white/40 text-[10.5px] tracking-[0.28em] mb-1 max-md:text-[8.5px] max-md:tracking-[0.24em] max-md:mb-[3px]">
                  Stack
                </span>
                <span className="text-[rgb(232_238_255/0.95)] font-medium max-md:text-[10px] max-md:tracking-[0.18em]">
                  Next · Go · AWS
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className={[
          "absolute left-1/2 -translate-x-1/2 bottom-6 z-5",
          "inline-flex flex-col items-center gap-2",
          "font-mono uppercase text-white/55",
          "text-[9.5px] tracking-[0.34em]",
          "max-md:bottom-[18px] max-md:gap-1.5 max-md:text-[8.5px] max-md:tracking-[0.3em]",
          styles.scrollcue,
        ].join(" ")}
        aria-hidden="true"
      >
        <span>Scroll</span>
        <span className={styles.scrollLine} />
      </div>
    </section>
  );
}
