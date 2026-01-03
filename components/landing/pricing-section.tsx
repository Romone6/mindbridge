"use client";

import Link from "next/link";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";

export function PricingSection() {
    return (
        <section className="section-spacing border-b border-border">
            <div className="space-y-8">
                <div className="text-center space-y-3">
                    <h2>Pricing</h2>
                    <p className="text-lg text-muted-foreground">
                        Plans are tailored to clinic size, workflow complexity, and deployment needs.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Panel className="p-6 space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">Pilot cohort</h3>
                        <p className="text-sm text-muted-foreground">
                            Limited early-access program for clinical partners.
                        </p>
                        <div className="text-xs text-muted-foreground">Pricing: No data yet.</div>
                    </Panel>
                    <Panel className="p-6 space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">Clinic deployments</h3>
                        <p className="text-sm text-muted-foreground">
                            Configure intake, triage, and escalation for your care pathways.
                        </p>
                        <div className="text-xs text-muted-foreground">Pricing available on request.</div>
                    </Panel>
                    <Panel className="p-6 space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">Enterprise</h3>
                        <p className="text-sm text-muted-foreground">
                            Dedicated onboarding, compliance support, and custom workflows.
                        </p>
                        <div className="text-xs text-muted-foreground">Contact sales for scope.</div>
                    </Panel>
                </div>

                <div className="flex justify-center">
                    <Link href="/clinicians#interest-form">
                        <Button size="lg">Request pricing</Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
