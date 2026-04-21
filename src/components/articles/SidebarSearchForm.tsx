/**
 * レガシー `searchform.php` + `.c-search-form` 相当。
 * GET `/articles/search?s=` で Next 側の検索結果ページへ（WP の `s` と同じパラメータ名）。
 */
export function SidebarSearchForm() {
  return (
    <form
      action="/articles/search"
      method="get"
      role="search"
      className="mt-4 box-border flex justify-center border border-primary focus-within:shadow-[0_0_0_2px_rgba(33,30,85,0.2)]"
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
        className="box-border min-w-0 w-full border-0 bg-white p-2 text-base tracking-[0.05em] text-[#333] outline-none"
      />
      <button
        type="submit"
        className="inline-flex w-16 shrink-0 cursor-pointer items-center justify-center border-0 bg-primary p-0 text-white transition-[background-color,color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
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
