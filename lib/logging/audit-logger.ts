/**
 * Audit logging for all PHI access and user actions
 * Provides immutable audit trail for compliance
 */

import { Logger } from '../logger';
import { supabase } from '../supabase';

export interface AuditLogEntry {
    userId: string;
    userEmail?: string;
    userRole?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, unknown>;
    success?: boolean;
    errorMessage?: string;
}

export class AuditLogger {
    /**
     * Log any user action that involves PHI access
     */
    static async log(entry: AuditLogEntry): Promise<void> {
        if (!supabase) {
            Logger.warn('[AUDIT] Supabase not configured, logging to console', { entry });
            return;
        }

        try {
            const { error } = await supabase
                .from('audit_logs')
                .insert({
                    user_id: entry.userId,
                    user_email: entry.userEmail,
                    user_role: entry.userRole,
                    action: entry.action,
                    resource_type: entry.resourceType,
                    resource_id: entry.resourceId,
                    ip_address: entry.ipAddress,
                    user_agent: entry.userAgent,
                    details: entry.details,
                    success: entry.success ?? true,
                    error_message: entry.errorMessage,
                });

            if (error) {
                Logger.error('[AUDIT] Failed to write audit log', new Error(error.message), { error });
                // In production, this should trigger an alert
            }
        } catch (error: unknown) {
            const err = error instanceof Error ? error : new Error('Unknown error');
            Logger.error('[AUDIT] Unexpected error writing audit log', err);
        }
    }

    /**
     * Log patient data access
     */
    static async logPatientAccess(
        userId: string,
        patientId: string,
        action: 'view' | 'update' | 'delete' | 'export',
        metadata?: { userEmail?: string; userRole?: string; ip?: string; userAgent?: string }
    ): Promise<void> {
        await this.log({
            userId,
            userEmail: metadata?.userEmail,
            userRole: metadata?.userRole,
            action: `patient_${action}`,
            resourceType: 'patient',
            resourceId: patientId,
            ipAddress: metadata?.ip,
            userAgent: metadata?.userAgent,
        });
    }

    /**
     * Log session access
     */
    static async logSessionAccess(
        userId: string,
        sessionId: string,
        action: 'view' | 'delete',
        metadata?: { userEmail?: string; userRole?: string; ip?: string; userAgent?: string }
    ): Promise<void> {
        await this.log({
            userId,
            userEmail: metadata?.userEmail,
            userRole: metadata?.userRole,
            action: `session_${action}`,
            resourceType: 'session',
            resourceId: sessionId,
            ipAddress: metadata?.ip,
            userAgent: metadata?.userAgent,
        });
    }

    /**
     * Log configuration changes
     */
    static async logConfigChange(
        userId: string,
        configType: string,
        changes: Record<string, unknown>,
        metadata?: { userEmail?: string; userRole?: string }
    ): Promise<void> {
        await this.log({
            userId,
            userEmail: metadata?.userEmail,
            userRole: metadata?.userRole,
            action: 'config_update',
            resourceType: 'configuration',
            resourceId: configType,
            details: { changes },
        });
    }

    /**
     * Log authentication events
     */
    static async logAuthEvent(
        userId: string,
        event: 'login' | 'logout' | 'failed_login' | 'mfa_enabled' | 'mfa_disabled',
        metadata?: { ip?: string; userAgent?: string; errorMessage?: string }
    ): Promise<void> {
        await this.log({
            userId,
            action: `auth_${event}`,
            resourceType: 'authentication',
            ipAddress: metadata?.ip,
            userAgent: metadata?.userAgent,
            success: !metadata?.errorMessage,
            errorMessage: metadata?.errorMessage,
        });
    }

    /**
     * Log data export events (high-risk)
     */
    static async logDataExport(
        userId: string,
        exportType: string,
        recordCount: number,
        metadata?: { userEmail?: string; userRole?: string }
    ): Promise<void> {
        await this.log({
            userId,
            userEmail: metadata?.userEmail,
            userRole: metadata?.userRole,
            action: 'data_export',
            resourceType: exportType,
            details: { record_count: recordCount },
        });
    }

    /**
     * Query audit logs (admin only)
     */
    static async query(filters: {
        userId?: string;
        action?: string;
        resourceType?: string;
        startDate?: Date;
        endDate?: Date;
        limit?: number;
    }) {
        if (!supabase) {
            throw new Error('Supabase not configured');
        }

        let query = supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters.userId) {
            query = query.eq('user_id', filters.userId);
        }
        if (filters.action) {
            query = query.eq('action', filters.action);
        }
        if (filters.resourceType) {
            query = query.eq('resource_type', filters.resourceType);
        }
        if (filters.startDate) {
            query = query.gte('created_at', filters.startDate.toISOString());
        }
        if (filters.endDate) {
            query = query.lte('created_at', filters.endDate.toISOString());
        }
        if (filters.limit) {
            query = query.limit(filters.limit);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to query audit logs: ${error.message}`);
        }

        return data;
    }
}
