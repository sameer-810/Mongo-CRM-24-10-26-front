"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Header } from "@/components/dashboard/header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { canAccessRoute, getDefaultRoute } from "@/lib/rbac";
import { Card } from "@/components/ui/card";
import { Shield, AlertCircle } from "lucide-react";

interface PageLayoutProps {
  children: React.ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    // Don't redirect if we're on a public route
    const publicRoutes = ["/login", "/register", "/reset-password"];
    const isPublicRoute = pathname && publicRoutes.some((route) => pathname.startsWith(route));
    
    if (isPublicRoute) {
      return; // Allow public routes to render without auth checks
    }

    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    // Check RBAC access when user is loaded and pathname is available
    if (!isLoading && user && pathname) {
      const userRole = user.role as string;

      // Check if user has access to current route
      if (!canAccessRoute(userRole, pathname)) {
        // Redirect immediately to default route - don't allow page rendering
        const defaultRoute = getDefaultRoute(userRole);
        router.replace(defaultRoute);
      }
    }
  }, [user, isLoading, router, pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Allow public routes to render without auth checks or layout
  if (pathname && ["/login", "/register", "/reset-password"].some((route) => pathname.startsWith(route))) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Prevent page rendering if user doesn't have access
  // The middleware should catch this, but this is a client-side safety check
  if (!isLoading && user && pathname) {
    const userRole = user.role as string;
    if (!canAccessRoute(userRole, pathname)) {
      // Show access denied message while redirect happens
      return (
        <div className="flex h-screen items-center justify-center bg-background p-4">
          <Card className="max-w-md w-full border-destructive/50 bg-card shadow-xl">
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center border-2 border-destructive/20">
                <Shield className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Access Denied
              </h1>
              <p className="text-muted-foreground mb-1">
                You don't have permission to access this page.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>Invalid URL</span>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Redirecting you to your dashboard...
              </p>
            </div>
          </Card>
        </div>
      );
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isCollapsed={isSidebarCollapsed}
      />

      <div
        className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-72"
        }`}
      >
        <Header
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isCollapsed={isSidebarCollapsed}
        />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
