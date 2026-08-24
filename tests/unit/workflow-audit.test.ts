import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildWorkflowAuditEvents,
  filterWorkflowAuditEvents,
  paginateWorkflowAuditEvents,
  workflowAuditEventsToCsv,
} from "@/lib/intakes/workflow-audit";

test("buildWorkflowAuditEvents emits takeover, status, and note events", () => {
  const events = buildWorkflowAuditEvents([
    {
      id: "intake-1",
      patient_id: "patient-1",
      status: "reviewed",
      answers_json: {
        clinician_takeover: {
          claimed_at: "2026-02-10T01:00:00.000Z",
          claimed_by: "Dr Alpha",
        },
        clinician_workflow: {
          status: "Actioned",
          notes: [
            {
              content: "Patient follow up scheduled.",
              author: "Dr Alpha",
              timestamp: "2026-02-10T03:00:00.000Z",
            },
          ],
          auditTrail: [
            {
              timestamp: "2026-02-10T02:00:00.000Z",
              oldStatus: "In Review",
              newStatus: "Actioned",
              changedBy: "Dr Alpha",
            },
          ],
        },
      },
    },
  ]);

  assert.equal(events.length, 3);
  assert.equal(events[0].eventType, "note_added");
  assert.equal(events[1].eventType, "status_change");
  assert.equal(events[2].eventType, "takeover_claimed");
  assert.equal(events[2].actor, "Dr Alpha");
});

test("workflowAuditEventsToCsv returns stable CSV header and rows", () => {
  const csv = workflowAuditEventsToCsv([
    {
      intakeId: "intake-2",
      patientId: "patient-2",
      intakeStatus: "triaged",
      workflowStatus: "In Review",
      eventType: "note_added",
      eventAt: "2026-02-10T03:00:00.000Z",
      actor: "Dr Beta",
      detail: "Note added: Check mood progression.",
    },
  ]);

  assert.equal(
    csv.startsWith(
      "event_at,event_type,intake_id,patient_id,intake_status,workflow_status,actor,detail",
    ),
    true,
  );
  assert.equal(csv.includes("intake-2"), true);
  assert.equal(csv.includes("note_added"), true);
});

test("filterWorkflowAuditEvents applies from/to/actor filters", () => {
  const events = [
    {
      intakeId: "intake-1",
      patientId: "patient-1",
      intakeStatus: "triaged" as const,
      workflowStatus: "In Review" as const,
      eventType: "note_added" as const,
      eventAt: "2026-02-10T01:00:00.000Z",
      actor: "Dr Alpha",
      detail: "Note A",
    },
    {
      intakeId: "intake-2",
      patientId: "patient-2",
      intakeStatus: "reviewed" as const,
      workflowStatus: "Actioned" as const,
      eventType: "status_change" as const,
      eventAt: "2026-02-11T01:00:00.000Z",
      actor: "Dr Beta",
      detail: "Status change",
    },
  ];

  const filtered = filterWorkflowAuditEvents(events, {
    from: "2026-02-10T12:00:00.000Z",
    to: "2026-02-12T00:00:00.000Z",
    actor: "beta",
    eventType: "status_change",
  });

  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].intakeId, "intake-2");
});

test("paginateWorkflowAuditEvents returns expected page window", () => {
  const events = [
    {
      intakeId: "intake-1",
      patientId: "patient-1",
      intakeStatus: "triaged" as const,
      workflowStatus: "In Review" as const,
      eventType: "note_added" as const,
      eventAt: "2026-02-10T01:00:00.000Z",
      actor: "Dr Alpha",
      detail: "Note A",
    },
    {
      intakeId: "intake-2",
      patientId: "patient-2",
      intakeStatus: "reviewed" as const,
      workflowStatus: "Actioned" as const,
      eventType: "status_change" as const,
      eventAt: "2026-02-11T01:00:00.000Z",
      actor: "Dr Beta",
      detail: "Status change",
    },
    {
      intakeId: "intake-3",
      patientId: "patient-3",
      intakeStatus: "reviewed" as const,
      workflowStatus: "Actioned" as const,
      eventType: "takeover_claimed" as const,
      eventAt: "2026-02-12T01:00:00.000Z",
      actor: "Dr Gamma",
      detail: "Takeover",
    },
  ];

  const page = paginateWorkflowAuditEvents(events, {
    offset: 1,
    limit: 2,
  });

  assert.equal(page.length, 2);
  assert.equal(page[0].intakeId, "intake-2");
  assert.equal(page[1].intakeId, "intake-3");
});
