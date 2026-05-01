type Props = {
  children: React.ReactNode;
};

/** レガシー `.p-contact__wrap` 相当。背景画像は md 以上のみ（スマホでは固定背景を使わない） */
export function ContactPageShell({ children }: Props) {
  return (
    <div className="bg-white md:bg-[url('/images/contact/bg-contact.webp')] md:bg-cover md:bg-center md:bg-no-repeat md:bg-fixed">
      {children}
    </div>
  );
}
