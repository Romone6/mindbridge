"use client";

import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { MessageSquare, LayoutDashboard, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

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
        <section className="section-spacing border-b border-border">
            <div className="space-y-8">
                <div className="space-y-2">
                    <h2>How teams use MindBridge.</h2>
                    <p className="text-muted-foreground">
                        Every clinic is different. Start with the core workflow and configure details as you go.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {DEMOS.map((demo, index) => (
                        <Panel key={index} className="flex h-full flex-col gap-4 p-6">
                            <div className={`h-10 w-10 rounded-lg ${demo.bg} flex items-center justify-center`}>
                                <demo.icon className={`h-6 w-6 ${demo.color}`} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-semibold">{demo.title}</h3>
                                <p className="text-sm text-muted-foreground">{demo.description}</p>
                            </div>
                            <div className="mt-auto rounded-[var(--radius)] border border-dashed border-border px-4 py-3 text-xs text-muted-foreground">
                                No data yet. Configure this workflow in your workspace.
                            </div>
                        </Panel>
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
