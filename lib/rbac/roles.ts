/**
 * Role-Based Access Control (RBAC) System
 * Defines roles and permissions for MindBridge platform
 */

export enum Role {
    ADMIN = 'admin',
    CLINICIAN = 'clinician',
    VIEWER = 'viewer',
}

export enum Permission {
    // Patient data
    VIEW_PATIENTS = 'view_patients',
    VIEW_PATIENT_DETAIL = 'view_patient_detail',
    UPDATE_PATIENT = 'update_patient',
    DELETE_PATIENT = 'delete_patient',
    EXPORT_PATIENT_DATA = 'export_patient_data',

    // Sessions
    VIEW_SESSIONS = 'view_sessions',
    DELETE_SESSIONS = 'delete_sessions',

    // Configuration
    UPDATE_TRIAGE_CONFIG = 'update_triage_config',
    VIEW_AUDIT_LOGS = 'view_audit_logs',

    // User management
    MANAGE_USERS = 'manage_users',
    ASSIGN_ROLES = 'assign_roles',

    // Incidents
    VIEW_INCIDENTS = 'view_incidents',
    MANAGE_INCIDENTS = 'manage_incidents',

    // System
    SYSTEM_ADMIN = 'system_admin',
}

/**
 * Role to permissions mapping
 */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    [Role.ADMIN]: [
        // Admins have all permissions
        ...Object.values(Permission),
    ],
    [Role.CLINICIAN]: [
        Permission.VIEW_PATIENTS,
        Permission.VIEW_PATIENT_DETAIL,
        Permission.UPDATE_PATIENT,
        Permission.VIEW_SESSIONS,
        Permission.UPDATE_TRIAGE_CONFIG,
    ],
    [Role.VIEWER]: [
        Permission.VIEW_PATIENTS,
        Permission.VIEW_PATIENT_DETAIL,
        Permission.VIEW_SESSIONS,
    ],
};

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
    const permissions = getRolePermissions(role);
    return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
    return permissions.some(p => hasPermission(role, p));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
    return permissions.every(p => hasPermission(role, p));
}
