"use server";

import { revalidatePath } from "next/cache";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { getServerUserId } from "@/lib/auth/server";

export async function inviteMember(clinicId: string, email: string, role: 'CLINICIAN' | 'STAFF' | 'READ_ONLY' = 'CLINICIAN') {
    const userId = await getServerUserId();
    if (!userId) throw new Error("Unauthorized");

    const supabase = createServiceSupabaseClient();
    if (!supabase) throw new Error("Database connection failed");

    const { data: membership, error: membershipError } = await supabase
        .from('clinic_memberships')
        .select('role')
        .eq('clinic_id', clinicId)
        .eq('user_id', userId)
        .single();

    if (membershipError || !membership) {
        throw new Error("Unauthorized to invite users");
    }

    if (!['OWNER', 'STAFF'].includes(membership.role)) {
        throw new Error("Insufficient permissions to invite users");
    }

    // 2. Generate Invite Token
    const inviteToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // 3. Insert Invite
    const { error } = await supabase
        .from('clinic_invites')
        .insert({
            clinic_id: clinicId,
            email,
            role,
            token: inviteToken,
            expires_at: expiresAt.toISOString()
        });

    if (error) {
        console.error("Invite Error:", error);
        throw new Error("Failed to send invite: " + error.message);
    }

    // 4. (Mock) Send Email
    // In a real app, we would use Resend or SendGrid here.
    console.log(`[MOCK EMAIL] To: ${email}, Link: ${process.env.NEXT_PUBLIC_APP_URL}/invite/${inviteToken}`);

    revalidatePath('/dashboard/team');
    return { success: true };
}

export async function revokeInvite(inviteId: string) {
    const userId = await getServerUserId();
    if (!userId) throw new Error("Unauthorized");

    const supabase = createServiceSupabaseClient();
    if (!supabase) throw new Error("Database connection failed");

    const { error } = await supabase
        .from('clinic_invites')
        .delete()
        .eq('id', inviteId);

    if (error) throw new Error(error.message);
    revalidatePath('/dashboard/team');
}

export async function getInvite(token: string) {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('clinic_invites')
        .select('*, clinic:clinics(name)')
        .eq('token', token)
        .single();
    
    if (error) return null;
    return data;
}

export async function acceptInvite(token: string) {
    const userId = await getServerUserId();
    if (!userId) throw new Error("Unauthorized");

    const supabase = createAdminClient();

    // 1. Fetch Invite
    const { data: invite, error: inviteError } = await supabase
        .from('clinic_invites')
        .select('*')
        .eq('token', token)
        .single();

    if (inviteError || !invite) throw new Error("Invalid or expired invite");

    // 2. Check Expiry
    if (new Date(invite.expires_at) < new Date()) {
        throw new Error("Invite expired");
    }

    // 3. Create Membership
    // Use upsert to handle re-invites gracefully
    const { error: memberError } = await supabase
        .from('clinic_memberships')
        .upsert({
            clinic_id: invite.clinic_id,
            user_id: userId,
            role: invite.role
        }, { onConflict: 'clinic_id, user_id' });

    if (memberError) throw new Error("Failed to join clinic: " + memberError.message);

    // 4. Delete Invite
    await supabase.from('clinic_invites').delete().eq('id', invite.id);

    return { success: true };
}

import { createClient } from "@supabase/supabase-js";

function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function removeMember(membershipId: string) {
    const userId = await getServerUserId();
    if (!userId) throw new Error("Unauthorized");

    const supabase = createServiceSupabaseClient();
    if (!supabase) throw new Error("Database connection failed");

    const { data: membership } = await supabase
        .from('clinic_memberships')
        .select('role, clinic_id')
        .eq('user_id', userId)
        .single();

    if (!membership || membership.role !== 'OWNER') {
        throw new Error("Insufficient permissions to remove members");
    }

    const { data: targetMembership } = await supabase
        .from('clinic_memberships')
        .select('clinic_id')
        .eq('id', membershipId)
        .single();

    if (!targetMembership || targetMembership.clinic_id !== membership.clinic_id) {
        throw new Error("Invalid membership removal request");
    }
    const { error } = await supabase
        .from('clinic_memberships')
        .delete()
        .eq('id', membershipId);

    if (error) throw new Error(error.message);
    revalidatePath('/dashboard/team');
}
