import type { Metadata } from "next";
import Link from "next/link";
import notFoundStyles from "@/styles/not-found/notFound.module.css";

export const metadata: Metadata = {
  title: "ページが見つかりません | Shu Digital Works",
  description: "お探しのページが見つかりませんでした。",
};

export default function NotFound() {
  return (
    <section
      className={notFoundStyles.root}
      aria-labelledby="not-found-heading"
    >
      <div className={notFoundStyles.content}>
        <h1 id="not-found-heading" className={notFoundStyles.title}>
          404 Not Found
        </h1>
        <div className={notFoundStyles.textWrapper}>
          <p className={notFoundStyles.text}>
            お探しのページが見つかりませんでした。
          </p>
          <p className={notFoundStyles.text}>
            アクセスしようとしたページは
            <br />
            削除・変更された可能性があります。
          </p>
        </div>
        <Link href="/" className={notFoundStyles.link}>
          トップへ戻る
        </Link>
      </div>
    </section>
  );
}
