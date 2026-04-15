import worksPageShellStyles from "@/styles/works/worksPageShell.module.css";

type Props = {
  children: React.ReactNode;
};

/** Works 一覧・詳細のメイン背景（レガシー `bg-slash.webp`） */
export function WorksPageShell({ children }: Props) {
  return <div className={worksPageShellStyles.shell}>{children}</div>;
}
