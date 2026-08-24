import { normalizeClinicianWorkflowState } from "@/lib/intakes/clinician-workflow";
import type { IntakeStatus } from "@/types/patient";

export type WorkflowAuditEventType =
  | "takeover_claimed"
  | "status_change"
  | "note_added";

export type WorkflowAuditEvent = {
  intakeId: string;
  patientId: string | null;
  intakeStatus: IntakeStatus;
  workflowStatus: "New" | "In Review" | "Actioned";
  eventType: WorkflowAuditEventType;
  eventAt: string;
  actor: string;
  detail: string;
};

export type WorkflowAuditFilter = {
  from?: string;
  to?: string;
  actor?: string;
  eventType?: WorkflowAuditEventType;
};

export type IntakeAuditSource = {
  id: string;
  patient_id: string | null;
  status: IntakeStatus;
  answers_json: unknown;
};

function normalizeActor(input: unknown, fallback: string): string {
  if (typeof input !== "string") {
    return fallback;
  }

  const value = input.trim();
  return value.length > 0 ? value : fallback;
}

function normalizeTimestamp(input: unknown): string | null {
  if (typeof input !== "string") {
    return null;
  }

  const timestamp = input.trim();
  return timestamp.length > 0 ? timestamp : null;
}

export function buildWorkflowAuditEvents(
  intakeRows: IntakeAuditSource[],
): WorkflowAuditEvent[] {
  const events: WorkflowAuditEvent[] = [];

  for (const intake of intakeRows) {
    const workflow = normalizeClinicianWorkflowState({
      answersJson: intake.answers_json,
      intakeStatus: intake.status,
    });

    const takeover =
      intake.answers_json && typeof intake.answers_json === "object"
        ? (intake.answers_json as {
            clinician_takeover?: {
              claimed_at?: unknown;
              claimed_by?: unknown;
              by_user_id?: unknown;
            };
          }).clinician_takeover
        : undefined;

    const claimedAt = normalizeTimestamp(takeover?.claimed_at);
    if (claimedAt) {
      events.push({
        intakeId: intake.id,
        patientId: intake.patient_id,
        intakeStatus: intake.status,
        workflowStatus: workflow.status,
        eventType: "takeover_claimed",
        eventAt: claimedAt,
        actor: normalizeActor(
          takeover?.claimed_by ?? takeover?.by_user_id,
          "Clinician",
        ),
        detail: "Manual takeover claim recorded.",
      });
    }

    for (const entry of workflow.auditTrail) {
      events.push({
        intakeId: intake.id,
        patientId: intake.patient_id,
        intakeStatus: intake.status,
        workflowStatus: workflow.status,
        eventType: "status_change",
        eventAt: entry.timestamp,
        actor: entry.changedBy,
        detail: `Status changed from ${entry.oldStatus} to ${entry.newStatus}.`,
      });
    }

    for (const note of workflow.notes) {
      events.push({
        intakeId: intake.id,
        patientId: intake.patient_id,
        intakeStatus: intake.status,
        workflowStatus: workflow.status,
        eventType: "note_added",
        eventAt: note.timestamp,
        actor: note.author,
        detail: `Note added: ${note.content}`,
      });
    }
  }

  return events.sort((a, b) => b.eventAt.localeCompare(a.eventAt));
}

export function filterWorkflowAuditEvents(
  events: WorkflowAuditEvent[],
  filter: WorkflowAuditFilter,
): WorkflowAuditEvent[] {
  return events.filter((event) => {
    if (filter.from && event.eventAt < filter.from) {
      return false;
    }

    if (filter.to && event.eventAt > filter.to) {
      return false;
    }

    if (filter.actor) {
      const actorNeedle = filter.actor.toLowerCase();
      if (!event.actor.toLowerCase().includes(actorNeedle)) {
        return false;
      }
    }

    if (filter.eventType && event.eventType !== filter.eventType) {
      return false;
    }

    return true;
  });
}

export function paginateWorkflowAuditEvents(
  events: WorkflowAuditEvent[],
  params: { limit: number; offset: number },
): WorkflowAuditEvent[] {
  return events.slice(params.offset, params.offset + params.limit);
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function workflowAuditEventsToCsv(events: WorkflowAuditEvent[]): string {
  const header =
    "event_at,event_type,intake_id,patient_id,intake_status,workflow_status,actor,detail";
  const rows = events.map((event) =>
    [
      event.eventAt,
      event.eventType,
      event.intakeId,
      event.patientId ?? "",
      event.intakeStatus,
      event.workflowStatus,
      event.actor,
      event.detail,
    ]
      .map((value) => csvEscape(value))
      .join(","),
  );

  return [header, ...rows].join("\n");
}

export function workflowAuditEventsToCsvStream(
  events: WorkflowAuditEvent[],
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const header =
    "event_at,event_type,intake_id,patient_id,intake_status,workflow_status,actor,detail\n";

  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encoder.encode(header));

      for (const event of events) {
        const row = [
          event.eventAt,
          event.eventType,
          event.intakeId,
          event.patientId ?? "",
          event.intakeStatus,
          event.workflowStatus,
          event.actor,
          event.detail,
        ]
          .map((value) => csvEscape(value))
          .join(",");

        controller.enqueue(encoder.encode(`${row}\n`));
      }

      controller.close();
    },
  });
}
