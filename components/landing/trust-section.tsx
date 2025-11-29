"use client";

import { Shield, Lock, FileKey } from "lucide-react";

const badges = [
    {
        title: "HIPAA Compliant",
        description: "All data is encrypted and handled according to federal standards.",
        icon: Shield,
    },
    {
        title: "SOC2 Type II",
        description: "Enterprise-grade security controls and regular audits.",
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
        <section className="w-full py-12 border-t border-white/10 bg-background/50 backdrop-blur-sm">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 text-center md:text-left">
                    {badges.map((badge) => (
                        <div key={badge.title} className="flex items-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
                            <div className="p-2 rounded-full bg-white/5 border border-white/10">
                                <badge.icon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">{badge.title}</h3>
                                <p className="text-xs text-muted-foreground max-w-[200px]">{badge.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
