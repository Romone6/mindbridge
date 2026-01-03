"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";

export function HeroSection() {
    return (
        <section className="section-spacing border-b border-border">
            <div className="space-y-8">
                <div className="space-y-4">
                    <Badge variant="outline" className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Clinical intake platform
                    </Badge>
                    <h1>AI-assisted mental health intake for clinical teams.</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        MindBridge standardizes intake workflows, captures structured clinical context, and routes cases to the right
                        clinician faster without sacrificing safety or oversight.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href="/demo">
                        <Button size="lg" className="w-full sm:w-auto">
                            View the demo <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>

                    <SignedOut>
                        <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto">
                                Sign in
                            </Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/dashboard">
                            <Button size="lg" variant="outline" className="w-full sm:w-auto">
                                Go to workspace
                            </Button>
                        </Link>
                    </SignedIn>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    {[
                        {
                            title: "Structured intake",
                            description: "Capture consistent clinical context across every patient, regardless of entry point.",
                        },
                        {
                            title: "Human oversight",
                            description: "Clinicians remain the final decision-makers for risk and escalation.",
                        },
                        {
                            title: "Enterprise readiness",
                            description: "Security, auditability, and configuration designed for regulated care settings.",
                        },
                    ].map((item) => (
                        <div key={item.title} className="rounded-[var(--radius)] border border-border bg-card p-4 surface-soft">
                            <h3 className="text-base font-semibold">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
