"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, LayoutDashboard, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { FeatureCard } from "@/components/ui/feature-card";

const DEMOS = [
    {
        title: "Empathetic Patient Intake",
        description: "Guide patients through an intake flow that captures context, symptoms, and goals in a consistent format.",
        icon: MessageSquare,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
    },
    {
        title: "Instant Risk Stratification",
        description: "Surface relevant risk indicators for clinician review with transparent reasoning and audit visibility.",
        icon: Zap,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
    },
    {
        title: "Clinical Decision Support",
        description: "Generate clinician-ready summaries that can be reviewed and appended to existing workflows.",
        icon: LayoutDashboard,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
    }
];

export function MiniDemos() {
    return (
        <section id="workflow" className="section-spacing border-b border-border">
            <div className="space-y-8">
                <div className="space-y-2">
                    <h2>How teams use MindBridge.</h2>
                    <p className="text-muted-foreground">
                        Every clinic is different. Start with the core workflow and configure details as you go.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {DEMOS.map((demo, index) => (
                        <FeatureCard
                            key={index}
                            title={demo.title}
                            description={demo.description}
                            icon={demo.icon}
                            iconColor={demo.color}
                            iconBgColor={demo.bg}
                            footer={
                                <div className="rounded-[var(--radius)] border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
                                    No data yet. Configure this workflow in your workspace.
                                </div>
                            }
                        />
                    ))}
                </div>

                <div className="pt-4">
                    <Button asChild variant="link" className="group px-0 text-sm font-semibold">
                        <Link href="/demo">
                            Explore the full clinical OS
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
