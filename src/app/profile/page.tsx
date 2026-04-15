import type { Metadata } from "next";
import { ProfileMain } from "@/components/profile/ProfileMain";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { SubHeader } from "@/components/ui/SubHeader";

export const metadata: Metadata = {
  title: "Profile | Shu Digital Works",
  description: "プロフィール",
};

export default function ProfilePage() {
  return (
    <>
      <SubHeader variant="profile" title="Profile" subtitle="プロフィール" />
      <div className="mx-auto max-w-[1232px] px-8 pb-32 max-md:px-4 md:px-6">
        <Breadcrumbs items={[{ label: "Top", href: "/" }, { label: "Profile" }]} />
        <ProfileMain />
      </div>
    </>
  );
}
