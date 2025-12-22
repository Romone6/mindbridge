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
import { PATIENTS } from "@/lib/mock-data";
import { getTimeSinceTriage } from "@/lib/time-utils";
import { Filter, ArrowRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function PatientQueue() {
    const [riskFilter, setRiskFilter] = useState<string>("all");

    // Filter patients
    const filteredPatients = PATIENTS.filter(patient =>
        riskFilter === "all" || patient.risk_band === riskFilter
    );

    const sortedPatients = [...filteredPatients].sort((a, b) => b.risk_score - a.risk_score);

    const getRiskVariant = (band: string) => {
        switch (band) {
            case "Critical": return "riskHigh";
            case "High": return "riskHigh";
            case "Moderate": return "riskModerate";
            default: return "riskLow";
        }
    };

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
                    {sortedPatients.map((patient) => (
                        <TableRow
                            key={patient.id}
                            className="border-border hover:bg-muted/30 cursor-pointer group text-xs transition-colors"
                        >
                            <TableCell className="font-mono">
                                <Badge variant={getRiskVariant(patient.risk_band)} className="rounded-sm px-2 py-0 h-6 text-[10px] uppercase font-bold border-none">
                                    {patient.risk_score} • {patient.risk_band}
                                </Badge>
                            </TableCell>
                            <TableCell className="font-medium font-mono">
                                {patient.patient_pseudonym}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate text-muted-foreground">
                                {patient.key_reason}
                            </TableCell>
                            <TableCell className="font-mono text-muted-foreground">
                                {getTimeSinceTriage(patient.triaged_at)}
                            </TableCell>
                            <TableCell>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-secondary text-secondary-foreground">
                                    {patient.triage_status}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Link href={`/dashboard/patients/${patient.id}`}>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 hover:text-primary">
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Panel>
    );
}
