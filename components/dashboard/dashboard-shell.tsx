"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, Settings, LogOut, Bell } from "lucide-react";
import Link from "next/link";

export function DashboardShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-black/40 backdrop-blur-xl hidden md:flex flex-col">
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-cyan-400" />
                        MindBridge
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start gap-3 bg-white/5 text-primary">
                        <LayoutDashboard className="h-4 w-4" />
                        Triage Queue
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
                        <Users className="h-4 w-4" />
                        Patients
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
                        <Settings className="h-4 w-4" />
                        Settings
                    </Button>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <Button variant="ghost" className="w-full justify-start gap-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Topbar */}
                <header className="h-16 border-b border-white/10 bg-black/20 backdrop-blur-sm flex items-center justify-between px-6">
                    <h1 className="font-semibold text-lg">Clinician Dashboard</h1>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5 text-muted-foreground" />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500" />
                        </Button>
                        <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/50" />
                    </div>
                </header>

                <div className="flex-1 p-6 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
