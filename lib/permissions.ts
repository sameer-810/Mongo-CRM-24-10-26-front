import { UserRole } from "./types";

export interface UserPermissions {
  canViewDashboard: boolean;
  canAddLeads: boolean;
  canManageLeads: boolean;
  canEditLeads: boolean;
  canDeleteLeads: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
  canManageCalls: boolean;
  canManageMeetings: boolean;
  canManageStages: boolean;
}

/**
 * Get permissions for a given user role
 * @param role - The user role (case-insensitive)
 * @returns UserPermissions object with boolean flags for each permission
 */
export function getPermissions(
  role: UserRole | string | undefined | null
): UserPermissions {
  // Normalize role to lowercase for comparison
  const normalizedRole = role?.toLowerCase() ?? "";

  // Base permissions - no access
  const basePermissions: UserPermissions = {
    canViewDashboard: false,
    canAddLeads: false,
    canManageLeads: false,
    canEditLeads: false,
    canDeleteLeads: false,
    canViewReports: false,
    canManageUsers: false,
    canManageCalls: false,
    canManageMeetings: false,
    canManageStages: false,
  };

  // Admin: Full access
  if (normalizedRole === "admin") {
    return {
      canViewDashboard: true,
      canAddLeads: true,
      canManageLeads: true,
      canEditLeads: true,
      canDeleteLeads: true,
      canViewReports: true,
      canManageUsers: true,
      canManageCalls: true,
      canManageMeetings: true,
      canManageStages: true,
    };
  }

  // Manager: Most permissions except user management, edit/delete leads
  if (normalizedRole === "manager") {
    return {
      canViewDashboard: true,
      canAddLeads: true,
      canManageLeads: true,
      canEditLeads: true,
      canDeleteLeads: false,
      canViewReports: true,
      canManageUsers: false,
      canManageCalls: true,
      canManageMeetings: true,
      canManageStages: true,
    };
  }

  // Advisor: Similar to sales
  if (normalizedRole === "advisor") {
    return {
      canViewDashboard: true,
      canAddLeads: true,
      canManageLeads: true,
      canEditLeads: true,
      canDeleteLeads: false,
      canViewReports: false,
      canManageUsers: false,
      canManageCalls: true,
      canManageMeetings: true,
      canManageStages: false,
    };
  }

  // Sales: Limited to leads, calls, and meetings
  if (normalizedRole === "sales") {
    return {
      canViewDashboard: true,
      canAddLeads: false,
      canManageLeads: true,
      canEditLeads: false,
      canDeleteLeads: false,
      canViewReports: false,
      canManageUsers: false,
      canManageCalls: true,
      canManageMeetings: true,
      canManageStages: false,
    };
  }

  // Telecaller: Limited to dashboard, leads, and calls. now he can edit leads also
  if (normalizedRole === "telecaller") {
    return {
      canViewDashboard: true,
      canAddLeads: true,
      canManageLeads: true,
      canEditLeads: true,
      canDeleteLeads: false,
      canViewReports: false,
      canManageUsers: false,
      canManageCalls: true,
      canManageMeetings: false,
      canManageStages: false,
    };
  }

  // Processing: Read-only access to dashboard
  if (normalizedRole === "processing") {
    return {
      canViewDashboard: true,
      canAddLeads: false,
      canManageLeads: false,
      canEditLeads: true,
      canDeleteLeads: false,
      canViewReports: false,
      canManageUsers: false,
      canManageCalls: false,
      canManageMeetings: false,
      canManageStages: false,
    };
  }

  // Unknown role - return base permissions (no access)
  return basePermissions;
}
