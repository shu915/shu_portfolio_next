import contactPageShellStyles from "@/styles/contact/contactPageShell.module.css";

type Props = {
  children: React.ReactNode;
};

/** レガシー `.p-contact__wrap` 相当の全幅背景 */
export function ContactPageShell({ children }: Props) {
  return <div className={contactPageShellStyles.shell}>{children}</div>;
}
