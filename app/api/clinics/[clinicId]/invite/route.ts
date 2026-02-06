import { NextResponse, type NextRequest } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase';
import { getServerUserId } from '@/lib/auth/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ clinicId: string }> }
) {
    try {
        const supabase = createServiceSupabaseClient();
        if (!supabase) {
            return NextResponse.json(
                { error: 'Supabase service role key is not configured.' },
                { status: 503 }
            );
        }

        const userId = await getServerUserId();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { clinicId } = await params;
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check if inviter is owner or admin of the clinic
        const { data: membership, error: membershipCheckError } = await supabase
            .from('clinic_memberships')
            .select('role')
            .eq('clinic_id', clinicId)
            .eq('user_id', userId)
            .single();

        if (membershipCheckError || !membership || membership.role !== 'OWNER') {
            return NextResponse.json({ error: 'Unauthorized to invite users' }, { status: 403 });
        }

        // Invite workflow is not configured yet.
        return NextResponse.json(
            { error: 'Invite workflow not configured yet' },
            { status: 501 }
        );
    } catch (error) {
        console.error('Invite staff error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
