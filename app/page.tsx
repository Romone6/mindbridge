import { MainLayout } from "@/components/layout/main-layout";
import { HeroSection } from "@/components/landing/hero-section";
import { DemoSection } from "@/components/landing/demo-section";
import { NarrativeSection } from "@/components/landing/narrative-section";
import { MiniDemos } from "@/components/landing/mini-demos";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { CredibilityPanel } from "@/components/landing/credibility-panel";
import { WaitlistSection } from "@/components/landing/waitlist-section";

type SearchParams = {
  testimonials?: string | string[];
};

const testimonialModes = new Set(["auto", "empty", "sample", "hidden"]);

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const testimonialsParam =
    typeof resolvedParams?.testimonials === "string"
      ? resolvedParams.testimonials
      : undefined;
  const testimonialsMode = testimonialModes.has(testimonialsParam ?? "")
    ? (testimonialsParam as "auto" | "empty" | "sample" | "hidden")
    : undefined;

  return (
    <MainLayout>
      <HeroSection />
      <DemoSection />
      <NarrativeSection />
      <MiniDemos />
      <TestimonialsSection mode={testimonialsMode} />
      <WaitlistSection />
      <CredibilityPanel />
    </MainLayout>
  );
}
