"use client";

import { Panel } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { ClinicianNote, StatusAuditEntry } from "@/lib/mock-data";
import { Save, Check } from "lucide-react";

interface ClinicianNotesPanelProps {
    sessionId: string;
    initialNotes: ClinicianNote[];
    initialStatus: "New" | "In Review" | "Actioned";
    auditTrail: StatusAuditEntry[];
}

export function ClinicianNotesPanel({
    sessionId,
    initialNotes,
    initialStatus,
    auditTrail
}: ClinicianNotesPanelProps) {
    const [noteContent, setNoteContent] = useState("");
    const [status, setStatus] = useState<"New" | "In Review" | "Actioned">(initialStatus);
    const [notes, setNotes] = useState<ClinicianNote[]>(initialNotes);
    const [audit, setAudit] = useState<StatusAuditEntry[]>(auditTrail);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const savedNotes = localStorage.getItem(`notes-${sessionId}`);
        const savedStatus = localStorage.getItem(`status-${sessionId}`);
        const savedAudit = localStorage.getItem(`audit-${sessionId}`);

        if (savedNotes) {
            setNotes(JSON.parse(savedNotes));
        }
        if (savedStatus) {
            setStatus(savedStatus as "New" | "In Review" | "Actioned");
        }
        if (savedAudit) {
            setAudit(JSON.parse(savedAudit));
        }
    }, [sessionId]);

    const handleSaveNote = () => {
        if (!noteContent.trim()) return;

        setIsSaving(true);
        const newNote: ClinicianNote = {
            content: noteContent,
            author: "Dr. Demo",
            timestamp: new Date().toISOString()
        };

        const updatedNotes = [...notes, newNote];
        setNotes(updatedNotes);
        setNoteContent("");

        // Save to localStorage
        localStorage.setItem(`notes-${sessionId}`, JSON.stringify(updatedNotes));

        setTimeout(() => {
            setIsSaving(false);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        }, 500);
    };

    const handleStatusChange = (newStatus: "New" | "In Review" | "Actioned") => {
        if (newStatus === status) return;

        const auditEntry: StatusAuditEntry = {
            timestamp: new Date().toISOString(),
            oldStatus: status,
            newStatus: newStatus,
            changedBy: "Dr. Demo"
        };

        const updatedAudit = [...audit, auditEntry];
        setStatus(newStatus);
        setAudit(updatedAudit);

        // Save to localStorage
        localStorage.setItem(`status-${sessionId}`, newStatus);
        localStorage.setItem(`audit-${sessionId}`, JSON.stringify(updatedAudit));
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
                {notes.length > 0 && (
                    <div className="mb-4 space-y-3">
                        {notes.map((note, index) => (
                            <div key={index} className="p-3 bg-white/5 rounded-lg border border-white/10">
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
                    >
                        New
                    </Button>
                    <Button
                        variant={status === "In Review" ? "default" : "outline"}
                        onClick={() => handleStatusChange("In Review")}
                        size="sm"
                    >
                        In Review
                    </Button>
                    <Button
                        variant={status === "Actioned" ? "default" : "outline"}
                        onClick={() => handleStatusChange("Actioned")}
                        size="sm"
                    >
                        Actioned
                    </Button>
                </div>
            </Panel>

            {/* Audit Trail */}
            <Panel className="p-6">
                <h3 className="text-lg font-semibold mb-4">Audit Trail</h3>
                <div className="space-y-2">
                    {audit.map((entry, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between text-sm p-2 rounded bg-white/5"
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
            </Panel>
        </div>
    );
}
