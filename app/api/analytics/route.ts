import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { getServerUserId } from "@/lib/auth/server";

const supabase = createServiceSupabaseClient();

if (!supabase) {
  throw new Error("Supabase service role key is not configured.");
}

export async function GET(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase service role key is not configured." },
        { status: 500 }
      );
    }

    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");

    if (!clinicId) {
      return NextResponse.json({ error: "Clinic ID is required" }, { status: 400 });
    }

    const { data: membership, error: membershipError } = await supabase
      .from("clinic_memberships")
      .select("id")
      .eq("clinic_id", clinicId)
      .eq("user_id", userId)
      .single();

    if (membershipError || !membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { count: totalTriage } = await supabase
      .from("triage_outputs")
      .select("*", { count: "exact", head: true })
      .eq("clinic_id", clinicId);

    const { count: activePatients } = await supabase
      .from("intakes")
      .select("*", { count: "exact", head: true })
      .eq("clinic_id", clinicId)
      .in("status", ["pending", "triaged"]);

    return NextResponse.json({
      totalTriage: totalTriage || 0,
      activePatients: activePatients || 0,
      avgResponse: null,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
