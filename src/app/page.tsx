import type { Metadata } from "next";
import { HeroSection } from "@/components/front-page/HeroSection";
import { WorksSection } from "@/components/front-page/WorksSection";
import { ArticlesSection } from "@/components/front-page/ArticlesSection";
import { ProfileSection } from "@/components/front-page/ProfileSection";

export const metadata: Metadata = {
  title: "Shu Digital Works",
  description:
    "Shu Digital Works（フルスタックエンジニア Shu）のサイトのトップページです。お仕事の事例、ブログ、自己紹介、お問い合わせなどをここからご覧いただけます。",
};

export default function Home() {
  return (
    <div>
      <HeroSection />
      <WorksSection />
      <ArticlesSection />
      <ProfileSection />
    </div>
  );
}
