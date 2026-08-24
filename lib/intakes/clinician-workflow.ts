import type { ClinicianNote, IntakeStatus, StatusAuditEntry } from "@/types/patient";

export type ClinicianWorkflowStatus = "New" | "In Review" | "Actioned";

export type ClinicianWorkflowState = {
  notes: ClinicianNote[];
  status: ClinicianWorkflowStatus;
  auditTrail: StatusAuditEntry[];
};

function normalizeString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeClinicianNote(value: unknown): ClinicianNote | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const content = normalizeString((value as { content?: unknown }).content);
  const author = normalizeString((value as { author?: unknown }).author);
  const timestamp = normalizeString((value as { timestamp?: unknown }).timestamp);

  if (!content || !author || !timestamp) {
    return null;
  }

  return { content, author, timestamp };
}

function normalizeStatusAuditEntry(value: unknown): StatusAuditEntry | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const timestamp = normalizeString((value as { timestamp?: unknown }).timestamp);
  const oldStatus = normalizeString((value as { oldStatus?: unknown }).oldStatus);
  const newStatus = normalizeString((value as { newStatus?: unknown }).newStatus);
  const changedBy = normalizeString((value as { changedBy?: unknown }).changedBy);

  if (!timestamp || !oldStatus || !newStatus || !changedBy) {
    return null;
  }

  const allowedStatuses = new Set(["New", "In Review", "Actioned"]);
  if (!allowedStatuses.has(oldStatus) || !allowedStatuses.has(newStatus)) {
    return null;
  }

  return {
    timestamp,
    oldStatus: oldStatus as StatusAuditEntry["oldStatus"],
    newStatus: newStatus as StatusAuditEntry["newStatus"],
    changedBy,
  };
}

export function deriveWorkflowStatusFromIntakeStatus(
  intakeStatus: IntakeStatus,
): ClinicianWorkflowStatus {
  if (intakeStatus === "reviewed" || intakeStatus === "archived") {
    return "Actioned";
  }

  if (intakeStatus === "triaged") {
    return "In Review";
  }

  return "New";
}

export function normalizeClinicianWorkflowState(params: {
  answersJson: unknown;
  intakeStatus: IntakeStatus;
}): ClinicianWorkflowState {
  const fallbackStatus = deriveWorkflowStatusFromIntakeStatus(params.intakeStatus);

  if (!params.answersJson || typeof params.answersJson !== "object") {
    return {
      notes: [],
      status: fallbackStatus,
      auditTrail: [],
    };
  }

  const workflow = (params.answersJson as { clinician_workflow?: unknown })
    .clinician_workflow;
  if (!workflow || typeof workflow !== "object") {
    return {
      notes: [],
      status: fallbackStatus,
      auditTrail: [],
    };
  }

  const notes = Array.isArray((workflow as { notes?: unknown[] }).notes)
    ? (workflow as { notes?: unknown[] }).notes
        ?.map(normalizeClinicianNote)
        .filter((note): note is ClinicianNote => note !== null) ?? []
    : [];

  const auditTrail = Array.isArray((workflow as { auditTrail?: unknown[] }).auditTrail)
    ? (workflow as { auditTrail?: unknown[] }).auditTrail
        ?.map(normalizeStatusAuditEntry)
        .filter((entry): entry is StatusAuditEntry => entry !== null) ?? []
    : [];

  const statusValue = normalizeString((workflow as { status?: unknown }).status);
  const status =
    statusValue === "New" ||
    statusValue === "In Review" ||
    statusValue === "Actioned"
      ? statusValue
      : fallbackStatus;

  return {
    notes,
    status,
    auditTrail,
  };
}

export function withUpdatedWorkflow(
  answersJson: unknown,
  workflow: ClinicianWorkflowState,
): Record<string, unknown> {
  const base =
    answersJson && typeof answersJson === "object"
      ? (answersJson as Record<string, unknown>)
      : {};

  return {
    ...base,
    clinician_workflow: workflow,
  };
}
