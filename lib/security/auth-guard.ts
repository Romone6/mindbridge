import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import { Logger } from '@/lib/logger';
import { ApiError } from '@/lib/security/api-error';

/**
 * Authorization Guard for API Routes
 * Enforces authentication and optional role checks
 */
export async function authGuard(allowedRoles?: string[]) {
    const { userId } = await auth();

    if (!userId) {
        throw new ApiError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    // specific role check if needed
    if (allowedRoles && allowedRoles.length > 0) {
        if (!supabase) {
            // Fail open in dev if no supabase, but log warning
            if (process.env.NODE_ENV === 'development') {
                Logger.warn('Skipping role check (Supabase not configured)', { userId });
                return { userId };
            }
            throw new ApiError('Service Unavailable', 503, 'DB_CONFIG_ERROR');
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId) // Assuming Clerk ID matched Supabase ID via webhook sync
            .single();

        if (!profile || !allowedRoles.includes(profile.role)) {
            Logger.warn('Access Denied (Role Mismatch)', { userId, required: allowedRoles, actual: profile?.role });
            throw new ApiError('Forbidden', 403, 'FORBIDDEN');
        }
    }

    return { userId };
}
