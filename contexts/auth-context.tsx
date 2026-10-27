"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: any | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isSuperAdmin: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // The platform Super Admin passes every admin check in the UI, mirroring the backend's role middleware.
  const isSuperAdmin = session?.user?.role === "super_admin";
  const user = session?.user ? (isSuperAdmin ? { ...session.user, role: "admin" } : session.user) : null;

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/login" });
    }
  }, [session, router]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;

    // Define role-based permissions
    const rolePermissions: Record<string, string[]> = {
      admin: [
        "canViewDashboard",
        "canManageLeads",
        "canManageUsers",
        "canViewReports",
        "canEditSettings",
        "canManageMeetings",
        "canManageCalls",
        "canManageStages",
      ],
      manager: [
        "canViewDashboard",
        "canManageLeads",
        "canViewReports",
        "canManageMeetings",
        "canManageCalls",
        "canManageStages",
      ],
      advisor: [
        "canViewDashboard",
        "canManageLeads",
        "canManageMeetings",
        "canManageCalls",
      ],
      sales: [
        "canViewDashboard",
        "canManageLeads",
        "canManageMeetings",
        "canManageCalls",
      ],
      processing: ["canViewDashboard"],
    };

    const permissions = rolePermissions[user.role as string] || [];

    return permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoading: status === "loading",
        isSuperAdmin,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
