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

        const { name } = await request.json();
        if (!name) {
            return NextResponse.json({ error: 'Clinic name is required' }, { status: 400 });
        }

        // Create clinic
        const { data: clinic, error: clinicError } = await supabase
            .from('clinics')
            .insert({
                name,
                owner_id: userId
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