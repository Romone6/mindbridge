"use client";

import { Shield, Lock, FileKey } from "lucide-react";

const badges = [
    {
        title: "HIPAA-aligned controls",
        description: "Data handling aligns with healthcare privacy requirements.",
        icon: Shield,
    },
    {
        title: "SOC 2 program",
        description: "Controls and audit readiness workstreams in progress.",
        icon: Lock,
    },
    {
        title: "Human Oversight",
        description: "Licensed clinicians review high-risk cases in real-time.",
        icon: FileKey,
    },
];

export function TrustSection() {
    return (
        <section className="section-spacing border-t border-border">
            <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 text-center md:text-left">
                    {badges.map((badge) => (
                        <div key={badge.title} className="flex items-center gap-4 text-sm">
                            <div className="p-2 rounded-full bg-muted/40 border border-border">
                                <badge.icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">{badge.title}</h3>
                                <p className="text-xs text-muted-foreground max-w-[200px]">{badge.description}</p>
                            </div>
                        </div>
                    ))}
            </div>
        </section>
    );
}
