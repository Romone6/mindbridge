import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { clinicId, expiresIn } = await request.json();
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

        // Generate unique token
        const linkToken = crypto.randomUUID();

        // Calculate expiration
        const expiresAt = expiresIn ? new Date(Date.now() + parseInt(expiresIn) * 60 * 60 * 1000).toISOString() : null;

        const { data: link, error: linkError } = await supabase
            .from('patient_links')
            .insert({
                clinic_id: clinicId,
                link_token: linkToken,
                expires_at: expiresAt,
                created_by: userId
            })
            .select()
            .single();

        if (linkError) throw linkError;

        const linkUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/t/${linkToken}`;

        return NextResponse.json({ link: linkUrl, token: linkToken });
    } catch (error) {
        console.error('Create patient link error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}