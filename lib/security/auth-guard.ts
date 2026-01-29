import { createServiceSupabaseClient } from '@/lib/supabase';
import { Logger } from '@/lib/logger';
import { ApiError } from '@/lib/security/api-error';
import { getServerUserId } from '@/lib/auth/server';

/**
 * Authorization Guard for API Routes
 * Enforces authentication and optional role checks
 */
export async function authGuard(allowedRoles?: string[]) {
    const userId = await getServerUserId();

    if (!userId) {
        throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    // specific role check if needed
    if (allowedRoles && allowedRoles.length > 0) {
        const supabase = createServiceSupabaseClient();
        if (!supabase) {
            // Fail open in dev if no supabase, but log warning
            if (process.env.NODE_ENV === 'development') {
                Logger.warn('Skipping role check (Supabase not configured)', { userId });
                return { userId };
            }
            throw new ApiError('Service Unavailable', 503, 'DB_CONFIG_ERROR');
        }

        const { data: roleRecord } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .single();

        if (!roleRecord || !allowedRoles.includes(roleRecord.role)) {
            Logger.warn('Access Denied (Role Mismatch)', { userId, required: allowedRoles, actual: roleRecord?.role });
            throw new ApiError('Forbidden', 403, 'FORBIDDEN');
        }
    }

    return { userId };
}
