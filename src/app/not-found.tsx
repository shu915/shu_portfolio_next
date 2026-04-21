import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ページが見つかりません | Shu Digital Works",
  description: "お探しのページが見つかりませんでした。",
};

export default function NotFound() {
  return (
    <section
      className="box-border flex h-[calc(100vh-13.75rem)] items-center justify-center max-md:mt-40 max-md:mb-40 max-md:h-auto"
      aria-labelledby="not-found-heading"
    >
      <div className="flex flex-col items-center justify-center">
        <h1
          id="not-found-heading"
          className="text-4xl font-bold tracking-widest text-primary max-md:text-2xl"
        >
          404 Not Found
        </h1>
        <div className="mt-8 space-y-2">
          <p className="text-center text-xl font-medium leading-relaxed text-primary max-md:text-base">
            お探しのページが見つかりませんでした。
          </p>
          <p className="text-center text-xl font-medium leading-relaxed text-primary max-md:text-base [&_br]:hidden max-md:[&_br]:block">
            アクセスしようとしたページは
            <br />
            削除・変更された可能性があります。
          </p>
        </div>
        <Link
          href="/"
          className="mt-12 box-border w-80 rounded-full bg-primary px-8 py-4 text-center text-base font-bold tracking-widest text-white no-underline transition-opacity duration-300 hover:opacity-85 max-md:w-48"
        >
          トップへ戻る
        </Link>
      </div>
    </section>
  );
}
