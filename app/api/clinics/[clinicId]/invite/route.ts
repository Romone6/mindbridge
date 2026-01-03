import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ clinicId: string }> }
) {
    try {
        const { userId } = await auth();
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
