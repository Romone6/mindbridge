import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
    try {
        const { userId } = await auth();
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