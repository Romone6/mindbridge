import { NextResponse } from 'next/server';

export interface Audit {
    id: string;
    audit_type: 'internal' | 'external' | 'penetration_test' | 'soc2' | 'hipaa' | 'gdpr' | 'iso27001';
    title: string;
    description: string | null;
    scheduled_date: string;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    auditor_name: string | null;
    auditor_org: string | null;
}

export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
            try {
                const { createClient } = await import('@supabase/supabase-js');
                const supabase = createClient(supabaseUrl, supabaseKey);

                const { data, error } = await supabase
                    .from('audit_schedule')
                    .select('*')
                    .order('scheduled_date', { ascending: true })
                    .limit(10);

                if (!error && data && data.length > 0) {
                    return NextResponse.json({
                        audits: data,
                        source: 'database'
                    });
                }
            } catch (dbError) {
                console.warn('Unable to fetch audits from database:', dbError);
            }
        }

        // Return empty list if database is not available
        return NextResponse.json({
            audits: [],
            source: 'empty'
        });

    } catch (error) {
        console.error('Audits API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch audit schedule' },
            { status: 500 }
        );
    }
}
