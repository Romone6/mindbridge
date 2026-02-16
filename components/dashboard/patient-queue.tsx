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
import { Intake } from "@/types/patient";

export function PatientQueue() {
    const { currentClinic } = useClinic();
    const [riskFilter, setRiskFilter] = useState<string>("all");
    const [intakes, setIntakes] = useState<Intake[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!currentClinic) return;
        const fetchIntakes = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/intakes?clinicId=${currentClinic.id}`);
                const payload = await response.json();
                if (!response.ok) throw new Error(payload.error || "Failed to load queue");
                setIntakes(payload.intakes as Intake[]);
            } catch (err) {
                console.error("Failed to load queue:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchIntakes();
    }, [currentClinic]);

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
            <Panel className="overflow-hidden">
                <div className="px-6 py-4 border-b border-border flex flex-wrap items-center justify-between gap-3 bg-muted/30">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-foreground">Triaged patients</h3>
                        <Badge variant="outline" className="text-[10px] px-2">
                            {sortedPatients.length}
                        </Badge>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant={riskFilter === "all" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setRiskFilter("all")}
                        >
                            All
                        </Button>
                        <Button
                            variant={riskFilter === "Critical" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setRiskFilter("Critical")}
                            className="text-red-600"
                        >
                            Critical
                        </Button>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Risk band</TableHead>
                            <TableHead>Patient ID</TableHead>
                            <TableHead>Chief complaint</TableHead>
                            <TableHead>Elapsed</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedPatients.map((intake) => {
                            const triage = intake.triage?.[0];
                            const tier = triage?.urgency_tier || "Pending";
                            const riskDisplay = tier;

                            const patientRef = intake.patient?.patient_ref || "Guest";
                            const patientName = (intake.answers_json?.patientName as string | undefined)?.trim();
                            const complaint = intake.answers_json?.complaint || "No complaint";
                            const manualTakeoverRequested = Boolean(intake.answers_json?.manualTakeoverRequested);
                            const manualTakeoverActive = Boolean(intake.answers_json?.manualTakeoverActive);

                            return (
                                <TableRow key={intake.id} className="cursor-pointer">
                                    <TableCell>
                                        <Badge variant={getRiskVariant(tier)} className="text-[10px] uppercase">
                                            {riskDisplay}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col gap-1">
                                            <span>{patientRef}</span>
                                            {patientName ? (
                                                <span className="text-xs text-muted-foreground">{patientName}</span>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-[260px] truncate text-muted-foreground">
                                        {complaint}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {getTimeSinceTriage(intake.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                                                {intake.status}
                                            </span>
                                            {manualTakeoverRequested ? (
                                                <Badge variant={manualTakeoverActive ? "default" : "outline"} className="text-[10px]">
                                                    {manualTakeoverActive ? "Takeover active" : "Takeover requested"}
                                                </Badge>
                                            ) : null}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link href={`/dashboard/patients/${intake.id}`}>
                                            <Button size="sm" variant="ghost" className="h-7 px-2">
                                                {manualTakeoverRequested ? "Take over" : <ArrowRight className="h-4 w-4" />}
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {sortedPatients.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No triage sessions yet
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Panel>
        );
    }
