import type { IntakeStatus } from "@/types/patient";

export type IntakeCapabilityInput = {
  membershipRole: string | null;
  intakeStatus: IntakeStatus;
  hasTriageOutput: boolean;
  currentUserId: string;
  takeoverByUserId?: string | null;
};

export type IntakeCapabilities = {
  canTakeover: boolean;
  canDelete: boolean;
  takeoverReason?: string;
  deleteReason?: string;
};

const PRIVILEGED_ROLES = new Set([
  "OWNER",
  "STAFF",
  "ADMIN",
  "CLINICIAN",
]);

const DELETE_ELIGIBLE_STATUSES = new Set<IntakeStatus>([
  "triaged",
  "reviewed",
  "archived",
]);

function normalizeRole(role: string | null): string {
  return (role ?? "").trim().toUpperCase();
}

export function isPrivilegedMembershipRole(role: string | null): boolean {
  return PRIVILEGED_ROLES.has(normalizeRole(role));
}

export function parseTakeoverByUserId(answers: unknown): string | null {
  if (!answers || typeof answers !== "object") {
    return null;
  }

  const value = (answers as { clinician_takeover?: { by_user_id?: unknown } })
    .clinician_takeover?.by_user_id;

  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

export function computeIntakeCapabilities(
  input: IntakeCapabilityInput,
): IntakeCapabilities {
  if (!isPrivilegedMembershipRole(input.membershipRole)) {
    return {
      canTakeover: false,
      canDelete: false,
      takeoverReason: "Insufficient role permissions.",
      deleteReason: "Insufficient role permissions.",
    };
  }

  const claimedByAnotherUser =
    Boolean(input.takeoverByUserId) &&
    input.takeoverByUserId !== input.currentUserId;

  const canTakeover =
    !claimedByAnotherUser &&
    input.intakeStatus !== "archived";

  const canDelete =
    DELETE_ELIGIBLE_STATUSES.has(input.intakeStatus) || input.hasTriageOutput;

  return {
    canTakeover,
    canDelete,
    takeoverReason: canTakeover
      ? undefined
      : claimedByAnotherUser
        ? "Case already claimed by another clinician."
        : "Archived cases cannot be claimed.",
    deleteReason: canDelete
      ? undefined
      : "Case can only be deleted after triage or when triage output exists.",
  };
}
