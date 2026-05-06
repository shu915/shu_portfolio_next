type Props = {
  children: React.ReactNode;
};

/**
 * Works / Profile などで共有するページ背景（`/images/common/bg-slash.webp`）
 * fixed は md 以上、SP はスクロール追従
 */
export function SlashBgShell({ children }: Props) {
  return (
    <div className="bg-[url('/images/common/bg-slash.webp')] bg-cover bg-center bg-no-repeat bg-fixed max-md:bg-scroll">
      {children}
    </div>
  );
}
