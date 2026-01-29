import { NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase';
import { getServerUserId } from '@/lib/auth/server';

const supabase = createServiceSupabaseClient();

if (!supabase) {
    throw new Error("Supabase service role key is not configured.");
}

export async function GET(request: Request) {
    try {
        if (!supabase) {
            return NextResponse.json(
                { error: 'Supabase service role key is not configured.' },
                { status: 500 }
            );
        }

        const userId = await getServerUserId();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const clinicId = searchParams.get('clinicId');

        if (!clinicId) {
            return NextResponse.json({ error: 'Clinic ID is required' }, { status: 400 });
        }

        // Check if user is member of clinic
        const { data: membership, error: membershipError } = await supabase
            .from('clinic_memberships')
            .select('id')
            .eq('clinic_id', clinicId)
            .eq('user_id', userId)
            .single();

        if (membershipError || !membership) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Get triage sessions for clinic
        const { data: sessions, error: sessionsError } = await supabase
            .from('triage_sessions')
            .select(`
                *,
                messages:session_id(count),
                triage_outputs(*)
            `)
            .eq('clinic_id', clinicId)
            .order('created_at', { ascending: false });

        if (sessionsError) throw sessionsError;

        return NextResponse.json({ sessions });
    } catch (error) {
        console.error('List triage sessions error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}