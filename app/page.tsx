import { MainLayout } from "@/components/layout/main-layout";
import { HeroSection } from "@/components/landing/hero-section";
import { NarrativeSection } from "@/components/landing/narrative-section";
import { MiniDemos } from "@/components/landing/mini-demos";
import { CredibilityPanel } from "@/components/landing/credibility-panel";

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <NarrativeSection />
      <MiniDemos />
      <CredibilityPanel />
    </MainLayout>
  );
}
