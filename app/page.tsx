import { MainLayout } from "@/components/layout/main-layout";
import { AnimatedHero } from "@/components/ui/animated-hero";
import { AnimatedFeatureShowcase } from "@/components/ui/animated-feature-showcase";
import { NarrativeSection } from "@/components/landing/narrative-section";
import { AnimatedDashboardPreview } from "@/components/ui/animated-dashboard-preview";
import { MiniDemos } from "@/components/landing/mini-demos";
import { AnimatedPricing } from "@/components/ui/animated-pricing";
import { AnimatedFAQ } from "@/components/ui/animated-faq";
import { CredibilityPanel } from "@/components/landing/credibility-panel";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <MainLayout>
        {/* Clinical OS Landing Page Structure */}
        <main className="flex flex-col">
          <AnimatedHero />
          <AnimatedFeatureShowcase />
          <NarrativeSection />
          <AnimatedDashboardPreview />
          <MiniDemos />
          <AnimatedPricing />
          <AnimatedFAQ />
          <CredibilityPanel />
        </main>
      </MainLayout>
    </div>
  );
}
