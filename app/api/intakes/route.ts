import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { getServerSession, getServerUserId } from "@/lib/auth/server";
import {
  computeIntakeCapabilities,
  isPrivilegedMembershipRole,
  parseTakeoverByUserId,
} from "@/lib/intakes/capabilities";
import {
  normalizeClinicianWorkflowState,
  withUpdatedWorkflow,
  type ClinicianWorkflowState,
  type ClinicianWorkflowStatus,
} from "@/lib/intakes/clinician-workflow";
import type { IntakeStatus } from "@/types/patient";

type SupabaseServiceClient = NonNullable<
  ReturnType<typeof createServiceSupabaseClient>
>;

type IntakeRecord = {
  id: string;
  clinic_id: string;
  status: IntakeStatus;
  answers_json: unknown;
  patient_id?: string;
  triage?: unknown[];
};

type IntakePatchRequest = {
  intakeId?: string;
  action?: "claim_takeover" | "add_note" | "set_status";
  content?: string;
  status?: ClinicianWorkflowStatus;
};

function errorJson(message: string, status: number, code: string) {
  return NextResponse.json({ error: message, code }, { status });
}

async function resolveMembershipRole(
  supabase: SupabaseServiceClient,
  clinicId: string,
  userId: string,
): Promise<string | null> {
  const { data: membership, error: membershipError } = await supabase
    .from("clinic_memberships")
    .select("role")
    .eq("clinic_id", clinicId)
    .eq("user_id", userId)
    .single<{ role: string }>();

  if (membershipError || !membership) {
    return null;
  }

  return membership.role;
}

async function loadIntakeRecord(
  supabase: SupabaseServiceClient,
  intakeId: string,
): Promise<IntakeRecord | null> {
  const { data: intakeData, error: intakeError } = await supabase
    .from("intakes")
    .select("id, clinic_id, status, answers_json, triage:triage_outputs(id), patient_id")
    .eq("id", intakeId)
    .single();

  if (intakeError || !intakeData) {
    return null;
  }

  return intakeData as IntakeRecord;
}

function mapWorkflowStatusToIntakeStatus(
  status: ClinicianWorkflowStatus,
): IntakeStatus {
  if (status === "Actioned") {
    return "reviewed";
  }

  if (status === "In Review") {
    return "triaged";
  }

  return "pending";
}

export async function GET(request: Request) {
  try {
    const supabase = createServiceSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase service role key is not configured." },
        { status: 503 }
      );
    }

    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");
    const intakeId = searchParams.get("intakeId");

    if (!clinicId && !intakeId) {
      return errorJson(
        "Clinic ID or Intake ID is required",
        400,
        "INTAKE_QUERY_MISSING_SCOPE",
      );
    }

    if (clinicId) {
      const { data: membership, error: membershipError } = await supabase
        .from("clinic_memberships")
        .select("id")
        .eq("clinic_id", clinicId)
        .eq("user_id", userId)
        .single();

      if (membershipError || !membership) {
        return errorJson("Unauthorized", 403, "INTAKE_CLINIC_FORBIDDEN");
      }

      const { data, error } = await supabase
        .from("intakes")
        .select(
          `
            *,
            patient:patients(*),
            triage:triage_outputs(*)
          `
        )
        .eq("clinic_id", clinicId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return NextResponse.json({ intakes: data || [] });
    }

    const { data: intakeMeta, error: metaError } = await supabase
      .from("intakes")
      .select("clinic_id")
      .eq("id", intakeId)
      .single();

    if (metaError || !intakeMeta) {
      return errorJson("Intake not found", 404, "INTAKE_NOT_FOUND");
    }

    const membershipRole = await resolveMembershipRole(
      supabase,
      intakeMeta.clinic_id,
      userId,
    );

    if (!membershipRole) {
      return errorJson("Unauthorized", 403, "INTAKE_DETAIL_FORBIDDEN");
    }

    const { data, error } = await supabase
      .from("intakes")
      .select(
        `
          *,
          patient:patients(*),
          triage:triage_outputs(*)
        `
      )
      .eq("id", intakeId)
      .single();

    if (error) throw error;

    const intake = data as IntakeRecord;
    const capabilities = computeIntakeCapabilities({
      membershipRole,
      intakeStatus: intake.status,
      hasTriageOutput: (intake.triage?.length ?? 0) > 0,
      currentUserId: userId,
      takeoverByUserId: parseTakeoverByUserId(intake.answers_json),
    });

    const workflow = normalizeClinicianWorkflowState({
      answersJson: intake.answers_json,
      intakeStatus: intake.status,
    });

    return NextResponse.json({ intake: data, capabilities, workflow });
  } catch (error) {
    console.error("Intakes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createServiceSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase service role key is not configured." },
        { status: 503 },
      );
    }

    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as IntakePatchRequest;
    if (!body.intakeId || !body.action) {
      return errorJson(
        "Invalid request payload.",
        400,
        "INTAKE_PATCH_INVALID_PAYLOAD",
      );
    }

    const intake = await loadIntakeRecord(supabase, body.intakeId);
    if (!intake) {
      return errorJson("Intake not found", 404, "INTAKE_NOT_FOUND");
    }

    const membershipRole = await resolveMembershipRole(
      supabase,
      intake.clinic_id,
      userId,
    );

    if (!membershipRole) {
      return errorJson("Unauthorized", 403, "INTAKE_PATCH_FORBIDDEN");
    }

    if (!isPrivilegedMembershipRole(membershipRole)) {
      return errorJson("Forbidden", 403, "INTAKE_PATCH_ROLE_FORBIDDEN");
    }

    const session = await getServerSession();
    const actorName =
      session?.user?.name?.trim() || session?.user?.email?.trim() || "Clinician";

    const workflow = normalizeClinicianWorkflowState({
      answersJson: intake.answers_json,
      intakeStatus: intake.status,
    });

    if (body.action === "claim_takeover") {
      const capabilities = computeIntakeCapabilities({
        membershipRole,
        intakeStatus: intake.status,
        hasTriageOutput: (intake.triage?.length ?? 0) > 0,
        currentUserId: userId,
        takeoverByUserId: parseTakeoverByUserId(intake.answers_json),
      });

      if (!capabilities.canTakeover) {
        return errorJson(
          capabilities.takeoverReason || "Takeover denied.",
          403,
          "INTAKE_TAKEOVER_DENIED",
        );
      }

      const nextWorkflow: ClinicianWorkflowState = {
        ...workflow,
        status: workflow.status === "Actioned" ? "Actioned" : "In Review",
      };

      const claimedAnswers = withUpdatedWorkflow(intake.answers_json, nextWorkflow);
      const nextAnswers = {
        ...claimedAnswers,
        clinician_takeover: {
          by_user_id: userId,
          claimed_at: new Date().toISOString(),
          claimed_by: actorName,
        },
      };

      const { error: updateError } = await supabase
        .from("intakes")
        .update({
          answers_json: nextAnswers,
          status: mapWorkflowStatusToIntakeStatus(nextWorkflow.status),
        })
        .eq("id", intake.id);

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({ ok: true, workflow: nextWorkflow });
    }

    if (body.action === "add_note") {
      const content = body.content?.trim();
      if (!content) {
        return errorJson(
          "Note content is required.",
          400,
          "INTAKE_NOTE_CONTENT_REQUIRED",
        );
      }

      const nextWorkflow = {
        ...workflow,
        notes: [
          ...workflow.notes,
          {
            content,
            author: actorName,
            timestamp: new Date().toISOString(),
          },
        ],
      };

      const nextAnswers = withUpdatedWorkflow(intake.answers_json, nextWorkflow);

      const { error: updateError } = await supabase
        .from("intakes")
        .update({ answers_json: nextAnswers })
        .eq("id", intake.id);

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({ ok: true, workflow: nextWorkflow });
    }

    if (body.action === "set_status") {
      if (
        body.status !== "New" &&
        body.status !== "In Review" &&
        body.status !== "Actioned"
      ) {
        return errorJson(
          "Invalid workflow status.",
          400,
          "INTAKE_STATUS_INVALID",
        );
      }

      if (workflow.status === body.status) {
        return NextResponse.json({ ok: true, workflow });
      }

      const nextWorkflow = {
        ...workflow,
        status: body.status,
        auditTrail: [
          ...workflow.auditTrail,
          {
            timestamp: new Date().toISOString(),
            oldStatus: workflow.status,
            newStatus: body.status,
            changedBy: actorName,
          },
        ],
      };

      const nextAnswers = withUpdatedWorkflow(intake.answers_json, nextWorkflow);

      const { error: updateError } = await supabase
        .from("intakes")
        .update({
          answers_json: nextAnswers,
          status: mapWorkflowStatusToIntakeStatus(body.status),
        })
        .eq("id", intake.id);

      if (updateError) {
        throw updateError;
      }

      return NextResponse.json({ ok: true, workflow: nextWorkflow });
    }

    return errorJson("Unsupported action.", 400, "INTAKE_PATCH_UNSUPPORTED_ACTION");
  } catch (error) {
    console.error("Intake patch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createServiceSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase service role key is not configured." },
        { status: 503 },
      );
    }

    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const intakeId = searchParams.get("intakeId");
    if (!intakeId) {
      return errorJson("Intake ID is required", 400, "INTAKE_DELETE_MISSING_ID");
    }

    const { data: intakeData, error: intakeError } = await supabase
      .from("intakes")
      .select("id, clinic_id, status, answers_json, triage:triage_outputs(id), patient_id")
      .eq("id", intakeId)
      .single();

    if (intakeError || !intakeData) {
      return errorJson("Intake not found", 404, "INTAKE_NOT_FOUND");
    }

    const intake = intakeData as IntakeRecord & { patient_id: string };
    const membershipRole = await resolveMembershipRole(
      supabase,
      intake.clinic_id,
      userId,
    );

    if (!membershipRole) {
      return errorJson("Unauthorized", 403, "INTAKE_DELETE_FORBIDDEN");
    }

    const capabilities = computeIntakeCapabilities({
      membershipRole,
      intakeStatus: intake.status,
      hasTriageOutput: (intake.triage?.length ?? 0) > 0,
      currentUserId: userId,
      takeoverByUserId: parseTakeoverByUserId(intake.answers_json),
    });

    if (!capabilities.canDelete) {
      return errorJson(
        capabilities.deleteReason || "Delete denied.",
        403,
        "INTAKE_DELETE_DENIED",
      );
    }

    const { error: deleteTriageError } = await supabase
      .from("triage_outputs")
      .delete()
      .eq("intake_id", intake.id);

    if (deleteTriageError) throw deleteTriageError;

    const { error: deleteIntakeError } = await supabase
      .from("intakes")
      .delete()
      .eq("id", intake.id);

    if (deleteIntakeError) throw deleteIntakeError;

    const { count: remainingIntakesForPatient, error: countError } = await supabase
      .from("intakes")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", intake.patient_id);

    if (countError) throw countError;

    let patientDeleted = false;
    if ((remainingIntakesForPatient ?? 0) === 0) {
      const { error: deletePatientError } = await supabase
        .from("patients")
        .delete()
        .eq("id", intake.patient_id);

      if (deletePatientError) throw deletePatientError;
      patientDeleted = true;
    }

    return NextResponse.json({
      ok: true,
      deleted: true,
      intakeId: intake.id,
      patientDeleted,
    });
  } catch (error) {
    console.error("Intake delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
