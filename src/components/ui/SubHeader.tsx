/**
 * 各ページ上部のサブヘッダー（背景画像 + タイトル + サブタイトル）
 *
 * variant に対応する背景画像クラス（sub-header-bg-[variant]）を
 * globals.css に定義すること
 */
type Props = {
  variant: "works" | "articles" | "profile" | "contact" | "archive" | "page";
  title: string;
  subtitle: string;
};

export function SubHeader({ variant, title, subtitle }: Props) {
  return (
    <div
      className={`sub-header-bg-${variant} h-75 max-md:h-50 bg-cover bg-center bg-no-repeat`}
    >
      <div className="max-w-[1232px] mx-auto px-8 md:px-6 max-md:px-4 h-full">
        <div className="flex flex-col justify-center gap-4 h-full">
          <h2
            className="bg-white/70 text-[clamp(3rem,2.781rem+0.933vw,3.5rem)] max-md:text-[2.5rem] font-bold tracking-widest leading-[1.3] w-fit px-2 text-primary"
          >
            {title}
          </h2>
          <p
            className="bg-white/70 w-fit text-[clamp(1.25rem,1.141rem+0.467vw,1.5rem)] tracking-widest leading-relaxed font-bold px-2 text-primary"
          >
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}
