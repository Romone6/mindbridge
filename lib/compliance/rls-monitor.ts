/**
 * RLS Monitoring Utilities
 * 
 * This module provides utilities for monitoring Row Level Security (RLS)
 * policies on Supabase tables. It can check RLS status and report on
 * the security posture of the database.
 */

export interface TableRLSStatus {
    tableName: string;
    rlsEnabled: boolean;
    policiesCount: number;
    lastChecked: string;
}

export interface ComplianceStatus {
    overall: 'healthy' | 'warning' | 'critical';
    tables: TableRLSStatus[];
    lastChecked: string;
    uptime: string;
    encryptionEnabled: boolean | null;
    databaseStatus: 'operational' | 'degraded' | 'down';
    issues: string[];
}

/**
 * Empty state for when Supabase data is not available.
 */
export function getEmptyComplianceStatus(): ComplianceStatus {
    const now = new Date().toISOString();

    return {
        overall: 'warning',
        tables: [],
        lastChecked: now,
        uptime: 'No data yet',
        encryptionEnabled: null,
        databaseStatus: 'degraded',
        issues: ['No compliance data yet.']
    };
}

/**
 * Check RLS status for a specific table.
 * 
 * Note: This requires a service role key to query pg_tables and pg_policies.
 * For now, we return mock data. In production, you would use:
 * 
 * ```sql
 * SELECT relname, relrowsecurity
 * FROM pg_class
 * WHERE relkind = 'r' AND relnamespace = 'public'::regnamespace;
 * ```
 */
export async function checkRLSStatus(): Promise<ComplianceStatus> {
    // Check if we have the service role key for real queries
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!serviceRoleKey || !supabaseUrl) {
        // Return empty state if service role key is not available
        return getEmptyComplianceStatus();
    }

    try {
        // In production, you would query the database directly
        // For now, we simulate a check with mock data
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

        // Attempt to query RLS status
        // This requires elevated permissions
        const { data, error } = await supabaseAdmin
            .rpc('get_rls_status')
            .select('*');

        if (error) {
            console.error('Unable to query RLS status, returning empty state:', error.message);
            return getEmptyComplianceStatus();
        }

        // Process real data if available
        const tables: TableRLSStatus[] = (data || []).map((row: { table_name: string; rls_enabled: boolean; policy_count: number }) => ({
            tableName: row.table_name,
            rlsEnabled: row.rls_enabled,
            policiesCount: row.policy_count,
            lastChecked: new Date().toISOString()
        }));

        const hasIssues = tables.some(t => !t.rlsEnabled);

        return {
            overall: hasIssues ? 'warning' : 'healthy',
            tables,
            lastChecked: new Date().toISOString(),
            uptime: 'No data yet',
            encryptionEnabled: null,
            databaseStatus: 'operational',
            issues: hasIssues
                ? tables.filter(t => !t.rlsEnabled).map(t => `RLS not enabled on ${t.tableName}`)
                : []
        };

    } catch (error: unknown) {
        console.error('Error checking RLS status:', error);
        return getEmptyComplianceStatus();
    }
}

/**
 * Get a summary of the compliance status for display.
 */
export function getStatusSummary(status: ComplianceStatus): {
    label: string;
    color: string;
    icon: 'check' | 'warning' | 'error';
} {
    if (status.tables.length === 0) {
        return { label: 'No compliance data yet', color: 'text-amber-600', icon: 'warning' };
    }
    switch (status.overall) {
        case 'healthy':
            return { label: 'All Systems Operational', color: 'text-green-600', icon: 'check' };
        case 'warning':
            return { label: 'Some Issues Detected', color: 'text-yellow-600', icon: 'warning' };
        case 'critical':
            return { label: 'Critical Issues', color: 'text-red-600', icon: 'error' };
        default:
            return { label: 'Unknown', color: 'text-gray-600', icon: 'warning' };
    }
}
