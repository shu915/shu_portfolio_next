import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactPageShell } from "@/components/contact/ContactPageShell";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SubHeader } from "@/components/ui/SubHeader";

export const metadata: Metadata = {
  title: "Contact | Shu Digital Works",
  description: "お問い合わせ",
};

export default function ContactPage() {
  return (
    <ContactPageShell>
      <SubHeader variant="contact" title="Contact" subtitle="お問い合わせ" />
      <div className="mx-auto max-w-[1232px] px-4 pb-32 md:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Top", href: "/" }, { label: "Contact" }]} />
        <ContactForm />
      </div>
    </ContactPageShell>
  );
}
