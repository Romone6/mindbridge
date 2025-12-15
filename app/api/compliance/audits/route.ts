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

/**
 * Mock data for when Supabase is not configured.
 * In production, this would query the actual database.
 */
function getMockAudits(): Audit[] {
    return [
        {
            id: '1',
            audit_type: 'internal',
            title: 'Q1 2026 Internal Security Review',
            description: 'Quarterly internal review of security controls and access policies.',
            scheduled_date: '2026-01-15',
            status: 'scheduled',
            auditor_name: 'Security Team',
            auditor_org: 'MindBridge'
        },
        {
            id: '2',
            audit_type: 'soc2',
            title: 'SOC 2 Type II Audit',
            description: 'Annual SOC 2 Type II audit for trust service criteria.',
            scheduled_date: '2026-03-01',
            status: 'scheduled',
            auditor_name: 'External Auditor',
            auditor_org: 'Big Four Firm'
        },
        {
            id: '3',
            audit_type: 'penetration_test',
            title: 'Annual Penetration Test',
            description: 'Third-party penetration testing of all production systems.',
            scheduled_date: '2026-02-15',
            status: 'scheduled',
            auditor_name: 'Security Researcher',
            auditor_org: 'PenTest Co'
        },
        {
            id: '4',
            audit_type: 'hipaa',
            title: 'HIPAA Compliance Review',
            description: 'Review of HIPAA administrative, physical, and technical safeguards.',
            scheduled_date: '2026-04-01',
            status: 'scheduled',
            auditor_name: 'Compliance Officer',
            auditor_org: 'Healthcare Consultants'
        }
    ];
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

        // Return mock data if database is not available
        return NextResponse.json({
            audits: getMockAudits(),
            source: 'mock'
        });

    } catch (error) {
        console.error('Audits API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch audit schedule' },
            { status: 500 }
        );
    }
}
