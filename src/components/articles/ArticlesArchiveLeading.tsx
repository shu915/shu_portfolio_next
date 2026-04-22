const headingClassName =
  "mb-4 flex flex-wrap items-center gap-1 text-2xl font-bold tracking-[0.075em] text-black max-md:text-xl max-[430px]:text-lg max-[360px]:text-[1.1rem]";

type Props = {
  iconSrc: string;
  /** 狭い幅で非表示になるラベル（例: 「検索結果：」） */
  prefixLabel: string;
  /** メインの可変テキスト */
  title: string;
  totalCount: number;
};

/** 記事一覧グリッド直上の見出し（検索・タクソノミー・アーカイブで共通） */
export function ArticlesArchiveLeading({
  iconSrc,
  prefixLabel,
  title,
  totalCount,
}: Props) {
  return (
    <h3 className={headingClassName}>
      {/* eslint-disable-next-line @next/next/no-img-element -- サイドバーと同じ装飾用 SVG */}
      <img
        src={iconSrc}
        alt=""
        width={20}
        height={20}
        className="h-5 w-5 shrink-0"
        aria-hidden
      />
      <span className="max-[430px]:hidden">{prefixLabel}</span>
      <span className="break-all">{title}</span>
      <span className="whitespace-nowrap">（{totalCount}件）</span>
    </h3>
  );
}
