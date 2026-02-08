import { NextResponse, type NextRequest } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { getServerUserId } from "@/lib/auth/server";

type MembershipRow = {
  id: string;
  clinic_id: string;
  user_id: string;
  role: string;
  created_at: string;
};

type UserRow = {
  id: string;
  name: string | null;
  email: string;
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
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

    const { clinicId } = await params;

    const { data: currentMembership, error: membershipError } = await supabase
      .from("clinic_memberships")
      .select("id")
      .eq("clinic_id", clinicId)
      .eq("user_id", userId)
      .maybeSingle<{ id: string }>();

    if (membershipError) throw membershipError;
    if (!currentMembership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { data: memberships, error: membersError } = await supabase
      .from("clinic_memberships")
      .select("id, clinic_id, user_id, role, created_at")
      .eq("clinic_id", clinicId)
      .order("created_at", { ascending: true });

    if (membersError) throw membersError;

    const membershipRows = (memberships || []) as MembershipRow[];
    const userIds = [...new Set(membershipRows.map((row) => row.user_id))];

    let usersById = new Map<string, UserRow>();
    if (userIds.length > 0) {
      const { data: users, error: usersError } = await supabase
        .from("user")
        .select("id, name, email")
        .in("id", userIds);

      if (usersError) throw usersError;

      const userRows = (users || []) as UserRow[];
      usersById = new Map(userRows.map((row) => [row.id, row]));
    }

    const members = membershipRows.map((row) => {
      const user = usersById.get(row.user_id);
      return {
        id: row.id,
        userId: row.user_id,
        role: row.role,
        joinedAt: row.created_at,
        name: user?.name || null,
        email: user?.email || null,
      };
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("List clinic members error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
