"use client";

import { useAuth } from "@/contexts/auth-context";
import { useReminders } from "@/contexts/reminder-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Bell,
  LogOut,
  Settings,
  User,
  Menu,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Clock,
  Phone,
  Mail,
  MessageSquare,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { LeadReminderItem } from "@/lib/types";

interface HeaderProps {
  onMenuClick: () => void;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
}

export function Header({
  onMenuClick,
  onToggleCollapse,
  isCollapsed,
}: HeaderProps) {
  const { user, logout, isSuperAdmin } = useAuth();
  const { reminders, pendingCount } = useReminders();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const formatReminderTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      return "Overdue";
    } else if (diffMins < 60) {
      return `In ${diffMins} min`;
    } else if (diffHours < 24) {
      return `In ${diffHours} hr`;
    } else if (diffDays < 7) {
      return `In ${diffDays} day${diffDays > 1 ? "s" : ""}`;
    } else {
      return format(date, "MMM dd, yyyy");
    }
  };

  const pendingReminders = reminders
    .filter((r) => r.status === "pending")
    .sort((a, b) => {
      const dateA = new Date(a.reminderDateTime).getTime();
      const dateB = new Date(b.reminderDateTime).getTime();
      return dateA - dateB;
    })
    .slice(0, 10); // Show max 10 in dropdown

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={onToggleCollapse}
          >
            {isCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>

          <h2 className="text-lg font-semibold hidden sm:block">
            CRM Dashboard
          </h2>
        </div>

        {/* Reminders dropdown */}
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-primary/10"
              aria-label="Reminders"
            >
              <Bell className="h-5 w-5" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Reminders</span>
              {pendingCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {pendingCount} pending
                </span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {pendingReminders.length === 0 ? (
              <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                No pending reminders
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                {pendingReminders.map((reminder: LeadReminderItem) => {
                  return (
                    <DropdownMenuItem
                      key={reminder.id}
                      className="flex flex-col items-start gap-2 p-3 cursor-pointer"
                      // onClick={() => router.push(`/leads/${reminder.leadId}`)}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            "bg-blue-500/10 text-blue-500"
                          )}
                        >
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {reminder.title}
                          </p>
                          {reminder.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {reminder.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {formatReminderTime(reminder.reminderDateTime)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu> */}

        <div className="flex items-center gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-primary/10"
            aria-label="Toggle theme"
            disabled={!mounted}
          >
            {mounted && (
              <>
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </>
            )}
            {!mounted && <Sun className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 gap-2 hover:bg-primary/10"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {user ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start text-sm">
                  <span className="font-medium">{user?.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {isSuperAdmin ? "Super Admin" : user?.role}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {user?.role !== "admin" && (
                <>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
