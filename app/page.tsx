import { HeroSection } from "@/components/landing/hero-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { SolutionSection } from "@/components/landing/solution-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { WaitlistSection } from "@/components/landing/waitlist-section";
import { TrustSection } from "@/components/landing/trust-section";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between bg-background">
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <SolutionSection />
      <TestimonialsSection />
      <PricingSection />
      <TrustSection />
      <WaitlistSection />
      <Footer />
    </main>
  );
}
