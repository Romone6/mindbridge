import { NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase';
import { getServerUserId } from '@/lib/auth/server';

const supabase = createServiceSupabaseClient();

if (!supabase) {
    throw new Error("Supabase service role key is not configured.");
}

export async function POST(request: Request) {
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
        const hours = expiresIn ? Number(expiresIn) : null;
        const expiresAt = hours ? new Date(Date.now() + hours * 60 * 60 * 1000).toISOString() : null;

        const { error: linkError } = await supabase
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

        const { data: membership, error: membershipError } = await supabase
            .from('clinic_memberships')
            .select('id')
            .eq('clinic_id', clinicId)
            .eq('user_id', userId)
            .single();

        if (membershipError || !membership) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { data, error } = await supabase
            .from('patient_links')
            .select('*')
            .eq('clinic_id', clinicId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ links: data || [] });
    } catch (error) {
        console.error('List patient links error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
