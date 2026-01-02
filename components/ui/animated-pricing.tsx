"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Check, Zap } from "lucide-react";
import { fadeUp, staggerChildren, scaleIn } from "@/lib/motion";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Starter",
    price: "$299",
    period: "/month",
    description: "For small clinics getting started with AI-assisted intake.",
    features: [
      "Up to 500 patient intakes/mo",
      "Basic Risk Assessment",
      "Standard EHR Export",
      "Email Support",
      "1 Clinician Seat",
    ],
    cta: "Start Trial",
    popular: false,
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    name: "Pro",
    price: "$899",
    period: "/month",
    description: "For growing practices requiring advanced analytics and integrations.",
    features: [
      "Unlimited patient intakes",
      "Advanced Risk Stratification",
      "Real-time EHR Sync (FHIR)",
      "Priority 24/7 Support",
      "5 Clinician Seats",
      "Custom Risk Protocols",
    ],
    cta: "Request Demo",
    popular: true,
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For hospitals and health systems needing full customization.",
    features: [
      "Unlimited everything",
      "Population Health Dashboard",
      "On-premise Deployment Option",
      "Dedicated Success Manager",
      "SSO & Advanced Security",
      "SLA Guarantees",
    ],
    cta: "Contact Sales",
    popular: false,
    gradient: "from-amber-500/20 to-orange-500/20",
  },
];

/**
 * Animated Pricing Section Component
 * 
 * Features:
 * - Staggered card entrance animations
 * - Hover scaling and glow effects
 * - "Popular" plan highlighting with animated border
 * - Responsive grid layout
 * 
 * @example
 * ```tsx
 * <AnimatedPricing />
 * ```
 */
export function AnimatedPricing() {
  const handleAction = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative w-full py-24 md:py-32 overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren(0.1)}
          className="mb-16 text-center max-w-3xl mx-auto"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">Pricing</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your clinical needs. No hidden fees.
          </motion.p>
        </motion.div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerChildren(0.15)}
          className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto"
        >
          {tiers.map((tier) => (
            <PricingCard 
              key={tier.name} 
              tier={tier} 
              onAction={handleAction} 
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

interface PricingCardProps {
  tier: typeof tiers[0];
  onAction: () => void;
}

function PricingCard({ tier, onAction }: PricingCardProps) {
  return (
    <motion.div variants={scaleIn} whileHover={{ y: -8 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className={cn(
        "relative h-full flex flex-col overflow-hidden transition-all duration-300",
        tier.popular ? "border-primary/50 shadow-2xl shadow-primary/10" : "border-border hover:border-primary/30 hover:shadow-xl"
      )}>
        {/* Animated Gradient Background on Hover */}
        <div className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          "bg-gradient-to-br",
          tier.gradient
        )} />
        
        {tier.popular && (
          <div className="absolute top-0 right-0">
            <div className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
              <Zap className="w-3 h-3 fill-current" />
              POPULAR
            </div>
          </div>
        )}

        <CardHeader className="relative z-10 pb-8">
          <h3 className="text-lg font-medium text-muted-foreground">{tier.name}</h3>
          <div className="mt-4 flex items-baseline">
            <span className="text-4xl font-bold tracking-tight text-foreground">{tier.price}</span>
            {tier.period && <span className="ml-1 text-sm text-muted-foreground">{tier.period}</span>}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{tier.description}</p>
        </CardHeader>

        <CardContent className="relative z-10 flex-1">
          <ul className="space-y-4">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm">
                <div className="mt-1 min-w-4">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <span className="text-muted-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className="relative z-10 pt-8">
          <Button
            className={cn("w-full transition-all duration-300", tier.popular && "shadow-lg hover:shadow-primary/25")}
            variant={tier.popular ? "default" : "outline"}
            onClick={onAction}
            size="lg"
          >
            {tier.cta}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
