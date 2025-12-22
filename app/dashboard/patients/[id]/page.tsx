"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TranscriptViewer } from "@/components/dashboard/transcript-viewer";
import { RiskBreakdown } from "@/components/dashboard/risk-breakdown";
import { ClinicianNotesPanel } from "@/components/dashboard/clinician-notes-panel";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { PATIENTS } from "@/lib/mock-data";
import { getSeverityColor } from "@/lib/risk-phrases";

export default function PatientDetailPage() {
    const params = useParams();
    const patientId = params.id as string;
    const patient = PATIENTS.find(p => p.id === patientId);

    if (!patient) {
        return (
            <DashboardShell>
                <div className="flex flex-col items-center justify-center h-[400px]">
                    <p className="text-muted-foreground">Patient not found</p>
                    <Link href="/dashboard">
                        <Button variant="outline" className="mt-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </DashboardShell>
        );
    }

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
                return null;
        }
    };

    return (
        <DashboardShell>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="mb-4">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Dashboard
                        </Button>
                    </Link>
                    <div className="flex items-center gap-4 mb-2">
                        <h2 className="text-3xl font-bold tracking-tight">{patient.patient_pseudonym}</h2>
                        {getRiskBadge(patient.risk_band)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{patient.name}</span>
                        <span>•</span>
                        <span>Age {patient.age}</span>
                        <span>•</span>
                        <span>{patient.id}</span>
                    </div>
                </div>

                {/* Risk Alert */}
                {(patient.risk_band === "Critical" || patient.risk_band === "High") && (
                    <Panel className="bg-destructive/5 border-destructive/20">
                        <div className="flex items-start gap-3 p-4">
                            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-500">{patient.risk_band} Risk Alert</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    This patient requires immediate clinical attention. Review full assessment and risk factors below.
                                </p>
                            </div>
                        </div>
                    </Panel>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Transcript and Details (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Chief Complaint */}
                        <Panel className="p-6">
                            <h3 className="text-lg font-semibold mb-2">Chief Complaint</h3>
                            <p className="text-muted-foreground">{patient.chief_complaint}</p>
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <h4 className="text-sm font-medium mb-2">Key Reason</h4>
                                <p className="text-sm text-muted-foreground">{patient.key_reason}</p>
                            </div>
                        </Panel>

                        {/* Full Transcript */}
                        <Panel className="overflow-hidden">
                            <div className="p-6 border-b border-white/10">
                                <h3 className="text-lg font-semibold">Full Conversation Transcript</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Patient messages are shown on the right. Risk phrases are highlighted in yellow.
                                </p>
                            </div>
                            <TranscriptViewer messages={patient.full_transcript} riskPhrases={patient.risk_phrases} />
                        </Panel>

                        {/* Risk Phrases Detected */}
                        {patient.risk_phrases.length > 0 && (
                            <Panel className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Detected Risk Phrases</h3>
                                <div className="space-y-3">
                                    {patient.risk_phrases.map((rp, index) => (
                                        <div
                                            key={index}
                                            className="p-3 bg-white/5 rounded-lg border border-white/10"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <Badge className={getSeverityColor(rp.severity)}>
                                                    {rp.severity} risk
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    Message #{rp.messageIndex + 1}
                                                </span>
                                            </div>
                                            <p className="text-sm mb-2">
                                                <span className="text-muted-foreground">&quot;</span>
                                                <span className="text-yellow-200">{rp.phrase}</span>
                                                <span className="text-muted-foreground">&quot;</span>
                                            </p>
                                            <p className="text-xs text-muted-foreground italic">
                                                Context: &quot;{rp.context}&quot;
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        )}
                    </div>

                    {/* Right Column - Risk & Notes (1/3 width) */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Risk Breakdown */}
                        <RiskBreakdown
                            riskScore={patient.risk_score}
                            riskBand={patient.risk_band}
                            phq9Score={patient.phq9_score}
                            gad7Score={patient.gad7_score}
                            riskPhraseCount={patient.risk_phrases.length}
                        />

                        {/* Clinician Notes & Status */}
                        <ClinicianNotesPanel
                            sessionId={patient.id}
                            initialNotes={patient.notes}
                            initialStatus={patient.triage_status}
                            auditTrail={patient.audit_trail}
                        />
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}
