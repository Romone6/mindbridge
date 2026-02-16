import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { getServerUserId } from "@/lib/auth/server";

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
      return NextResponse.json(
        { error: "Clinic ID or Intake ID is required" },
        { status: 400 }
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
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    const { data: membership, error: membershipError } = await supabase
      .from("clinic_memberships")
      .select("id")
      .eq("clinic_id", intakeMeta.clinic_id)
      .eq("user_id", userId)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
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

    return NextResponse.json({ intake: data });
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
        { status: 503 }
      );
    }

    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      intakeId?: string;
      status?: "pending" | "triaged" | "reviewed" | "archived";
      manualTakeoverActive?: boolean;
      manualTakeoverClaimedBy?: string;
    };

    if (!body.intakeId) {
      return NextResponse.json({ error: "Intake ID is required" }, { status: 400 });
    }

    const { data: intake, error: intakeError } = await supabase
      .from("intakes")
      .select("id, clinic_id, answers_json, status")
      .eq("id", body.intakeId)
      .single();

    if (intakeError || !intake) {
      return NextResponse.json({ error: "Intake not found" }, { status: 404 });
    }

    const { data: membership, error: membershipError } = await supabase
      .from("clinic_memberships")
      .select("id")
      .eq("clinic_id", intake.clinic_id)
      .eq("user_id", userId)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const existingAnswers =
      intake.answers_json && typeof intake.answers_json === "object" ? intake.answers_json : {};
    const nextAnswers = {
      ...existingAnswers,
      ...(body.manualTakeoverActive !== undefined
        ? {
            manualTakeoverActive: body.manualTakeoverActive,
            manualTakeoverClaimedBy: body.manualTakeoverClaimedBy ?? null,
            manualTakeoverClaimedAt: body.manualTakeoverActive ? new Date().toISOString() : null,
          }
        : {}),
    };

    const nextStatus = body.status ?? intake.status;

    const { data: updated, error: updateError } = await supabase
      .from("intakes")
      .update({
        status: nextStatus,
        answers_json: nextAnswers,
      })
      .eq("id", body.intakeId)
      .select("*")
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({ intake: updated });
  } catch (error) {
    console.error("Intake patch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
