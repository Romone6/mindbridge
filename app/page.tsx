import { MainLayout } from "@/components/layout/main-layout";
import { HeroSection } from "@/components/landing/hero-section";
import { DemoSection } from "@/components/landing/demo-section";
import { NarrativeSection } from "@/components/landing/narrative-section";
import { MiniDemos } from "@/components/landing/mini-demos";
import { CredibilityPanel } from "@/components/landing/credibility-panel";
import { WaitlistSection } from "@/components/landing/waitlist-section";

export default function Home() {
  return (
    <MainLayout>
      <HeroSection />
      <DemoSection />
      <NarrativeSection />
      <MiniDemos />
      <WaitlistSection />
      <CredibilityPanel />
    </MainLayout>
  );
}
