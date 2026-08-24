import assert from "node:assert/strict";
import { test } from "node:test";
import {
  deriveWorkflowStatusFromIntakeStatus,
  normalizeClinicianWorkflowState,
  withUpdatedWorkflow,
} from "@/lib/intakes/clinician-workflow";

test("deriveWorkflowStatusFromIntakeStatus maps intake statuses", () => {
  assert.equal(deriveWorkflowStatusFromIntakeStatus("pending"), "New");
  assert.equal(deriveWorkflowStatusFromIntakeStatus("triaged"), "In Review");
  assert.equal(deriveWorkflowStatusFromIntakeStatus("reviewed"), "Actioned");
  assert.equal(deriveWorkflowStatusFromIntakeStatus("archived"), "Actioned");
});

test("normalizeClinicianWorkflowState returns defaults for missing workflow", () => {
  const state = normalizeClinicianWorkflowState({
    answersJson: null,
    intakeStatus: "triaged",
  });

  assert.deepEqual(state.notes, []);
  assert.equal(state.status, "In Review");
  assert.deepEqual(state.auditTrail, []);
});

test("normalizeClinicianWorkflowState sanitizes malformed workflow payload", () => {
  const state = normalizeClinicianWorkflowState({
    answersJson: {
      clinician_workflow: {
        status: "Actioned",
        notes: [
          { content: " valid ", author: "Dr A", timestamp: "2026-01-01" },
          { content: "", author: "Dr B", timestamp: "2026-01-01" },
        ],
        auditTrail: [
          {
            timestamp: "2026-01-01",
            oldStatus: "In Review",
            newStatus: "Actioned",
            changedBy: "Dr A",
          },
          {
            timestamp: "2026-01-01",
            oldStatus: "INVALID",
            newStatus: "Actioned",
            changedBy: "Dr B",
          },
        ],
      },
    },
    intakeStatus: "pending",
  });

  assert.equal(state.status, "Actioned");
  assert.equal(state.notes.length, 1);
  assert.equal(state.notes[0].content, "valid");
  assert.equal(state.auditTrail.length, 1);
});

test("withUpdatedWorkflow preserves unrelated answer fields", () => {
  const next = withUpdatedWorkflow(
    { complaint: "sleep issues", unrelated: true },
    {
      notes: [{ content: "note", author: "Dr C", timestamp: "2026-01-01" }],
      status: "In Review",
      auditTrail: [],
    },
  );

  assert.equal(next.complaint, "sleep issues");
  assert.equal(next.unrelated, true);
  assert.equal(typeof next.clinician_workflow, "object");
});
