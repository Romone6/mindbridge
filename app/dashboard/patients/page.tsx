"use client";

import { Panel } from "@/components/ui/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { Search, AlertTriangle, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useClinic } from "@/components/providers/clinic-provider";
import { Intake } from "@/types/patient";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { WorkflowAuditEvent } from "@/lib/intakes/workflow-audit";
import type { AuditExportMetadata } from "@/lib/intakes/audit-export";

type AuditPreviewResponse = {
    events?: WorkflowAuditEvent[];
    metadata?: AuditExportMetadata;
    total?: number;
    error?: string;
};

type AuditExportLog = {
    id: string;
    exported_by_label: string;
    export_format: "json" | "csv";
    event_count: number;
    filter_json: {
        from?: string | null;
        to?: string | null;
        actor?: string | null;
        eventType?: string | null;
    };
    exported_at: string;
};

type AuditLogsResponse = {
    logs?: AuditExportLog[];
    count?: number;
    total?: number;
    limit?: number;
    offset?: number;
    hasMore?: boolean;
    error?: string;
};

const getRiskBadge = (tier: string) => {
    switch (tier) {
        case "Critical":
        case "High":
            return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">{tier} Risk</Badge>;
        case "Moderate":
            return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">{tier}</Badge>;
        case "Low":
            return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{tier}</Badge>;
        default:
            return <Badge variant="outline">Pending</Badge>;
    }
};

const getRiskIcon = (tier: string) => {
    switch (tier) {
        case "Critical":
        case "High":
            return <AlertTriangle className="h-4 w-4 text-rose-500" />;
        case "Moderate":
            return <Clock className="h-4 w-4 text-amber-500" />;
        case "Low":
            return <CheckCircle className="h-4 w-4 text-emerald-500" />;
        default:
            return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
};

export default function PatientsPage() {
    const { currentClinic } = useClinic();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [intakes, setIntakes] = useState<Intake[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExportingAudit, setIsExportingAudit] = useState(false);
    const [auditFrom, setAuditFrom] = useState("");
    const [auditTo, setAuditTo] = useState("");
    const [auditActor, setAuditActor] = useState("");
    const [auditEventType, setAuditEventType] = useState<"all" | "takeover_claimed" | "status_change" | "note_added">("all");
    const [isPreviewingAudit, setIsPreviewingAudit] = useState(false);
    const [auditPreview, setAuditPreview] = useState<WorkflowAuditEvent[]>([]);
    const [auditPreviewMetadata, setAuditPreviewMetadata] = useState<AuditExportMetadata | null>(null);
    const [auditPreviewOffset, setAuditPreviewOffset] = useState(0);
    const [auditPreviewTotal, setAuditPreviewTotal] = useState(0);
    const [auditLogs, setAuditLogs] = useState<AuditExportLog[]>([]);
    const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false);
    const [auditLogsFrom, setAuditLogsFrom] = useState("");
    const [auditLogsTo, setAuditLogsTo] = useState("");
    const [auditLogsActor, setAuditLogsActor] = useState("");
    const [auditLogsFormat, setAuditLogsFormat] = useState<"all" | "json" | "csv">("all");
    const [auditLogsOffset, setAuditLogsOffset] = useState(0);
    const [auditLogsTotal, setAuditLogsTotal] = useState(0);
    const PREVIEW_PAGE_SIZE = 20;
    const AUDIT_LOGS_PAGE_SIZE = 10;

    useEffect(() => {
        if (!currentClinic) return;

        const fetchIntakes = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/intakes?clinicId=${currentClinic.id}`);
                const payload = await response.json();
                if (!response.ok) throw new Error(payload.error || "Failed to load queue");
                setIntakes(payload.intakes as Intake[]);
            } catch (error) {
                console.error("Failed to fetch intakes:", error);
                toast.error("Failed to load patient queue");
            } finally {
                setIsLoading(false);
            }
        };

        fetchIntakes();
    }, [currentClinic]);

    const loadAuditLogs = useCallback(async (offset = 0) => {
        if (!currentClinic?.id) return;

        setIsLoadingAuditLogs(true);
        try {
            const params = new URLSearchParams({
                clinicId: currentClinic.id,
                limit: String(AUDIT_LOGS_PAGE_SIZE),
                offset: String(offset),
            });

            if (auditLogsFrom) {
                params.set("from", new Date(auditLogsFrom).toISOString());
            }

            if (auditLogsTo) {
                params.set("to", new Date(auditLogsTo).toISOString());
            }

            if (auditLogsActor.trim()) {
                params.set("actor", auditLogsActor.trim());
            }

            if (auditLogsFormat !== "all") {
                params.set("format", auditLogsFormat);
            }

            const response = await fetch(`/api/intakes/audit/logs?${params.toString()}`);
            const payload = (await response.json()) as AuditLogsResponse;
            if (!response.ok) {
                throw new Error(payload.error || "Failed to load audit export logs");
            }

            setAuditLogs(payload.logs || []);
            setAuditLogsOffset(typeof payload.offset === "number" ? payload.offset : offset);
            setAuditLogsTotal(typeof payload.total === "number" ? payload.total : payload.logs?.length || 0);
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to load audit export logs";
            toast.error(message);
            setAuditLogs([]);
            setAuditLogsOffset(0);
            setAuditLogsTotal(0);
        } finally {
            setIsLoadingAuditLogs(false);
        }
    }, [
        currentClinic?.id,
        AUDIT_LOGS_PAGE_SIZE,
        auditLogsFrom,
        auditLogsTo,
        auditLogsActor,
        auditLogsFormat,
    ]);

    useEffect(() => {
        if (!currentClinic?.id) {
            setAuditLogs([]);
            setAuditLogsOffset(0);
            setAuditLogsTotal(0);
            return;
        }

        void loadAuditLogs(0);
    }, [currentClinic?.id, loadAuditLogs]);

    const handleNextAuditLogsPage = async () => {
        const nextOffset = auditLogsOffset + AUDIT_LOGS_PAGE_SIZE;
        if (nextOffset >= auditLogsTotal || isLoadingAuditLogs) return;
        await loadAuditLogs(nextOffset);
    };

    const handlePrevAuditLogsPage = async () => {
        const prevOffset = Math.max(0, auditLogsOffset - AUDIT_LOGS_PAGE_SIZE);
        if (prevOffset === auditLogsOffset || isLoadingAuditLogs) return;
        await loadAuditLogs(prevOffset);
    };

    const filteredIntakes = intakes.filter((intake) => {
        const patientName = intake.patient?.patient_ref || "Unknown";
        const matchesSearch = patientName.toLowerCase().includes(searchTerm.toLowerCase());
        
        // Filter logic: Map specific filters to risk tiers
        const triage = intake.triage?.[0];
        const tier = triage?.urgency_tier || "Pending";
        
        let matchesFilter = true;
        if (filterStatus !== "all") {
             if (filterStatus === "high") matchesFilter = tier === "High" || tier === "Critical";
             else if (filterStatus === "moderate") matchesFilter = tier === "Moderate";
             else if (filterStatus === "low") matchesFilter = tier === "Low";
        }
        
        return matchesSearch && matchesFilter;
    });

    const buildAuditQueryParams = (options?: { limit?: number; offset?: number; format?: "json" | "csv" }) => {
        const params = new URLSearchParams({
            clinicId: currentClinic?.id || "",
        });

        if (options?.format) {
            params.set("format", options.format);
        }

        if (auditFrom) {
            params.set("from", new Date(auditFrom).toISOString());
        }

        if (auditTo) {
            params.set("to", new Date(auditTo).toISOString());
        }

        if (auditActor.trim()) {
            params.set("actor", auditActor.trim());
        }

        if (auditEventType !== "all") {
            params.set("eventType", auditEventType);
        }

        if (typeof options?.limit === "number") {
            params.set("limit", String(options.limit));
        }

        if (typeof options?.offset === "number") {
            params.set("offset", String(options.offset));
        }

        return params;
    };

    const loadAuditPreview = async (offset: number) => {
        if (!currentClinic?.id || isPreviewingAudit) return;

        setIsPreviewingAudit(true);
        try {
            const params = buildAuditQueryParams({
                format: "json",
                limit: PREVIEW_PAGE_SIZE,
                offset,
            });

            const response = await fetch(`/api/intakes/audit?${params.toString()}`);
            const payload = (await response.json()) as AuditPreviewResponse;
            if (!response.ok) {
                throw new Error(payload.error || "Failed to preview workflow audit");
            }

            setAuditPreview(payload.events || []);
            setAuditPreviewMetadata(payload.metadata || null);
            setAuditPreviewTotal(payload.total || 0);
            setAuditPreviewOffset(offset);
            toast.success("Workflow audit preview refreshed");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to preview workflow audit";
            toast.error(message);
        } finally {
            setIsPreviewingAudit(false);
        }
    };

    const handlePreviewAudit = async () => {
        await loadAuditPreview(0);
    };

    const handleNextPreviewPage = async () => {
        const nextOffset = auditPreviewOffset + PREVIEW_PAGE_SIZE;
        if (nextOffset >= auditPreviewTotal) return;
        await loadAuditPreview(nextOffset);
    };

    const handlePrevPreviewPage = async () => {
        const prevOffset = Math.max(0, auditPreviewOffset - PREVIEW_PAGE_SIZE);
        await loadAuditPreview(prevOffset);
    };

    const handleExportAuditCsv = async () => {
        if (!currentClinic?.id || isExportingAudit) return;

        setIsExportingAudit(true);
        try {
            const params = buildAuditQueryParams({ format: "csv" });

            const response = await fetch(`/api/intakes/audit?${params.toString()}`);

            if (!response.ok) {
                const payload = await response.json().catch(() => null);
                throw new Error(payload?.error || "Failed to export audit CSV");
            }

            const blob = await response.blob();
            const disposition = response.headers.get("content-disposition") || "";
            const filenameMatch = disposition.match(/filename="([^"]+)"/i);
            const filename = filenameMatch?.[1] || `intake-workflow-audit-${currentClinic.id}.csv`;

            const objectUrl = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = objectUrl;
            anchor.download = filename;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(objectUrl);

            toast.success("Workflow audit CSV downloaded");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to export audit CSV";
            toast.error(message);
        } finally {
            setIsExportingAudit(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Patient queue</h2>
                <p className="text-muted-foreground">
                    Triage queue for {currentClinic?.name || "your clinic"}.
                </p>
                <div className="mt-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportAuditCsv}
                        disabled={!currentClinic?.id || isExportingAudit}
                    >
                        {isExportingAudit ? "Exporting audit..." : "Export workflow audit CSV"}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={handlePreviewAudit}
                        disabled={!currentClinic?.id || isPreviewingAudit}
                    >
                        {isPreviewingAudit ? "Loading preview..." : "Preview filtered audit"}
                    </Button>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-4">
                    <Input
                        type="datetime-local"
                        value={auditFrom}
                        onChange={(e) => setAuditFrom(e.target.value)}
                        placeholder="From"
                    />
                    <Input
                        type="datetime-local"
                        value={auditTo}
                        onChange={(e) => setAuditTo(e.target.value)}
                        placeholder="To"
                    />
                    <Input
                        value={auditActor}
                        onChange={(e) => setAuditActor(e.target.value)}
                        placeholder="Filter actor (optional)"
                    />
                    <select
                        value={auditEventType}
                        onChange={(e) => setAuditEventType(e.target.value as "all" | "takeover_claimed" | "status_change" | "note_added")}
                        className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
                    >
                        <option value="all">All event types</option>
                        <option value="takeover_claimed">Takeover claimed</option>
                        <option value="status_change">Status changes</option>
                        <option value="note_added">Notes</option>
                    </select>
                </div>
                {(auditPreview.length > 0 || auditPreviewMetadata) && (
                    <Panel className="mt-4 p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold">Audit preview</h3>
                            {auditPreviewMetadata && (
                                <span className="text-xs text-muted-foreground">
                                    {auditPreviewMetadata.count} events • exported by {auditPreviewMetadata.exportedBy}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handlePrevPreviewPage}
                                disabled={isPreviewingAudit || auditPreviewOffset === 0}
                            >
                                Previous
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleNextPreviewPage}
                                disabled={
                                    isPreviewingAudit ||
                                    auditPreviewOffset + PREVIEW_PAGE_SIZE >= auditPreviewTotal
                                }
                            >
                                Next
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                Showing {auditPreviewTotal === 0 ? 0 : auditPreviewOffset + 1}-{Math.min(auditPreviewOffset + auditPreview.length, auditPreviewTotal)} of {auditPreviewTotal}
                            </span>
                        </div>
                        {auditPreview.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No audit events match the current filters.</p>
                        ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {auditPreview.slice(0, 20).map((event) => (
                                    <div key={`${event.intakeId}-${event.eventAt}-${event.eventType}`} className="text-sm border-b border-border pb-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-medium">{event.eventType}</span>
                                            <span className="text-xs text-muted-foreground">{new Date(event.eventAt).toLocaleString()}</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">{event.actor} • intake {event.intakeId}</div>
                                        <div>{event.detail}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Panel>
                )}
                <Panel className="mt-4 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold">Recent audit exports</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                                Showing {auditLogsTotal === 0 ? 0 : auditLogsOffset + 1}-{Math.min(auditLogsOffset + auditLogs.length, auditLogsTotal)} of {auditLogsTotal}
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void handlePrevAuditLogsPage()}
                                disabled={isLoadingAuditLogs || auditLogsOffset === 0}
                            >
                                Previous
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void handleNextAuditLogsPage()}
                                disabled={
                                    isLoadingAuditLogs ||
                                    auditLogsOffset + AUDIT_LOGS_PAGE_SIZE >= auditLogsTotal
                                }
                            >
                                Next
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void loadAuditLogs(auditLogsOffset)}
                                disabled={isLoadingAuditLogs}
                            >
                                {isLoadingAuditLogs ? "Refreshing..." : "Refresh logs"}
                            </Button>
                        </div>
                    </div>
                    <div className="grid gap-2 md:grid-cols-4 mb-3">
                        <Input
                            type="datetime-local"
                            value={auditLogsFrom}
                            onChange={(e) => setAuditLogsFrom(e.target.value)}
                            placeholder="From"
                        />
                        <Input
                            type="datetime-local"
                            value={auditLogsTo}
                            onChange={(e) => setAuditLogsTo(e.target.value)}
                            placeholder="To"
                        />
                        <Input
                            value={auditLogsActor}
                            onChange={(e) => setAuditLogsActor(e.target.value)}
                            placeholder="Filter actor"
                        />
                        <select
                            value={auditLogsFormat}
                            onChange={(e) => setAuditLogsFormat(e.target.value as "all" | "json" | "csv")}
                            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm"
                        >
                            <option value="all">All formats</option>
                            <option value="csv">CSV</option>
                            <option value="json">JSON</option>
                        </select>
                    </div>
                    {isLoadingAuditLogs ? (
                        <p className="text-sm text-muted-foreground">Loading export logs...</p>
                    ) : auditLogs.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No export logs recorded yet.</p>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {auditLogs.map((log) => (
                                <div key={log.id} className="text-sm border-b border-border pb-2">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium">{log.export_format.toUpperCase()} export</span>
                                        <span className="text-xs text-muted-foreground">
                                            {new Date(log.exported_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {log.exported_by_label} • {log.event_count} events
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Panel>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filterStatus === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterStatus("all")}
                    >
                        All
                    </Button>
                    <Button
                        variant={filterStatus === "high" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterStatus("high")}
                    >
                        High Risk
                    </Button>
                    <Button
                        variant={filterStatus === "moderate" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterStatus("moderate")}
                    >
                        Moderate
                    </Button>
                    <Button
                        variant={filterStatus === "low" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterStatus("low")}
                    >
                        Low Risk
                    </Button>
                </div>
            </div>

            {/* Patient List */}
            <Panel className="overflow-hidden min-h-[300px]">
                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredIntakes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <p>No patients found.</p>
                        <p className="text-sm">New intakes will appear here automatically.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Patient</TableHead>
                                <TableHead>Risk level</TableHead>
                                <TableHead>Summary</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredIntakes.map((intake) => {
                                const triage = intake.triage?.[0];
                                const tier = triage?.urgency_tier || "Pending";
                                const summary = triage?.summary_json?.summary || "No summary available";

                                return (
                                    <TableRow key={intake.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {getRiskIcon(tier)}
                                                <div>
                                                    <div className="font-medium">{intake.patient?.patient_ref || "Guest"}</div>
                                                    <div className="text-sm text-muted-foreground">ID: {intake.patient?.id.slice(0, 8)}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getRiskBadge(tier)}</TableCell>
                                        <TableCell className="max-w-md">
                                            <span className="text-sm text-muted-foreground line-clamp-2">{summary}</span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(intake.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Link href={`/dashboard/patients/${intake.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    Review case
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </Panel>
        </div>
    );
}
