import { NextResponse } from 'next/server';
import { Logger } from '@/lib/logger';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, role, organisation, email, goal } = body;

        if (!name || !email) {
            return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
        }

        if (!supabase) {
            return NextResponse.json({ error: "Database not configured" }, { status: 500 });
        }

        const { error } = await supabase
            .from('clinician_interest')
            .insert({
                name,
                role,
                organisation,
                email,
                goal
            });

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json({ error: "Database error" }, { status: 500 });
        }

        // Email notification will be configured in production
        Logger.info('New clinician interest', { email });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Internal error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
