"use client";

import { Panel } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { ClinicianNote, StatusAuditEntry } from "@/types/patient";
import { Save, Check } from "lucide-react";

type WorkflowStatus = "New" | "In Review" | "Actioned";
type WorkflowPayload = {
    workflow?: {
        notes: ClinicianNote[];
        status: WorkflowStatus;
        auditTrail: StatusAuditEntry[];
    };
    error?: string;
};

interface ClinicianNotesPanelProps {
    sessionId: string;
    initialNotes: ClinicianNote[];
    initialStatus: WorkflowStatus;
    auditTrail: StatusAuditEntry[];
}

export function ClinicianNotesPanel({
    sessionId,
    initialNotes,
    initialStatus,
    auditTrail
}: ClinicianNotesPanelProps) {
    const [noteContent, setNoteContent] = useState("");
    const [status, setStatus] = useState<WorkflowStatus>(initialStatus);
    const [notes, setNotes] = useState<ClinicianNote[]>(initialNotes);
    const [audit, setAudit] = useState<StatusAuditEntry[]>(auditTrail);
    const [isSaving, setIsSaving] = useState(false);
    const [isStatusSaving, setIsStatusSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    useEffect(() => {
        setNotes(initialNotes);
        setStatus(initialStatus);
        setAudit(auditTrail);
    }, [initialNotes, initialStatus, auditTrail, sessionId]);

    const applyWorkflowPayload = (payload: WorkflowPayload) => {
        if (payload.workflow) {
            setNotes(payload.workflow.notes);
            setStatus(payload.workflow.status);
            setAudit(payload.workflow.auditTrail);
        }
    };

    const handleSaveNote = async () => {
        const content = noteContent.trim();
        if (!content) return;

        setIsSaving(true);
        setActionError(null);

        try {
            const response = await fetch("/api/intakes", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    intakeId: sessionId,
                    action: "add_note",
                    content,
                }),
            });

            const payload = (await response.json()) as WorkflowPayload;
            if (!response.ok) {
                throw new Error(payload.error || "Failed to save note");
            }

            applyWorkflowPayload(payload);
            setNoteContent("");
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to save note");
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusChange = async (newStatus: WorkflowStatus) => {
        if (newStatus === status) return;

        setIsStatusSaving(true);
        setActionError(null);
        try {
            const response = await fetch("/api/intakes", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    intakeId: sessionId,
                    action: "set_status",
                    status: newStatus,
                }),
            });

            const payload = (await response.json()) as WorkflowPayload;
            if (!response.ok) {
                throw new Error(payload.error || "Failed to update status");
            }

            applyWorkflowPayload(payload);
        } catch (error) {
            setActionError(error instanceof Error ? error.message : "Failed to update status");
        } finally {
            setIsStatusSaving(false);
        }
    };

    const getStatusBadge = (s: string) => {
        switch (s) {
            case "New":
                return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">New</Badge>;
            case "In Review":
                return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/50">In Review</Badge>;
            case "Actioned":
                return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/50">Actioned</Badge>;
        }
    };

        return (
        <div className="space-y-6">
            {/* Clinician Notes Section */}
            <Panel className="p-6">
                <h3 className="text-lg font-semibold mb-4">Clinician Notes / Plan</h3>

                {/* Existing Notes */}
                {notes.length > 0 ? (
                    <div className="mb-4 space-y-3">
                        {notes.map((note, index) => (
                            <div key={index} className="p-3 bg-muted/20 rounded-lg border border-border">
                                <div className="flex items-start justify-between mb-2">
                                    <span className="text-xs font-medium text-primary">{note.author}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(note.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{note.content}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground mb-4">No notes yet.</p>
                )}

                {/* New Note Input */}
                <div className="space-y-3">
                    <Textarea
                        placeholder="Add clinical notes, treatment plan, or recommendations..."
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        rows={4}
                        className="resize-none"
                    />
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                            {isSaved && "Saved "}
                            {isSaving && "Saving..."}
                        </span>
                        <Button
                            onClick={handleSaveNote}
                            disabled={!noteContent.trim() || isSaving}
                            size="sm"
                        >
                            {isSaved ? (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Saved
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Note
                                </>
                            )}
                        </Button>
                    </div>
                    {actionError && <p className="text-xs text-destructive">{actionError}</p>}
                </div>
            </Panel>

            {/* Status Management */}
            <Panel className="p-6">
                <h3 className="text-lg font-semibold mb-4">Triage Status</h3>
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-muted-foreground">Current Status:</span>
                    {getStatusBadge(status)}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={status === "New" ? "default" : "outline"}
                        onClick={() => handleStatusChange("New")}
                        size="sm"
                        disabled={isStatusSaving}
                    >
                        New
                    </Button>
                    <Button
                        variant={status === "In Review" ? "default" : "outline"}
                        onClick={() => handleStatusChange("In Review")}
                        size="sm"
                        disabled={isStatusSaving}
                    >
                        In Review
                    </Button>
                    <Button
                        variant={status === "Actioned" ? "default" : "outline"}
                        onClick={() => handleStatusChange("Actioned")}
                        size="sm"
                        disabled={isStatusSaving}
                    >
                        Actioned
                    </Button>
                </div>
            </Panel>

            {/* Audit Trail */}
            <Panel className="p-6">
                <h3 className="text-lg font-semibold mb-4">Audit Trail</h3>
                {audit.length > 0 ? (
                    <div className="space-y-2">
                        {audit.map((entry, index) => (
                            <div
                                key={index}
                                className="flex flex-wrap items-center justify-between gap-2 text-sm p-2 rounded bg-muted/20"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-muted-foreground">
                                        {new Date(entry.timestamp).toLocaleString()}
                                    </span>
                                    <span>
                                        {getStatusBadge(entry.oldStatus)} → {getStatusBadge(entry.newStatus)}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground">{entry.changedBy}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No audit activity yet.</p>
                )}
            </Panel>
        </div>
    );
}
