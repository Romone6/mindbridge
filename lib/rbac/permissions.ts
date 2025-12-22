/**
 * Permission checking utilities and route protection
 */

import { auth } from '@clerk/nextjs/server';
import { supabase } from '../supabase';
import { Role, Permission, hasPermission } from './roles';

export interface UserWithRole {
    userId: string;
    role: Role;
    permissions?: Permission[];
}

/**
 * Get user role from database
 */
export async function getUserRole(userId: string): Promise<Role | null> {
    if (!supabase) {
        console.warn('[RBAC] Supabase not configured, defaulting to VIEWER role');
        return Role.VIEWER;
    }

    try {
        const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .single();

        if (error || !data) {
            console.warn('[RBAC] User role not found, defaulting to VIEWER');
            return Role.VIEWER;
        }

        return data.role as Role;
    } catch (error) {
        console.error('[RBAC] Error fetching user role:', error);
        return Role.VIEWER;
    }
}

/**
 * Get current authenticated user with role
 */
export async function getCurrentUserWithRole(): Promise<UserWithRole | null> {
    const { userId } = await auth();

    if (!userId) {
        return null;
    }

    const role = await getUserRole(userId);

    if (!role) {
        return null;
    }

    return {
        userId,
        role,
    };
}

/**
 * Require authentication and specific permission
 * Throws error if unauthorized
 */
export async function requirePermission(permission: Permission): Promise<UserWithRole> {
    const user = await getCurrentUserWithRole();

    if (!user) {
        throw new Error('Unauthorized: User not authenticated');
    }

    if (!hasPermission(user.role, permission)) {
        throw new Error(`Forbidden: User lacks permission: ${permission}`);
    }

    return user;
}

/**
 * Require authentication and specific role
 */
export async function requireRole(role: Role): Promise<UserWithRole> {
    const user = await getCurrentUserWithRole();

    if (!user) {
        throw new Error('Unauthorized: User not authenticated');
    }

    if (user.role !== role) {
        throw new Error(`Forbidden: Requires role: ${role}`);
    }

    return user;
}

/**
 * Check if current user has permission (returns boolean, doesn't throw)
 */
export async function checkPermission(permission: Permission): Promise<boolean> {
    try {
        await requirePermission(permission);
        return true;
    } catch {
        return false;
    }
}

/**
 * Assign role to user (admin only)
 */
export async function assignRole(
    userId: string,
    role: Role,
    assignedBy: string
): Promise<void> {
    if (!supabase) {
        throw new Error('Supabase not configured');
    }

    const { error } = await supabase
        .from('user_roles')
        .upsert({
            user_id: userId,
            role,
            created_by: assignedBy,
            updated_at: new Date().toISOString(),
        });

    if (error) {
        throw new Error(`Failed to assign role: ${error.message}`);
    }
}
