import subHeaderStyles from "@/styles/ui/subHeader.module.css";

/**
 * 各ページ上部のサブヘッダー（背景画像 + タイトル + サブタイトル）
 *
 * 背景が必要な variant は `src/styles/ui/subHeader.module.css` に追加する
 */
type Props = {
  variant: "works" | "articles" | "profile" | "contact" | "archive" | "page";
  title: string;
  /** 英字見出しの下に出す日本語など（固定ページでは WP タイトル） */
  subtitle: string;
};

const BG_BY_VARIANT: Record<Props["variant"], string | undefined> = {
  articles: subHeaderStyles.bgArticles,
  works: subHeaderStyles.bgWorks,
  profile: subHeaderStyles.bgProfile,
  contact: subHeaderStyles.bgContact,
  archive: undefined,
  page: subHeaderStyles.bgPage,
};

export function SubHeader({ variant, title, subtitle }: Props) {
  const bgClass = BG_BY_VARIANT[variant];
  return (
    <div
      className={[bgClass, "h-75 max-md:h-50 bg-cover bg-center bg-no-repeat"]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="max-w-[1232px] mx-auto px-4 md:px-6 lg:px-8 h-full">
        <div className="flex flex-col justify-center gap-4 h-full">
          <h2
            className="bg-white/70 text-[clamp(3rem,2.781rem+0.933vw,3.5rem)] max-md:text-[2.5rem] font-bold tracking-widest leading-[1.3] w-fit px-2 text-primary"
          >
            {title}
          </h2>
          <p className="bg-white/70 w-fit text-[clamp(1.25rem,1.141rem+0.467vw,1.5rem)] tracking-widest leading-relaxed font-bold px-2 text-primary">
            {subtitle.trim()}
          </p>
        </div>
      </div>
    </div>
  );
}
