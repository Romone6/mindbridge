"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { getTimeSinceTriage } from "@/lib/time-utils";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useClinic } from "@/components/providers/clinic-provider";
import { createClerkSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@clerk/nextjs";
import { Intake } from "@/types/patient";

export function PatientQueue() {
    const { currentClinic } = useClinic();
    const { getToken } = useAuth();
    const [riskFilter, setRiskFilter] = useState<string>("all");
    const [intakes, setIntakes] = useState<Intake[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!currentClinic) return;
        const fetchIntakes = async () => {
            setIsLoading(true);
            try {
                const token = await getToken({ template: 'supabase' });
                const supabase = createClerkSupabaseClient(token!);
                if (!supabase) return;

                const { data, error } = await supabase
                    .from('intakes')
                    .select(`
                        *,
                        patient:patients(*),
                        triage:triage_outputs(*)
                    `)
                    .eq('clinic_id', currentClinic.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setIntakes(data as unknown as Intake[]);
            } catch (err) {
                console.error("Failed to load queue:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchIntakes();
    }, [currentClinic, getToken]);

    // Filter patients
    const filteredPatients = intakes.filter(intake => {
        const triage = intake.triage?.[0];
        const tier = triage?.urgency_tier || "Pending";
        return riskFilter === "all" || tier === riskFilter;
    });

    // Sort by risk (Critical > High > Moderate > Low > Pending)
    // We can map tiers to numbers
    const tierScore = {
        "Critical": 4,
        "High": 3,
        "Moderate": 2,
        "Low": 1,
        "Pending": 0
    };

    const sortedPatients = [...filteredPatients].sort((a, b) => {
        const tierA = a.triage?.[0]?.urgency_tier || "Pending";
        const tierB = b.triage?.[0]?.urgency_tier || "Pending";
        return (tierScore[tierB as keyof typeof tierScore] || 0) - (tierScore[tierA as keyof typeof tierScore] || 0);
    });

    const getRiskVariant = (band: string) => {
        switch (band) {
            case "Critical": return "riskHigh";
            case "High": return "riskHigh";
            case "Moderate": return "riskModerate";
            default: return "riskLow";
        }
    };

    if (isLoading) {
        return (
            <Panel className="h-[300px] flex items-center justify-center border-border bg-card">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </Panel>
        );
    }

    return (
        <Panel className="overflow-hidden border-border bg-card">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                    <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-foreground">Triaged Patients</h3>
                    <Badge variant="outline" className="text-[10px] px-1.5 h-5">{sortedPatients.length}</Badge>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant={riskFilter === "all" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setRiskFilter("all")}
                        className="h-7 text-xs font-mono"
                    >
                        ALL
                    </Button>
                    <Button
                        variant={riskFilter === "Critical" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setRiskFilter("Critical")}
                        className="h-7 text-xs font-mono text-red-600"
                    >
                        CRITICAL
                    </Button>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow className="border-border hover:bg-transparent uppercase text-[10px] tracking-wider font-mono bg-muted/10">
                        <TableHead className="h-10">Band</TableHead>
                        <TableHead className="h-10">Patient_ID</TableHead>
                        <TableHead className="h-10">Chief_Complaint</TableHead>
                        <TableHead className="h-10">Elapsed</TableHead>
                        <TableHead className="h-10">Status</TableHead>
                        <TableHead className="h-10 text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedPatients.map((intake) => {
                         const triage = intake.triage?.[0];
                         const tier = triage?.urgency_tier || "Pending";
                         // Triage outputs don't store "risk_score" as number in DB currently, mostly tier
                         // We can use 0-100 placeholder or infer from tier
                         const riskDisplay = tier; 

                         const patientRef = intake.patient?.patient_ref || "Guest";
                         const complaint = intake.answers_json?.complaint || "No complaint";

                        return (
                        <TableRow
                            key={intake.id}
                            className="border-border hover:bg-muted/30 cursor-pointer group text-xs transition-colors"
                        >
                            <TableCell className="font-mono">
                                <Badge variant={getRiskVariant(tier)} className="rounded-sm px-2 py-0 h-6 text-[10px] uppercase font-bold border-none">
                                    {riskDisplay}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-medium font-mono">
                                {patientRef}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                {complaint}
                            </TableCell>
                            <TableCell className="font-mono text-muted-foreground">
                                {getTimeSinceTriage(intake.created_at)}
                            </TableCell>
                            <TableCell>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground">
                                    {intake.status}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Link href={`/dashboard/patients/${intake.id}`}>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:text-primary">
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    )})}
                    {sortedPatients.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                No active patients found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Panel>
    );
}
