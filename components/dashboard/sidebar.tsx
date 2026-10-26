"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCog,
  BarChart3,
  Settings,
  Phone,
  Calendar,
  X,
  TrendingUp,
  ChevronRight,
  LogOut,
  FileText,
  Bell,
  Circle,
  LucideIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ROUTES, roleRoutes } from "@/lib/rbac";
import { UserRole } from "@/lib/types";
import { useLeadStore } from "@/lib/store/use-lead-store";
import { useReminderStore } from "@/lib/store/use-reminder-store";
import { getInitials } from "@/lib/format-utils";

// interface NavItem {
//   title: string;
//   href: string;
//   icon: LucideIcon; // Correct type for Lucide icons
//   badge?: string;
// }

// Configuration for known routes
// Any route not in this list will be auto-generated with a default icon
const ROUTE_UI_CONFIG: Record<
  string,
  { title: string; icon: LucideIcon; badge?: string }
> = {
  [ROUTES.DASHBOARD]: { title: "Dashboard", icon: LayoutDashboard },
  [ROUTES.ADVISOR_DASHBOARD]: { title: "Dashboard", icon: LayoutDashboard },
  [ROUTES.TELECALLER_DASHBOARD]: { title: "Dashboard", icon: LayoutDashboard },
  [ROUTES.PROCESSING_DASHBOARD]: { title: "Dashboard", icon: LayoutDashboard },
  [ROUTES.LEADS]: { title: "Leads", icon: Users, badge: "12" }, // keeping badge static for now or can be dynamic later
  // [ROUTES.CALL_HISTORY]: { title: "Call History", icon: Phone },
  // [ROUTES.MEETINGS]: { title: "Meetings", icon: Calendar, badge: "3" }, // TEMPORARILY DISABLED
  [ROUTES.USERS]: { title: "User Management", icon: UserCog },
  [ROUTES.DOCUMENT_REMINDERS]: { title: "Document Reminders", icon: Bell },
  // [ROUTES.DOCUMENTS]: { title: "Documents", icon: FileText }, // TEMPORARILY DISABLED
  // [ROUTES.REMINDERS]: { title: "Reminders", icon: Bell }, // TEMPORARILY DISABLED
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function Sidebar({ isOpen, onClose, isCollapsed }: SidebarProps) {
  const { user, logout } = useAuth();
  const { leads, totalLeads } = useLeadStore();
  const { reminders } = useReminderStore();
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Calculate dynamic counts
  const activeLeadsCount = leads.filter(
    (l) => l.assignedTo === user?.name || l.assignedTo === "Sales User"
  ).length;
  const pendingRemindersCount = reminders.filter(
    (r) => r.status === "pending"
  ).length;

  // Dynamically generate nav items based on user role
  const filteredNavItems = (() => {
    if (!user?.role) return [];

    const userRole = user.role as UserRole;
    const allowedRoutes = roleRoutes[userRole] || [];

    return allowedRoutes
      .filter((route) => route !== ROUTES.PROFILE) // Exclude profile as it's shown in the user card
      .map((route) => {
        // Check if we have explicit config for this route
        const config = ROUTE_UI_CONFIG[route];

        if (config) {
          let badge = config.badge;

          // Inject dynamic counts
          if (route === ROUTES.LEADS) {
            // Use total leads count from store for Leads menu item
            badge = totalLeads > 0 ? totalLeads.toString() : undefined;
          } else if (route === ROUTES.DOCUMENT_REMINDERS) {
            badge =
              pendingRemindersCount > 0
                ? pendingRemindersCount.toString()
                : undefined;
          }

          return {
            title: config.title,
            href: route,
            icon: config.icon,
            badge: badge,
          };
        }

        // Fallback for new routes not in UI config
        // Generate title from route path: "/new-feature" -> "New Feature"
        const fallbackTitle = route
          .replace(/^\//, "")
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");

        return {
          title: fallbackTitle,
          href: route,
          icon: Circle, // Default icon
        };
      });
  })();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulseGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .sidebar-scroll::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: var(--color-border);
          border-radius: 3px;
          transition: background 0.3s;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--color-muted-foreground);
        }

        .nav-item {
          animation: slideIn 0.4s ease-out both;
        }

        .shine-effect {
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(90deg, transparent, rgba(232, 214, 138, 0.15), transparent);
          pointer-events: none;
        }

        .group:hover .shine-effect {
          animation: shimmer 0.8s ease-out;
        }

        .pulse-glow {
          animation: pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden transition-all duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen transition-all duration-500 ease-out",
          "bg-sidebar border-r border-sidebar-border shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "lg:w-20" : "lg:w-72",
          "w-72"
        )}
      >
        {/* Animated gradient overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, var(--color-primary), transparent 40%)`,
          }}
        />

        {/* Header */}
        <div
          className={cn(
            "relative flex h-20 items-center justify-between border-b border-sidebar-border px-6 backdrop-blur-sm",
            isCollapsed && "lg:justify-center lg:px-3"
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3 transition-all duration-300",
              isCollapsed && "lg:justify-center lg:px-0"
            )}
          >
            {isCollapsed ? (
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-lg blur-md pulse-glow" />
                <span className="relative text-xl font-bold gradient-text">
                  BCA
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-1 transition-all duration-300">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-primary/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <img
                    src="/logo.png"
                    alt="Baker & Co. Associates"
                    className="relative w-48 h-auto drop-shadow-sm dark:drop-shadow-none"
                  />
                </div>
              </div>
            )}
          </div>
          <button
            className="lg:hidden p-2 rounded-lg transition-all duration-300 hover:bg-sidebar-accent hover:rotate-90 text-sidebar-foreground/70 hover:text-sidebar-foreground"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 sidebar-scroll">
          {filteredNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isHovered = hoveredItem === item.href;

            return (
              <div
                key={item.href}
                className="relative nav-item"
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Active indicator line */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-lg shadow-primary/50 transition-all duration-300" />
                )}

                <Link
                  href={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all duration-300 overflow-hidden",
                    isActive
                      ? "bg-primary/15 text-sidebar-foreground shadow-lg shadow-primary/10"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                    isCollapsed && "lg:justify-center lg:px-3"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  {/* Hover background effect */}
                  {isHovered && !isActive && (
                    <div className="absolute inset-0 bg-primary/5 transition-opacity duration-300" />
                  )}

                  {/* Icon container */}
                  <div
                    className="relative transition-transform duration-300"
                    style={{ transform: isHovered ? "scale(1.1)" : "scale(1)" }}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-all duration-300 relative z-10",
                        isActive && "text-primary"
                      )}
                    />
                    {isActive && (
                      <div className="absolute inset-0 bg-primary/30 rounded-full blur-md pulse-glow" />
                    )}
                  </div>

                  {/* Label */}
                  {!isCollapsed && (
                    <span className="relative flex-1 transition-all duration-300">
                      {item.title}
                    </span>
                  )}

                  {/* Badge */}
                  {!isCollapsed && item.badge && (
                    <span className="relative flex p-1 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground shadow-lg shadow-destructive/30 pulse-glow">
                      {item.badge}
                    </span>
                  )}

                  {/* Chevron indicator */}
                  {!isCollapsed && isHovered && (
                    <ChevronRight
                      className="h-4 w-4 text-muted-foreground transition-transform duration-300"
                      style={{ transform: "translateX(4px)" }}
                    />
                  )}

                  {/* Shine effect */}
                  <div className="shine-effect" />
                </Link>
              </div>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="relative border-t border-sidebar-border p-4">
          <div
            className={cn(
              "group relative flex items-center gap-3 rounded-xl bg-sidebar-accent/50 p-3 transition-all duration-300 hover:bg-sidebar-accent cursor-pointer",
              isCollapsed && "lg:justify-center"
            )}
          >
            {/* Avatar with glow */}
            <div className="relative">
              <div className="absolute inset-0 bg-primary/40 rounded-full blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold shadow-lg ring-2 ring-primary/20">
                {user ? getInitials(user.name) : "U"}
              </div>
            </div>

            {/* User Info */}
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sidebar-foreground truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            )}

            {/* Logout Button */}
            {!isCollapsed && (
              <button
                className="h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-300 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={logout}
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
