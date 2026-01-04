"use client";

import { Panel } from "@/components/ui/panel";
import { ShieldCheck, Lock, Activity, Server } from "lucide-react";

export function CredibilityPanel() {
    return (
        <section id="blog" className="section-spacing border-b border-border">
            <div className="space-y-6">
                <h2>Trust and compliance.</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[
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
                    ].map((item) => (
                        <Panel key={item.title} className="p-5">
                            <div className="flex items-center gap-3 text-sm font-semibold text-foreground">
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                                {item.title}
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                        </Panel>
                    ))}
                </div>
            </div>
        </section>
    );
}
