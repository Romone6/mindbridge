import { expect, test } from "@playwright/test";

const hasClinicianSession = process.env.E2E_CLINICIAN_SESSION === "true";

test.describe("Clinician Workflow Actions", () => {
  test.skip(
    !hasClinicianSession,
    "Set E2E_CLINICIAN_SESSION=true with authenticated session setup to run clinician workflow e2e.",
  );

  test("claim takeover, save note, set status, and delete case", async ({ page }) => {
    const intakeId = "test-intake-1";
    const now = new Date().toISOString();

    let workflow = {
      notes: [] as Array<{ content: string; author: string; timestamp: string }>,
      status: "New" as "New" | "In Review" | "Actioned",
      auditTrail: [] as Array<{
        timestamp: string;
        oldStatus: "New" | "In Review" | "Actioned";
        newStatus: "New" | "In Review" | "Actioned";
        changedBy: string;
      }>,
    };

    let canTakeover = true;

    await page.route("**/api/intakes*", async (route, request) => {
      if (request.method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            intake: {
              id: intakeId,
              clinic_id: "clinic-1",
              patient_id: "patient-1",
              status: "triaged",
              created_at: now,
              answers_json: {
                complaint: "I have persistent anxiety.",
                clinician_workflow: workflow,
              },
              patient: {
                id: "patient-1",
                clinic_id: "clinic-1",
                patient_ref: "Guest-1101",
                created_at: now,
              },
              triage: [
                {
                  id: "triage-1",
                  clinic_id: "clinic-1",
                  intake_id: intakeId,
                  urgency_tier: "High",
                  summary_json: {
                    summary: "Patient reports elevated anxiety symptoms.",
                    key_findings: ["Persistent worry"],
                  },
                  risk_flags_json: ["Elevated distress"],
                  risk_score: 62,
                  created_at: now,
                },
              ],
            },
            capabilities: {
              canTakeover,
              canDelete: true,
              takeoverReason: canTakeover
                ? undefined
                : "Case already claimed by another clinician.",
            },
          }),
        });
        return;
      }

      if (request.method() === "DELETE") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true }),
        });
        return;
      }

      if (request.method() === "PATCH") {
        const payload = (request.postDataJSON() || {}) as {
          action?: string;
          content?: string;
          status?: "New" | "In Review" | "Actioned";
        };

        if (payload.action === "claim_takeover") {
          workflow = {
            ...workflow,
            status: "In Review",
          };
          canTakeover = false;
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ ok: true, workflow }),
          });
          return;
        }

        if (payload.action === "add_note") {
          workflow = {
            ...workflow,
            notes: [
              ...workflow.notes,
              {
                content: payload.content || "",
                author: "Clinician",
                timestamp: now,
              },
            ],
          };
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ ok: true, workflow }),
          });
          return;
        }

        if (payload.action === "set_status" && payload.status) {
          workflow = {
            ...workflow,
            status: payload.status,
            auditTrail: [
              ...workflow.auditTrail,
              {
                timestamp: now,
                oldStatus: "In Review",
                newStatus: payload.status,
                changedBy: "Clinician",
              },
            ],
          };
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ ok: true, workflow }),
          });
          return;
        }
      }

      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "Unhandled test route request" }),
      });
    });

    await page.goto(`/dashboard/patients/${intakeId}`);

    await expect(page.getByText("Guest-1101")).toBeVisible();
    await page.getByRole("button", { name: "Claim Manual Takeover" }).click();
    await expect(
      page.getByText("Takeover unavailable: Case already claimed by another clinician."),
    ).toBeVisible();

    await page
      .getByPlaceholder("Add clinical notes, treatment plan, or recommendations...")
      .fill("Follow up in 48 hours and review coping plan.");
    await page.getByRole("button", { name: "Save Note" }).click();
    await expect(
      page.getByText("Follow up in 48 hours and review coping plan."),
    ).toBeVisible();

    await page.getByRole("button", { name: "Actioned" }).click();
    await expect(page.getByText("No audit activity yet.")).toBeHidden();

    page.once("dialog", async (dialog) => {
      await dialog.accept();
    });
    await page.getByRole("button", { name: "Delete Case" }).click();
    await expect(page).toHaveURL(/\/dashboard\/patients$/);
  });

  test("shows load error and allows retry plus note retry", async ({ page }) => {
    const intakeId = "test-intake-2";
    const now = new Date().toISOString();
    let getAttempts = 0;
    let noteAttempts = 0;

    await page.route("**/api/intakes*", async (route, request) => {
      if (request.method() === "GET") {
        getAttempts += 1;
        if (getAttempts <= 2) {
          await route.fulfill({
            status: 503,
            contentType: "application/json",
            body: JSON.stringify({
              error: "Temporary backend outage",
              code: "INTAKE_DETAIL_TEMP_FAIL",
            }),
          });
          return;
        }

        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            intake: {
              id: intakeId,
              clinic_id: "clinic-2",
              patient_id: "patient-2",
              status: "triaged",
              created_at: now,
              answers_json: {
                complaint: "I am feeling overwhelmed.",
                clinician_workflow: {
                  notes: [],
                  status: "In Review",
                  auditTrail: [],
                },
              },
              patient: {
                id: "patient-2",
                clinic_id: "clinic-2",
                patient_ref: "Guest-2202",
                created_at: now,
              },
              triage: [
                {
                  id: "triage-2",
                  clinic_id: "clinic-2",
                  intake_id: intakeId,
                  urgency_tier: "Moderate",
                  summary_json: {
                    summary: "Overwhelm and stress symptoms reported.",
                    key_findings: ["Stress-related disruption"],
                  },
                  risk_flags_json: [],
                  risk_score: 44,
                  created_at: now,
                },
              ],
            },
            capabilities: {
              canTakeover: true,
              canDelete: true,
            },
          }),
        });
        return;
      }

      if (request.method() === "PATCH") {
        const payload = (request.postDataJSON() || {}) as { action?: string };
        if (payload.action === "add_note") {
          noteAttempts += 1;
          if (noteAttempts === 1) {
            await route.fulfill({
              status: 500,
              contentType: "application/json",
              body: JSON.stringify({
                error: "Failed to persist note",
                code: "INTAKE_NOTE_WRITE_FAIL",
              }),
            });
            return;
          }

          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
              ok: true,
              workflow: {
                notes: [
                  {
                    content: "Retry succeeded",
                    author: "Clinician",
                    timestamp: now,
                  },
                ],
                status: "In Review",
                auditTrail: [],
              },
            }),
          });
          return;
        }
      }

      await route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({ error: "Unhandled test route request" }),
      });
    });

    await page.goto(`/dashboard/patients/${intakeId}`);
    await expect(page.getByText("Temporary backend outage")).toBeVisible();
    await page.getByRole("button", { name: "Retry loading case" }).click();
    await expect(page.getByText("Guest-2202")).toBeVisible();

    await page
      .getByPlaceholder("Add clinical notes, treatment plan, or recommendations...")
      .fill("Retry succeeded");
    await page.getByRole("button", { name: "Save Note" }).click();
    await expect(page.getByText("Failed to persist note")).toBeVisible();

    await page.getByRole("button", { name: "Save Note" }).click();
    await expect(page.getByText("Retry succeeded")).toBeVisible();
  });
});
