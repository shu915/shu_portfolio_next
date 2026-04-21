type Props = {
  children: React.ReactNode;
};

/** Works 一覧・詳細のメイン背景（レガシー `bg-slash.webp`） */
export function WorksPageShell({ children }: Props) {
  return (
    <div className="bg-[url('/images/common/bg-slash.webp')] bg-cover bg-center bg-no-repeat bg-fixed max-md:bg-scroll">
      {children}
    </div>
  );
}
