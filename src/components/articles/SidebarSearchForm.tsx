import sidebarSearchStyles from "@/styles/articles/sidebarSearch.module.css";

/**
 * レガシー `searchform.php` + `.c-search-form` 相当。
 * `NEXT_PUBLIC_SITE_URL` が WP のオリジンなら `/?s=` に送り、テーマの `search.php` と同じ挙動になる。
 */
export function SidebarSearchForm() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  const base = raw.replace(/\/+$/, "");
  const action = base.length > 0 ? `${base}/` : "/";

  return (
    <form
      action={action}
      method="get"
      role="search"
      className={sidebarSearchStyles.form}
    >
      <label htmlFor="sidebar-search-s" className="sr-only">
        キーワードで検索
      </label>
      <input
        id="sidebar-search-s"
        type="search"
        name="s"
        placeholder="キーワードを入力"
        autoComplete="off"
        className={sidebarSearchStyles.input}
      />
      <button
        type="submit"
        className={sidebarSearchStyles.button}
        aria-label="検索"
      >
        <SearchIcon className="size-[1.1rem]" />
      </button>
    </form>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 512 512"
      fill="currentColor"
      aria-hidden
    >
      {/* Font Awesome magnifying-glass 相当の単純化シルエット */}
      <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.9 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z" />
    </svg>
  );
}
