/**
 * Role-Based Access Control (RBAC) configuration
 * Defines which routes each role can access
 */

import { UserRole } from "./types";

// Define protected routes - all routes
export const protectedRoutes = [
  "/dashboard",
  "/advisor-dashboard",
  "/telecaller-dashboard",
  "/processing-dashboard",
  "/leads",
  "/users",
  "/settings",
  // "/reports",
  // "/meetings", // TEMPORARILY DISABLED
  // "/stages",
  // "/documents",
  "/document-reminders",
  "/profile",
];

// Route definitions - using full paths that match actual routes
// Updated to match the new folder structure where pages are at root level
export const ROUTES = {
  PROFILE: "/profile",
  DASHBOARD: "/dashboard",
  ADVISOR_DASHBOARD: "/advisor-dashboard",
  TELECALLER_DASHBOARD: "/telecaller-dashboard",
  PROCESSING_DASHBOARD: "/processing-dashboard",
  LEADS: "/leads",
  USERS: "/users",
  // MEETINGS: "/meetings", // TEMPORARILY DISABLED
  // DOCUMENTS: "/documents",
  // REMINDERS: "/reminders",
  DOCUMENT_REMINDERS: "/document-reminders",
} as const;

// Define which routes each role can access
export const roleRoutes: Record<UserRole, string[]> = {
  admin: [
    ROUTES.DASHBOARD,
    ROUTES.LEADS,
    ROUTES.USERS,
    ROUTES.DOCUMENT_REMINDERS,
    // ROUTES.CALL_HISTORY,
  ],
  manager: [
    ROUTES.DASHBOARD,
    ROUTES.PROFILE,
    ROUTES.LEADS,
    ROUTES.USERS,
    ROUTES.DOCUMENT_REMINDERS,
    // ROUTES.CALL_HISTORY,
  ],
  advisor: [
    ROUTES.ADVISOR_DASHBOARD,
    ROUTES.LEADS,
    ROUTES.PROFILE,
    /*, ROUTES.MEETINGS */ // MEETINGS TEMPORARILY DISABLED
  ],
  telecaller: [ROUTES.TELECALLER_DASHBOARD, ROUTES.LEADS, ROUTES.PROFILE],
  processing: [
    ROUTES.PROCESSING_DASHBOARD,
    ROUTES.LEADS,
    ROUTES.PROFILE,
    ROUTES.DOCUMENT_REMINDERS,
  ],
};

/**
 * Check if a user role can access a specific route
 */
export function canAccessRoute(
  role: string | undefined | null,
  pathname: string
): boolean {
  if (!role) return false;

  // Normalize role to lowercase
  const normalizedRole = role.toLowerCase() as UserRole;

  // Check if role exists in our RBAC config
  if (!roleRoutes[normalizedRole]) {
    return false;
  }

  // Get allowed routes for this role
  const allowedRoutes = roleRoutes[normalizedRole];

  // Check if pathname matches any allowed route
  // We check if pathname starts with any allowed route
  return allowedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Get default redirect route for a role
 */
export function getDefaultRoute(role: string | undefined | null): string {
  if (!role) return ROUTES.DASHBOARD;

  const normalizedRole = role.toLowerCase() as UserRole;
  const allowedRoutes = roleRoutes[normalizedRole] || [ROUTES.DASHBOARD];

  // Return the first route (usually dashboard)
  return allowedRoutes[0];
}
