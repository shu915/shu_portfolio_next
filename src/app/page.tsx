import { HeroSection } from "@/components/front-page/HeroSection";
import { WorksSection } from "@/components/front-page/WorksSection";
import { ArticlesSection } from "@/components/front-page/ArticlesSection";
import { ProfileSection } from "@/components/front-page/ProfileSection";

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
