"use client";

import { ShieldCheck, Lock, Activity, Server } from "lucide-react";
import { FeatureCard } from "@/components/ui/feature-card";

const TRUST_ITEMS = [
    {
        title: "SOC 2 Type II",
        description: "Audit program in progress.",
        icon: ShieldCheck,
    },
    {
        title: "HIPAA Alignment",
        description: "BAA available for enterprise agreements.",
        icon: Lock,
    },
    {
        title: "Encryption",
        description: "Data encrypted at rest and in transit.",
        icon: Server,
    },
    {
        title: "Service monitoring",
        description: "Availability metrics: No data yet.",
        icon: Activity,
    },
];

export function CredibilityPanel() {
    return (
        <section id="blog" className="section-spacing border-b border-border">
            <div className="space-y-6">
                <h2>Trust and compliance.</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {TRUST_ITEMS.map((item) => (
                        <FeatureCard
                            key={item.title}
                            title={item.title}
                            description={item.description}
                            icon={item.icon}
                            className="p-5"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
