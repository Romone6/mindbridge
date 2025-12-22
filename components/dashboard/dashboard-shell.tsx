"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Settings, LogOut, Bell, FileText, Activity } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const navItems = [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/patients", label: "Patients", icon: Users },
        { href: "/dashboard/actions", label: "Triage Config", icon: Activity },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-background flex font-sans">
            {/* Sidebar - Technical */}
            <aside className="w-64 border-r border-border bg-sidebar hidden md:flex flex-col">
                <div className="p-4 h-14 border-b border-border flex items-center">
                    <Link href="/" className="flex items-center gap-2 font-mono text-sm tracking-widest font-bold uppercase text-sidebar-foreground">
                        <div className="h-4 w-4 bg-primary" />
                        MindBridge_OS
                    </Link>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3 h-9 font-medium",
                                    pathname === item.href ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                            </Button>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-border">
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive h-9">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <h1 className="font-semibold text-sm">CLINICIAN_WORKSPACE</h1>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-sm text-foreground font-medium">Dr. S. Chen</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <Bell className="h-4 w-4" />
                        </Button>
                        <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            SC
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-6 lg:p-8 overflow-auto bg-muted/10">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
