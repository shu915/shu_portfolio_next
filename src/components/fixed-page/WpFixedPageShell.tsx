import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/**
 * レガシー `.p-page__wrap.c-no-sidebar-fixed-bg` 相当（斜線背景・全幅）
 */
export function WpFixedPageShell({ children }: Props) {
  return (
    <div className="bg-[url('/images/common/bg-slash.webp')] bg-cover bg-center bg-no-repeat bg-fixed pb-32 max-md:bg-scroll">
      {children}
    </div>
  );
}
