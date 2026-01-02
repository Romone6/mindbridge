"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Settings, Bell, Activity, UserPlus, Link as LinkIcon, Copy } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import { useClinic } from "@/components/providers/clinic-provider";
import { toast } from "sonner";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user } = useUser();
    const { currentClinic, isLoading } = useClinic();

    const navItems = [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/patients", label: "Patients", icon: Users },
        { href: "/dashboard/actions", label: "Triage Config", icon: Activity },
        { href: "/dashboard/team", label: "Team", icon: UserPlus },
        { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ];

    const handleCopyIntakeLink = () => {
        if (!currentClinic) return;
        const url = `${window.location.origin}/intake/${currentClinic.id}`;
        navigator.clipboard.writeText(url);
        toast.success("Intake link copied to clipboard");
    };

    if (isLoading) {
         return <div className="min-h-screen bg-background flex items-center justify-center">Loading Workspace...</div>;
    }

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

                <div className="p-4 border-t border-border flex items-center gap-3">
                    <UserButton afterSignOutUrl="/" />
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium truncate text-sidebar-foreground">{user?.fullName}</span>
                        <span className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</span>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Topbar */}
                <header className="h-14 border-b border-border bg-background flex items-center justify-between px-6">
                    <div className="flex items-center gap-2">
                        <h1 className="font-semibold text-sm uppercase tracking-tight">
                            {currentClinic ? currentClinic.name : "CLINICIAN_WORKSPACE"}
                        </h1>
                        {user && (
                            <>
                                <span className="text-muted-foreground">/</span>
                                <span className="text-sm text-foreground font-medium">Dr. {user.lastName}</span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-4">
                        {currentClinic && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="hidden sm:flex items-center gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10"
                                onClick={handleCopyIntakeLink}
                            >
                                <LinkIcon className="h-3.5 w-3.5 text-primary" />
                                <span className="text-xs">Intake Link</span>
                                <Copy className="h-3 w-3 text-muted-foreground ml-1" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                            <Bell className="h-4 w-4" />
                        </Button>
                        <div className="h-6 w-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
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
