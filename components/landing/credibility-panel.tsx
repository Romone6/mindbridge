"use client";

import { Panel } from "@/components/ui/panel";
import { ShieldCheck, Lock, Activity, Server } from "lucide-react";

export function CredibilityPanel() {
    return (
        <section className="w-full border-b border-border py-24 bg-muted/20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-foreground font-semibold">
                            <ShieldCheck className="h-5 w-5" />
                            <span>SOC 2 Type II</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Audit Ready (In Progress)</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-foreground font-semibold">
                            <Lock className="h-5 w-5" />
                            <span>HIPAA Compliant</span>
                        </div>
                        <p className="text-sm text-muted-foreground">BAA Available for Enterprise</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-foreground font-semibold">
                            <Server className="h-5 w-5" />
                            <span>AES-256 Encrypted</span>
                        </div>
                        <p className="text-sm text-muted-foreground">At rest and in transit.</p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-foreground font-semibold">
                            <Activity className="h-5 w-5" />
                            <span>99.9% Uptime</span>
                        </div>
                        <p className="text-sm text-muted-foreground">Clinical SLA Guarantee</p>
                    </div>
                </div>

                <div className="mt-12 pt-12 border-t border-border/50 text-center">
                    <p className="text-sm text-muted-foreground">
                        Secure. Compliant. Trusted by leading mental health providers.
                    </p>
                </div>
            </div>
        </section>
    );
}
