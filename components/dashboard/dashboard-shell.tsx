"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Settings, Activity } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { useClinic } from "@/components/providers/clinic-provider";
import { PageShell } from "@/components/layout/page-shell";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = authClient.useSession();
    const { currentClinic, isLoading } = useClinic();

    const navItems = [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/patients", label: "Patients", icon: Users },
        { href: "/dashboard/actions", label: "Triage Config", icon: Activity },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ];

    if (isLoading) {
        return (
            <PageShell showFooter={false}>
                <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
                    Loading workspace...
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell showFooter={false} containerClassName="max-w-none px-0" mainClassName="py-6">
            <div className="page-container">
                <div className="grid gap-6 lg:grid-cols-[220px,1fr]">
                    <aside className="space-y-4">
                        <div className="rounded-[var(--radius)] border border-border bg-card p-4 surface-soft">
                            <div className="text-xs uppercase tracking-wider text-muted-foreground">Workspace</div>
                            <div className="mt-2 text-lg font-semibold">
                                {currentClinic ? currentClinic.name : "Clinic workspace"}
                            </div>
                            {session?.user && (
                                <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={async () => {
                                            await authClient.signOut();
                                            window.location.href = "/";
                                        }}
                                    >
                                        Sign out
                                    </Button>
                                    <div className="flex flex-col">
                                        <span className="text-foreground font-medium">{session.user.name || "Clinician"}</span>
                                        <span className="text-xs text-muted-foreground">{session.user.email}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
                            {navItems.map((item) => {
                                const isActive =
                                    item.href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(item.href);
                                return (
                                    <Link key={item.href} href={item.href} className="min-w-max">
                                        <Button
                                            variant={isActive ? "secondary" : "ghost"}
                                            className={cn(
                                                "w-full justify-start gap-2",
                                                isActive ? "text-foreground" : "text-muted-foreground"
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            {item.label}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>

                    <section className="space-y-6">{children}</section>
                </div>
            </div>
        </PageShell>
    );
}
