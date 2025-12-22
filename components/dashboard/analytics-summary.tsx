"use client";

import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, TrendingUp, Users, Clock } from "lucide-react";

export function AnalyticsSummary() {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Panel className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Triage</p>
                        <h3 className="text-2xl font-bold font-mono">1,284</h3>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <TrendingUp className="h-4 w-4" />
                    </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-emerald-500">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +12% from last month
                </div>
            </Panel>

            <Panel className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Patients</p>
                        <h3 className="text-2xl font-bold font-mono">423</h3>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <Users className="h-4 w-4" />
                    </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-emerald-500">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +4% from last month
                </div>
            </Panel>

            <Panel className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                        <h3 className="text-2xl font-bold font-mono">4m 12s</h3>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <Clock className="h-4 w-4" />
                    </div>
                </div>
                <div className="mt-4 flex items-center text-xs text-emerald-500">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    -1m from last month
                </div>
            </Panel>
        </div>
    );
}
