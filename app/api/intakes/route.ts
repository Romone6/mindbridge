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
