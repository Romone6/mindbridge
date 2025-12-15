import { NextResponse } from 'next/server';
import { checkRLSStatus, getStatusSummary } from '@/lib/compliance/rls-monitor';

export async function GET() {
    try {
        const status = await checkRLSStatus();
        const summary = getStatusSummary(status);

        return NextResponse.json({
            ...status,
            summary
        });

    } catch (error) {
        console.error('Compliance Status API Error:', error);
        return NextResponse.json(
            { error: 'Failed to check compliance status' },
            { status: 500 }
        );
    }
}
