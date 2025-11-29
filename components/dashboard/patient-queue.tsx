"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { PATIENTS } from "@/lib/mock-data";
import { ArrowRight } from "lucide-react";

export function PatientQueue() {
    // Sort by risk score descending
    const sortedPatients = [...PATIENTS].sort((a, b) => b.risk_score - a.risk_score);

    const getRiskBadge = (score: number) => {
        if (score >= 70) return <Badge variant="destructive" className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border-rose-500/50">High ({score})</Badge>;
        if (score >= 30) return <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-amber-500/50">Moderate ({score})</Badge>;
        return <Badge variant="outline" className="text-emerald-400 border-emerald-500/50">Low ({score})</Badge>;
    };

    return (
        <GlassCard className="overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-semibold text-lg">Priority Triage Queue</h3>
                <Button variant="outline" size="sm">View All</Button>
            </div>
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-white/10">
                        <TableHead>Patient</TableHead>
                        <TableHead>Risk Status</TableHead>
                        <TableHead>Chief Complaint</TableHead>
                        <TableHead>AI Summary</TableHead>
                        <TableHead>Wait Time</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedPatients.map((patient) => (
                        <TableRow key={patient.id} className="hover:bg-white/5 border-white/10">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border border-white/10">
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{patient.initials}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium text-sm">{patient.name}</div>
                                        <div className="text-xs text-muted-foreground">{patient.id}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>{getRiskBadge(patient.risk_score)}</TableCell>
                            <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                                {patient.chief_complaint}
                            </TableCell>
                            <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                                {patient.ai_summary}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                                {patient.wait_time}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </GlassCard>
    );
}
