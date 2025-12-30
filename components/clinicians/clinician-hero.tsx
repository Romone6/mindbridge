"use client";



import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Activity, ShieldCheck } from "lucide-react";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export function ClinicianHero() {
    return (
        <section className="relative w-full py-24 md:py-32 bg-background border-b border-border">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            <div className="container relative mx-auto px-4 md:px-6">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    {/* Technical Badge */}
                    <div className="flex justify-center">
                        <Badge variant="outline" className="font-mono uppercase tracking-wider text-xs py-1.5 px-3 border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                            <Activity className="h-3.5 w-3.5 mr-2" />
                            Clinical_Operating_System_v1
                        </Badge>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground text-balance">
                        Precision Triage & <br />
                        <span className="text-emerald-600">Risk Stratification</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed">
                        MindBridge automates the intake process, providing real-time risk analysis and structured clinical summaries. Reduce triage time by 40% and ensure critical cases are prioritized.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Button
                            size="lg"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 min-w-[160px]"
                            onClick={() => document.getElementById("interest-form")?.scrollIntoView({ behavior: "smooth" })}
                        >
                            Partner With Us <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="min-w-[160px]"
                            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                        >
                            View Workflow
                        </Button>
                        
                        {/* Access Portal Button */}
                        <SignedOut>
                            <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                                <Button variant="outline" size="lg" className="min-w-[160px] border-emerald-500/30 text-emerald-700 hover:bg-emerald-50">
                                    Clinician Login
                                </Button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <Link href="/dashboard">
                                <Button variant="outline" size="lg" className="min-w-[160px] border-emerald-500/30 text-emerald-700 hover:bg-emerald-50">
                                    Go to Dashboard
                                </Button>
                            </Link>
                        </SignedIn>
                    </div>

                    {/* Trust Signals */}
                    <div className="pt-12 flex items-center justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <ShieldCheck className="h-4 w-4" />
                            SOC 2 Compliant
                        </div>
                        <div className="h-4 w-px bg-border" />
                        <div className="text-sm font-semibold">HIPAA Ready</div>
                        <div className="h-4 w-px bg-border" />
                        <div className="text-sm font-semibold">AES-256 Encrypted</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
