"use client";

import { TranscriptMessage } from "@/types/patient";

import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TranscriptViewer } from "@/components/dashboard/transcript-viewer";
import { RiskBreakdown } from "@/components/dashboard/risk-breakdown";
import { ClinicianNotesPanel } from "@/components/dashboard/clinician-notes-panel";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Intake, TriageSummary } from "@/types/patient";

export default function PatientDetailPage() {
    const params = useParams();
    const intakeId = params.id as string; // We link to intake ID now
    const [intake, setIntake] = useState<Intake | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchIntake = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/intakes?intakeId=${intakeId}`);
                const payload = await response.json();
                if (!response.ok) throw new Error(payload.error || "Failed to load case");
                setIntake(payload.intake as Intake);
            } catch (err) {
                console.error("Failed to load intake:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (intakeId) fetchIntake();
    }, [intakeId]);

    if (isLoading) {
         return (
            <div className="flex flex-col items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Loading case details...</p>
            </div>
         );
    }

    if (!intake) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px]">
                <p className="text-muted-foreground">Case not found</p>
                <Link href="/dashboard/patients">
                    <Button variant="outline" className="mt-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Queue
                    </Button>
                </Link>
            </div>
        );
    }

    const triage = intake.triage?.[0];
    const tier = triage?.urgency_tier || "Pending";
    const summary = (triage?.summary_json as TriageSummary | undefined) ?? undefined;
    const riskFlags = triage?.risk_flags_json || [];
    const riskScore = triage?.risk_score;
    const phq9Score = triage?.phq9_score;
    const gad7Score = triage?.gad7_score;

    const complaint = intake.answers_json?.complaint;
    const transcript: TranscriptMessage[] = complaint
        ? [
            {
                role: 'patient',
                content: complaint,
                timestamp: new Date(intake.created_at).toISOString()
            }
        ]
        : [];

    const getRiskBadge = (band: string) => {
        switch (band) {
            case "Critical":
                return <Badge className="bg-red-500/20 text-red-400 border-red-500/50 text-lg px-4 py-1">Critical Risk</Badge>;
            case "High":
                return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50 text-lg px-4 py-1">High Risk</Badge>;
            case "Moderate":
                return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-lg px-4 py-1">Moderate Risk</Badge>;
            case "Low":
                return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50 text-lg px-4 py-1">Low Risk</Badge>;
            default:
                return <Badge variant="outline">Pending Assessment</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link href="/dashboard/patients">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Queue
                    </Button>
                </Link>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h2 className="text-2xl font-semibold">{intake.patient?.patient_ref || "Guest Patient"}</h2>
                    {getRiskBadge(tier)}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>ID: {intake.patient?.id}</span>
                    <span>•</span>
                    <span>Submitted: {new Date(intake.created_at).toLocaleString()}</span>
                </div>
            </div>

            {/* Risk Alert */}
            {(tier === "Critical" || tier === "High") && (
                <Panel className="bg-destructive/5 border-destructive/20">
                    <div className="flex items-start gap-3 p-4">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-500">{tier} Risk Alert</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                This patient requires immediate clinical attention. Review key findings below.
                            </p>
                        </div>
                    </div>
                </Panel>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Transcript and Details (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Summary */}
                    <Panel className="p-6">
                        <h3 className="text-lg font-semibold mb-2">Summary</h3>
                        <p className="text-muted-foreground">{summary?.summary || "No data yet."}</p>
                        
                        {summary?.key_findings && summary.key_findings.length > 0 ? (
                            <div className="mt-4 pt-4 border-t border-border">
                                <h4 className="text-sm font-medium mb-2">Key Findings</h4>
                                <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                                    {summary.key_findings.map((f: string, i: number) => (
                                        <li key={i}>{f}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : (
                            <div className="mt-4 pt-4 border-t border-border text-sm text-muted-foreground">
                                Key findings: No data yet.
                            </div>
                        )}
                    </Panel>

                    {/* Intake submission */}
                    <Panel className="overflow-hidden">
                        <div className="p-6 border-b border-border">
                            <h3 className="text-lg font-semibold">Intake submission</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Patient submission captured during intake.
                            </p>
                        </div>
                        <TranscriptViewer messages={transcript} riskPhrases={[]} />
                    </Panel>
                </div>

                {/* Right Column - Risk & Notes (1/3 width) */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Risk Breakdown */}
                    <RiskBreakdown
                        riskScore={riskScore}
                        riskBand={
                            tier === "Critical" || tier === "High" || tier === "Moderate" || tier === "Low"
                                ? tier
                                : undefined
                        }
                        phq9Score={phq9Score}
                        gad7Score={gad7Score}
                        riskPhraseCount={riskFlags.length}
                    />

                    {/* Clinician Notes & Status */}
                    {/* Note: We need to hook this up to real notes table later */}
                    <ClinicianNotesPanel
                        sessionId={intake.id}
                        initialNotes={[]}
                        initialStatus={intake.status === 'reviewed' || intake.status === 'archived' ? 'Actioned' : intake.status === 'triaged' ? 'In Review' : 'New'}
                        auditTrail={[]}
                    />
                </div>
            </div>
        </div>
    );
}
