import type { Metadata } from "next";
import { ProfileMain } from "@/components/profile/ProfileMain";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SubHeader } from "@/components/ui/SubHeader";

export const metadata: Metadata = {
  title: "Profile | Shu Digital Works",
  description:
    "フルスタックエンジニア Shu のプロフィールページです。経歴やスキル、Shu Digital Works（フルスタックエンジニア Shu）のポートフォリオサイトに関する自己紹介を掲載しています。",
};

export default function ProfilePage() {
  return (
    <>
      <SubHeader variant="profile" title="Profile" subtitle="プロフィール" />
      <div className="mx-auto max-w-[1232px] px-4 pb-32 md:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: "Top", href: "/" }, { label: "Profile" }]} />
        <ProfileMain />
      </div>
    </>
  );
}
