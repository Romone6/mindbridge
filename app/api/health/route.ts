import { NextResponse } from 'next/server';
import { createServiceSupabaseClient, supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '0.1.0',
        environment: process.env.NODE_ENV,
        services: {
            database: 'unknown',
            api: 'healthy',
        },
    };

    try {
        const serviceClient = createServiceSupabaseClient();
        const client = serviceClient ?? supabase;

        if (!client) {
            health.services.database = 'disabled';
        } else {
            const { error } = await client.from('audit_logs').select('id', { count: 'exact', head: true });
            health.services.database = error ? 'unhealthy' : 'healthy';
        }
    } catch (error) {
        health.services.database = 'unhealthy';
        console.error('Health check failed:', error);
    }

    const status = health.services.database === 'unhealthy' ? 503 : 200;

    // Set status to unstable if database is unhealthy but API is up
    if (status === 503) {
        health.status = 'unhealthy';
    }

    return NextResponse.json(health, { status });
}
