"use client";

import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const tiers = [
    {
        name: "Proactive Care",
        price: "$20",
        period: "/month",
        description: "For self-guided support and AI therapy.",
        features: [
            "24/7 AI Triage & Support",
            "Unlimited Chat Sessions",
            "Reduce Anxiety & Depression",
            "Personalized Care Plan",
        ],
        cta: "Start Free Trial",
        popular: false,
    },
    {
        name: "Clinics & Hospitals",
        price: "$50",
        period: "/patient/mo",
        description: "Augment your workforce and reduce waitlists.",
        features: [
            "Reduce Therapist No-Shows",
            "Document 5x Faster",
            "EHR Integration (FHIR)",
            "Outcome Tracking Dashboards",
            "Clinician Dashboard",
        ],
        cta: "Request Pilot",
        popular: true,
    },
    {
        name: "Payers & Insurers",
        price: "Custom",
        period: "",
        description: "Reduce costs and improve member outcomes.",
        features: [
            "Population Health Analytics",
            "Risk Stratification",
            "Care Gap Closure",
            "White-label Options",
            "Dedicated Success Manager",
        ],
        cta: "Contact Sales",
        popular: false,
    },
];

export function PricingSection() {

    const handleCheckout = () => {
        // Waitlist mode active - scroll to waitlist section
        document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <section className="relative w-full py-24 md:py-32 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-16 text-center">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                        Simple, Transparent <span className="text-primary">Pricing</span>.
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Choose the plan that fits your needs. No hidden fees.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-3 lg:gap-8 max-w-6xl mx-auto">
                    {tiers.map((tier) => (
                        <Panel
                            key={tier.name}
                            className={`flex flex-col p-8 ${tier.popular ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/50' : ''}`}
                        >
                            <div className="mb-8">
                                <h3 className="text-lg font-medium text-muted-foreground">{tier.name}</h3>
                                <div className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-bold tracking-tight text-foreground">{tier.price}</span>
                                    <span className="ml-1 text-sm text-muted-foreground">{tier.period}</span>
                                </div>
                                <p className="mt-4 text-sm text-muted-foreground">{tier.description}</p>
                            </div>

                            <ul className="mb-8 space-y-4 flex-1">
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm">
                                        <Check className="h-4 w-4 text-primary" />
                                        <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className="w-full"
                                variant={tier.popular ? "default" : "outline"}
                                onClick={() => handleCheckout()}
                            >
                                Join Waitlist
                            </Button>
                        </Panel>
                    ))}
                </div>
            </div>
        </section>
    );
}
