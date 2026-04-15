type Props = {
  children: React.ReactNode;
};

/** レガシー `.p-contact__wrap` 相当の全幅背景 */
export function ContactPageShell({ children }: Props) {
  return (
    <div className="bg-[url('/images/contact/bg-contact.webp')] bg-cover bg-center bg-no-repeat bg-fixed max-md:bg-scroll">
      {children}
    </div>
  );
}
