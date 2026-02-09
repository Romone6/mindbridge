import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { getServerUserId } from "@/lib/auth/server";

type InviteRole = "CLINICIAN" | "STAFF" | "READ_ONLY";

function isAsciiLetterOrDigit(charCode: number) {
  return (
    (charCode >= 48 && charCode <= 57) ||
    (charCode >= 65 && charCode <= 90) ||
    (charCode >= 97 && charCode <= 122)
  );
}

function isValidDomainLabel(label: string) {
  if (!label || label.length > 63) return false;

  const first = label.charCodeAt(0);
  const last = label.charCodeAt(label.length - 1);
  if (!isAsciiLetterOrDigit(first) || !isAsciiLetterOrDigit(last)) {
    return false;
  }

  for (let i = 0; i < label.length; i += 1) {
    const charCode = label.charCodeAt(i);
    if (charCode === 45) continue; // hyphen
    if (!isAsciiLetterOrDigit(charCode)) return false;
  }

  return true;
}

function normalizeEmail(value: unknown) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!email || email.length > 254) return null;

  for (let i = 0; i < email.length; i += 1) {
    if (email.charCodeAt(i) <= 32) return null;
  }

  const atIndex = email.indexOf("@");
  if (atIndex <= 0 || atIndex !== email.lastIndexOf("@") || atIndex >= email.length - 1) {
    return null;
  }

  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex + 1);

  if (
    !localPart ||
    localPart.length > 64 ||
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..")
  ) {
    return null;
  }

  if (
    !domainPart ||
    domainPart.length > 253 ||
    domainPart.startsWith(".") ||
    domainPart.endsWith(".") ||
    !domainPart.includes(".")
  ) {
    return null;
  }

  const labels = domainPart.split(".");
  if (!labels.every((label) => isValidDomainLabel(label))) {
    return null;
  }

  return email;
}

function normalizeRole(value: unknown): InviteRole | null {
  if (value !== "CLINICIAN" && value !== "STAFF" && value !== "READ_ONLY") {
    return null;
  }
  return value;
}

async function getClinicMembership(clinicId: string, userId: string) {
  const supabase = createServiceSupabaseClient();
  if (!supabase) return { supabase: null, membership: null as { role: string } | null, error: null };

  const { data: membership, error } = await supabase
    .from("clinic_memberships")
    .select("role")
    .eq("clinic_id", clinicId)
    .eq("user_id", userId)
    .single();

  return { supabase, membership, error };
}

function getInviteSender() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) return null;
  const fromName = process.env.RESEND_FROM_NAME || "MindBridge";

  return {
    resend: new Resend(apiKey),
    from: `${fromName} <${fromEmail}>`,
  };
}

async function sendInviteEmail(params: {
  to: string;
  clinicName: string;
  role: InviteRole;
  inviteUrl: string;
}) {
  const sender = getInviteSender();
  if (!sender) {
    throw new Error("Invite email provider not configured.");
  }

  const { to, clinicName, role, inviteUrl } = params;
  const subject = `You are invited to join ${clinicName} on MindBridge`;
  const html = `
    <p>You have been invited to join <strong>${clinicName}</strong> on MindBridge.</p>
    <p>Assigned role: <strong>${role}</strong></p>
    <p><a href="${inviteUrl}">Accept invitation</a></p>
    <p>This invitation expires in 7 days.</p>
  `.trim();
  const text = [
    `You have been invited to join ${clinicName} on MindBridge.`,
    `Assigned role: ${role}`,
    `Accept invitation: ${inviteUrl}`,
    "This invitation expires in 7 days.",
  ].join("\n");

  const { error } = await sender.resend.emails.send({
    from: sender.from,
    to,
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(error.message || "Failed to send invite email");
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clinicId } = await params;
    const { supabase, membership, error: membershipError } = await getClinicMembership(clinicId, userId);

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase service role key is not configured." },
        { status: 503 }
      );
    }

    if (membershipError || !membership || !["OWNER", "STAFF"].includes(membership.role)) {
      return NextResponse.json({ error: "Unauthorized to view invites" }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("clinic_invites")
      .select("id, email, role, token, expires_at, created_at")
      .eq("clinic_id", clinicId)
      .is("accepted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ invites: data || [] });
  } catch (error) {
    console.error("List invites error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clinicId } = await params;
    const { supabase, membership, error: membershipError } = await getClinicMembership(clinicId, userId);

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase service role key is not configured." },
        { status: 503 }
      );
    }

    if (membershipError || !membership || !["OWNER", "STAFF"].includes(membership.role)) {
      return NextResponse.json({ error: "Unauthorized to invite users" }, { status: 403 });
    }

    const body = (await request.json()) as { email?: unknown; role?: unknown };
    const email = normalizeEmail(body.email);
    const role = normalizeRole(body.role) || "CLINICIAN";

    if (!email) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
    }

    const { data: clinic, error: clinicError } = await supabase
      .from("clinics")
      .select("id, name")
      .eq("id", clinicId)
      .single<{ id: string; name: string }>();

    if (clinicError || !clinic) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    const { data: existingUser, error: existingUserError } = await supabase
      .from("user")
      .select("id")
      .eq("email", email)
      .maybeSingle<{ id: string }>();

    if (existingUserError) throw existingUserError;

    if (existingUser?.id) {
      const { data: existingMembership, error: existingMembershipError } = await supabase
        .from("clinic_memberships")
        .select("id")
        .eq("clinic_id", clinicId)
        .eq("user_id", existingUser.id)
        .maybeSingle<{ id: string }>();

      if (existingMembershipError) throw existingMembershipError;
      if (existingMembership) {
        return NextResponse.json(
          { error: "This user is already a member of the clinic." },
          { status: 409 }
        );
      }
    }

    const inviteToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error: deletePendingError } = await supabase
      .from("clinic_invites")
      .delete()
      .eq("clinic_id", clinicId)
      .eq("email", email)
      .is("accepted_at", null);

    if (deletePendingError) throw deletePendingError;

    const { data: invite, error: inviteError } = await supabase
      .from("clinic_invites")
      .insert({
        clinic_id: clinicId,
        email,
        role,
        token: inviteToken,
        expires_at: expiresAt,
      })
      .select("id, email, role, token, expires_at, created_at")
      .single();

    if (inviteError) throw inviteError;

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || request.nextUrl.origin;
    const inviteUrl = `${appUrl.replace(/\/$/, "")}/invite/${inviteToken}`;

    await sendInviteEmail({
      to: email,
      clinicName: clinic.name,
      role,
      inviteUrl,
    });

    return NextResponse.json({ invite }, { status: 201 });
  } catch (error) {
    console.error("Invite staff error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  try {
    const userId = await getServerUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clinicId } = await params;
    const { supabase, membership, error: membershipError } = await getClinicMembership(clinicId, userId);

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase service role key is not configured." },
        { status: 503 }
      );
    }

    if (membershipError || !membership || !["OWNER", "STAFF"].includes(membership.role)) {
      return NextResponse.json({ error: "Unauthorized to revoke invites" }, { status: 403 });
    }

    const inviteId = request.nextUrl.searchParams.get("inviteId");
    if (!inviteId) {
      return NextResponse.json({ error: "inviteId is required" }, { status: 400 });
    }

    const { data: invite, error: inviteLookupError } = await supabase
      .from("clinic_invites")
      .select("id")
      .eq("id", inviteId)
      .eq("clinic_id", clinicId)
      .is("accepted_at", null)
      .maybeSingle<{ id: string }>();

    if (inviteLookupError) throw inviteLookupError;
    if (!invite) {
      return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from("clinic_invites")
      .delete()
      .eq("id", inviteId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Revoke invite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
