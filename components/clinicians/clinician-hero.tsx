"use client";



import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth/auth-client";
import Link from "next/link";

export function ClinicianHero() {
    const { data: session } = authClient.useSession();
    return (
        <section className="section-spacing border-b border-border">
            <div className="space-y-6 text-center">
                <div className="flex justify-center">
                    <Badge variant="outline" className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Clinician partner program
                    </Badge>
                </div>

                <h1>Operational intake support for mental health clinics.</h1>

                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                    MindBridge standardizes intake capture, surfaces safety indicators, and produces summaries clinicians can
                    review quickly. It is designed to augment clinical workflows with transparent, auditable outputs.
                </p>

                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link href="#interest-form">
                        <Button size="lg">
                            Partner with us <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                    <Link href="#how-it-works">
                        <Button variant="outline" size="lg">
                            View workflow
                        </Button>
                    </Link>

                    {!session?.user ? (
                        <Link href="/auth/sign-in">
                            <Button variant="ghost" size="lg">
                                Sign in
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/dashboard">
                            <Button variant="ghost" size="lg">
                                Go to workspace
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        SOC 2 program in progress
                    </div>
                    <span className="h-4 w-px bg-border" />
                    <span>HIPAA-aligned controls</span>
                    <span className="h-4 w-px bg-border" />
                    <span>Encryption at rest and in transit</span>
                </div>
            </div>
        </section>
    );
}
