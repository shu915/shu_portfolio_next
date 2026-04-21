import type { Metadata } from "next";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactPageShell } from "@/components/contact/ContactPageShell";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SubHeader } from "@/components/ui/SubHeader";

export const metadata: Metadata = {
  title: "Contact | Shu Digital Works",
  description:
    "Shu Digital Works（フルスタックエンジニア Shu）のお問い合わせページです。お仕事のご依頼やご相談は、フォームからお送りください。",
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
