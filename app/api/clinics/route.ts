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

        const { name, address, timezone } = await request.json();
        if (!name) {
            return NextResponse.json({ error: 'Clinic name is required' }, { status: 400 });
        }

        // Create clinic
        const { data: clinic, error: clinicError } = await supabase
            .from('clinics')
            .insert({
                name,
                owner_id: userId,
                address: address || null,
                timezone: timezone || null,
            })
            .select()
            .single();

        if (clinicError) throw clinicError;

        // Add owner to clinic_memberships
        const { error: membershipError } = await supabase
            .from('clinic_memberships')
            .insert({
                clinic_id: clinic.id,
                user_id: userId,
                role: 'OWNER'
            });

        if (membershipError) throw membershipError;

        return NextResponse.json({ clinic });
    } catch (error) {
        console.error('Create clinic error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
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

        const { data, error } = await supabase
            .from('clinic_memberships')
            .select('role, clinic:clinics(id, name)')
            .eq('user_id', userId);

        if (error) throw error;

        const rows = (data || []) as Array<{
            role: string;
            clinic: { id: string; name: string } | { id: string; name: string }[] | null;
        }>;

        const clinics = rows.flatMap((item) => {
            if (!item.clinic) return [];
            const clinic = Array.isArray(item.clinic) ? item.clinic[0] : item.clinic;
            if (!clinic) return [];
            return [{ id: clinic.id, name: clinic.name, role: item.role }];
        });

        return NextResponse.json({ clinics });
    } catch (error) {
        console.error('List clinics error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}