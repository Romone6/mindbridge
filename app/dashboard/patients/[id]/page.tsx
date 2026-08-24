"use client";

import { TranscriptMessage } from "@/types/patient";

import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TranscriptViewer } from "@/components/dashboard/transcript-viewer";
import { RiskBreakdown } from "@/components/dashboard/risk-breakdown";
import { ClinicianNotesPanel } from "@/components/dashboard/clinician-notes-panel";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Intake, TriageSummary } from "@/types/patient";
import { normalizeClinicianHandoffSummary } from "@/lib/handoff/summary";
import { normalizeClinicianWorkflowState } from "@/lib/intakes/clinician-workflow";

type IntakeCapabilities = {
    canTakeover: boolean;
    canDelete: boolean;
    takeoverReason?: string;
    deleteReason?: string;
};

type IntakeDetailResponse = {
    intake?: Intake;
    capabilities?: IntakeCapabilities;
    error?: string;
    code?: string;
};

export default function PatientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const intakeId = params.id as string; // We link to intake ID now
    const [intake, setIntake] = useState<Intake | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [capabilities, setCapabilities] = useState<IntakeCapabilities | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [isTakingOver, setIsTakingOver] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const loadIntakeDetail = useCallback(async () => {
        setIsLoading(true);
        setLoadError(null);
        try {
            const response = await fetch(`/api/intakes?intakeId=${intakeId}`);
            const payload = (await response.json()) as IntakeDetailResponse;
            if (!response.ok || !payload.intake) {
                throw new Error(payload.error || "Failed to load case");
            }

            setIntake(payload.intake);
            setCapabilities(payload.capabilities ?? null);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to load case";
            setLoadError(message);
            setIntake(null);
            setCapabilities(null);
            console.error("Failed to load intake:", err);
        } finally {
            setIsLoading(false);
        }
    }, [intakeId]);

    useEffect(() => {
        if (intakeId) {
            void loadIntakeDetail();
        }
    }, [intakeId, loadIntakeDetail]);

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
                <p className="text-muted-foreground">{loadError || "Case not found"}</p>
                <Button variant="outline" className="mt-4" onClick={() => void loadIntakeDetail()}>
                    Retry loading case
                </Button>
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
    const summary = normalizeClinicianHandoffSummary((triage?.summary_json as TriageSummary | undefined) ?? undefined);
    const riskFlags = triage?.risk_flags_json || [];
    const riskScore =
        typeof triage?.risk_score === "number"
            ? triage.risk_score
            : typeof summary.risk_score === "number"
                ? summary.risk_score
                : undefined;
    const phq9Score = triage?.phq9_score;
    const gad7Score = triage?.gad7_score;

    const complaint = intake.answers_json?.complaint;
    const manualTranscript = typeof intake.answers_json?.aiAnalysis === "string"
        ? intake.answers_json.aiAnalysis.split("Conversation transcript:\n")[1] ?? ""
        : "";
    const transcriptLines = manualTranscript
        .split(/\r?\n\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    const transcriptFromConversation: TranscriptMessage[] = transcriptLines.map((line) => {
        const isAssistant = line.toLowerCase().startsWith("assistant:");
        return {
            role: isAssistant ? "ai" : "patient",
            content: line.replace(/^assistant:\s*/i, "").replace(/^patient:\s*/i, "").trim(),
            timestamp: new Date(intake.created_at).toISOString(),
        };
    });
    const transcript: TranscriptMessage[] = transcriptFromConversation.length > 0
        ? transcriptFromConversation
        : complaint
            ? [{
                role: "patient",
                content: complaint,
                timestamp: new Date(intake.created_at).toISOString(),
            }]
            : [];

    const patientName = intake.answers_json?.patientName?.trim() || "Not provided";
    const patientEmail = intake.answers_json?.patientEmail?.trim() || "Not provided";
    const patientPhone = intake.answers_json?.patientPhone?.trim() || "Not provided";
    const manualTakeoverRequested = Boolean(intake.answers_json?.manualTakeoverRequested);

    const workflow = normalizeClinicianWorkflowState({
        answersJson: intake.answers_json,
        intakeStatus: intake.status,
    });

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

    const handleTakeover = async () => {
        if (!capabilities?.canTakeover || isTakingOver) return;
        setIsTakingOver(true);
        setActionError(null);
        try {
            const response = await fetch("/api/intakes", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ intakeId, action: "claim_takeover" }),
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload.error || "Failed to claim takeover");
            }
            await loadIntakeDetail();
        } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to claim takeover");
        } finally {
            setIsTakingOver(false);
        }
    };

    const handleDelete = async () => {
        if (!capabilities?.canDelete || isDeleting) return;
        const confirmed = window.confirm("Delete this case permanently? This cannot be undone.");
        if (!confirmed) return;

        setIsDeleting(true);
        setActionError(null);
        try {
            const response = await fetch(`/api/intakes?intakeId=${intakeId}`, {
                method: "DELETE",
            });
            const payload = await response.json();
            if (!response.ok) {
                throw new Error(payload.error || "Failed to delete case");
            }
            router.push("/dashboard/patients");
        } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to delete case");
            setIsDeleting(false);
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
                <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Button
                        size="sm"
                        onClick={handleTakeover}
                        disabled={!capabilities?.canTakeover || isTakingOver}
                    >
                        {isTakingOver ? "Claiming..." : "Claim Manual Takeover"}
                    </Button>
                    <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={!capabilities?.canDelete || isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete Case"}
                    </Button>
                </div>
                {actionError && <p className="text-sm text-destructive mb-2">{actionError}</p>}
                {!capabilities?.canTakeover && capabilities?.takeoverReason && (
                    <p className="text-xs text-muted-foreground mb-1">Takeover unavailable: {capabilities.takeoverReason}</p>
                )}
                {!capabilities?.canDelete && capabilities?.deleteReason && (
                    <p className="text-xs text-muted-foreground">Delete unavailable: {capabilities.deleteReason}</p>
                )}
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

            {manualTakeoverRequested && (
                <Panel className="border-primary/30 bg-primary/5 p-4">
                    <h3 className="font-semibold">Manual clinician takeover requested</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        The patient asked for a clinician to continue this intake.
                    </p>
                </Panel>
            )}

            <Panel className="p-6">
                <h3 className="text-lg font-semibold mb-4">Patient details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <p className="text-muted-foreground">Name</p>
                        <p className="font-medium">{patientName}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium break-all">{patientEmail}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Phone</p>
                        <p className="font-medium">{patientPhone}</p>
                    </div>
                </div>
            </Panel>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Transcript and Details (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Summary */}
                    <Panel className="p-6">
                        <h3 className="text-lg font-semibold mb-2">Summary</h3>
                        <p className="text-muted-foreground">{summary.summary}</p>
                        
                        {summary.key_findings.length > 0 ? (
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

                        {summary.recommendations.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-border">
                                <h4 className="text-sm font-medium mb-2">Recommendations</h4>
                                <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                                    {summary.recommendations.map((item: string, i: number) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {summary.insights.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-border">
                                <h4 className="text-sm font-medium mb-2">Insights</h4>
                                <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
                                    {summary.insights.map((item: string, i: number) => (
                                        <li key={i}>{item}</li>
                                    ))}
                                </ul>
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
                    <ClinicianNotesPanel
                        sessionId={intake.id}
                        initialNotes={workflow.notes}
                        initialStatus={workflow.status}
                        auditTrail={workflow.auditTrail}
                    />
                </div>
            </div>
        </div>
    );
}
