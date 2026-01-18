"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ROLE_CONTENT, ROLE_OPTIONS } from "@/lib/landing-role-content";
import { useLandingRole } from "@/components/landing/landing-role-context";
import { RoleHeroCopy } from "@/components/landing/role-hero-copy";

export function HeroSection() {
    const { role, setRole, queryRole } = useLandingRole();
    const content = ROLE_CONTENT[role];

    return (
        <section className="section-spacing border-b border-border">
            <div className="space-y-8">
                <div className="space-y-4">
                    <Badge variant="outline" className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        Clinical intake platform
                    </Badge>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span className="uppercase tracking-[0.2em]">Viewing as</span>
                        <div role="group" aria-label="Select your role" className="flex flex-wrap gap-2">
                            {ROLE_OPTIONS.map((option) => {
                                const isActive = role === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setRole(option.value)}
                                        aria-pressed={isActive}
                                        className={[
                                            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                                            isActive
                                                ? "border-foreground/20 bg-foreground/5 text-foreground"
                                                : "border-border bg-background text-muted-foreground hover:text-foreground",
                                        ].join(" ")}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                        {queryRole && (
                            <span className="rounded-full border border-border bg-muted/40 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                                link override
                            </span>
                        )}
                    </div>
                    <RoleHeroCopy role={role} />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href={content.cta.href}>
                        <Button size="lg" className="w-full sm:w-auto">
                            {content.cta.label} <ArrowRight className="h-4 w-4" />
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
                    {content.bullets.map((item) => (
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
