"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getPermissions } from "@/lib/permissions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import UserModal from "@/components/users/user-modal";
import { ChangePasswordModal } from "@/components/users/change-password-modal";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  UserPlus,
  Users,
  Shield,
  ShieldCheck,
  UserIcon,
  Eye,
  RefreshCw,
  Mail,
  MoreVertical,
  Crown,
  Briefcase,
  UserX,
  Copy,
  Check,
  Key,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getAllUsers, deleteUser } from "@/lib/server-actions";
import { UsersResponse, UserRole, User } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatsCard } from "@/components/dashboard/stats-card";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatusBadge } from "@/components/ui/status-badge-config";
import { userRoleConfig } from "@/lib/badge-configs";
import { getInitials } from "@/lib/format-utils";

export default function UsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<UsersResponse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewUser, setViewUser] = useState<UsersResponse | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string | null>(
    null
  );
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [newlyAddedUserId, setNewlyAddedUserId] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [userToChangePassword, setUserToChangePassword] =
    useState<UsersResponse | null>(null);

  const permissions = user ? getPermissions(user.role) : null;

  // Copy to clipboard function
  const handleCopy = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      });
    }
  };

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await getAllUsers();
        if (result && Array.isArray(result)) {
          setUsers(result);

          // Check if current user exists in the list
          const currentUserEmail = user?.email?.toLowerCase();
          const currentUserInList = result.find(
            (u) => u.email?.toLowerCase() === currentUserEmail
          );
        } else {
          toast({
            title: "Error",
            description: "Failed to fetch users",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast, user]);

  // Check if user has permission to view users page (Admin and Manager can view)
  const userRole = user?.role?.toLowerCase();
  const canViewUsersPage = userRole === "admin" || userRole === "manager";

  if (!canViewUsersPage) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Card className="max-w-md border border-border bg-card shadow-xl">
          <CardHeader className="border-b border-border pb-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-error/10 flex items-center justify-center border border-error/20">
                <Shield className="h-6 w-6 text-error" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">
                  Access Denied
                </CardTitle>
                <CardDescription className="text-sm font-light mt-0.5">
                  You don't have permission to view users
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (userToEdit: UsersResponse) => {
    const user: User = {
      id: userToEdit.id,
      name: userToEdit.name,
      email: userToEdit.email,
      role: userToEdit.role.name as UserRole,
    };
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleViewUser = (userToView: UsersResponse) => {
    setViewUser(userToView);
    setIsViewDialogOpen(true);
  };

  const handleChangePassword = (userToChange: UsersResponse) => {
    setUserToChangePassword(userToChange);
    setIsPasswordModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const result = await deleteUser(userToDelete);
      if (result !== null && result !== undefined) {
        setUsers(users.filter((u) => u.id !== userToDelete));
        toast({
          title: "User Deleted",
          description: "The user has been removed successfully.",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setUserToDelete(null);
    }
  };

  const handleModalSuccess = async () => {
    try {
      const previousUserCount = users.length;
      const result = await getAllUsers();
      if (result && result.length > 0) {
        setUsers(result);

        // If a new user was added (user count increased), find and highlight the new user
        if (result.length > previousUserCount) {
          // Find the newly added user (the one not in the previous list)
          const newUser = result.find(
            (newU) => !users.some((oldU) => oldU.id === newU.id)
          );

          if (newUser) {
            setNewlyAddedUserId(newUser.id);
            // Remove highlight after 5 seconds
            setTimeout(() => {
              setNewlyAddedUserId(null);
            }, 5000);
          }
        }
      }
    } catch (error) {
      console.error("Failed to refresh users:", error);
    }
  };

  const handleRefreshUsers = async () => {
    setIsLoading(true);
    try {
      const result = await getAllUsers();
      if (result && Array.isArray(result)) {
        setUsers(result);
        toast({
          title: "Users Refreshed",
          description: "User list has been updated successfully.",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to refresh users",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats
  const totalUsers = users.length;
  const adminCount = 1;
  const managerCount = users.filter(
    (u) => u?.role?.name?.toLowerCase() === "manager"
  ).length;
  const advisorCount = users.filter(
    (u) => u?.role?.name?.toLowerCase() === "advisor"
  ).length;
  const telecallerCount = users.filter(
    (u) => u?.role?.name?.toLowerCase() === "telecaller"
  ).length;
  const processingCount = users.filter(
    (u) => u?.role?.name?.toLowerCase() === "processing"
  ).length;

  // Filter users based on selected role
  const filteredUsers = selectedRoleFilter
    ? users.filter(
      (u) => u?.role?.name?.toLowerCase() === selectedRoleFilter.toLowerCase()
    )
    : users;

  // Sort users to show logged-in user at the top, then newly added user
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    // Get current user's email for comparison
    const currentUserEmail = user?.email?.toLowerCase();
    const aEmail = a.email?.toLowerCase();
    const bEmail = b.email?.toLowerCase();

    // Current user always at the top
    if (aEmail === currentUserEmail) return -1;
    if (bEmail === currentUserEmail) return 1;

    // Newly added user comes second (right after current user)
    if (a.id === newlyAddedUserId) return -1;
    if (b.id === newlyAddedUserId) return 1;

    // Otherwise, maintain original order
    return 0;
  });




  return (
    <div className="space-y-8 animate-fade-in p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <PageHeader
        title="User"
        highlightedText="Management"
        description="Manage team members, roles, and access permissions"
        action={
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleRefreshUsers}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
              Refresh
            </Button>
            {/* Add User button for Admin and Manager */}
            {(user?.role?.toLowerCase() === "admin" ||
              user?.role?.toLowerCase() === "manager") && (
                <Button
                  onClick={handleAddUser}
                  className="gap-2 h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm hover:shadow-md transition-all"
                >
                  <UserPlus className="h-4 w-4" />
                  Add User
                </Button>
              )}
          </div>
        }
      />

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        <StatsCard
          title="Total Users"
          value={totalUsers}
          description="Active team members"
          icon={Users}
          colorClass="primary"
        />

        <StatsCard
          title="Admin"
          value={adminCount}
          description="Full system access"
          icon={Crown}
          colorClass="error"
        />

        <StatsCard
          title="Manager"
          value={managerCount}
          description="Team leadership"
          icon={ShieldCheck}
          colorClass="primary"
        />

        <StatsCard
          title="Advisor"
          value={advisorCount}
          description="Advisory access"
          icon={UserIcon}
          colorClass="info"
        />

        <StatsCard
          title="Telecaller"
          value={telecallerCount}
          description="Telecalling ops"
          icon={Briefcase}
          colorClass="warning"
        />

        <StatsCard
          title="Processing"
          value={processingCount}
          description="Processing ops"
          icon={UserIcon}
          colorClass="success"
        />
      </div>

      {/* Users Table */}
      <SectionCard
        title="Team Members"
        description="All users in your organization with their roles and permissions"
        icon={Users}
        iconColor="primary"
      >
        {/* Role Filter */}
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-muted-foreground mr-2">
            Filter by role:
          </span>
          <Badge
            variant={selectedRoleFilter === null ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/20 transition-colors"
            onClick={() => setSelectedRoleFilter(null)}
          >
            All ({totalUsers})
          </Badge>
          <Badge
            variant={selectedRoleFilter === "admin" ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors",
              selectedRoleFilter === "admin"
                ? "bg-error/10 text-error border-error/20 hover:bg-error/20"
                : "hover:bg-error/10"
            )}
            onClick={() => setSelectedRoleFilter("admin")}
          >
            Admin ({adminCount})
          </Badge>
          <Badge
            variant={selectedRoleFilter === "manager" ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors",
              selectedRoleFilter === "manager"
                ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                : "hover:bg-primary/10"
            )}
            onClick={() => setSelectedRoleFilter("manager")}
          >
            Manager ({managerCount})
          </Badge>
          <Badge
            variant={selectedRoleFilter === "advisor" ? "default" : "outline"}
            className={cn(
              "cursor-pointer transition-colors",
              selectedRoleFilter === "advisor"
                ? "bg-info/10 text-info border-info/20 hover:bg-info/20"
                : "hover:bg-info/10"
            )}
            onClick={() => setSelectedRoleFilter("advisor")}
          >
            Advisor ({advisorCount})
          </Badge>
          <Badge
            variant={
              selectedRoleFilter === "telecaller" ? "default" : "outline"
            }
            className={cn(
              "cursor-pointer transition-colors",
              selectedRoleFilter === "telecaller"
                ? "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20"
                : "hover:bg-warning/10"
            )}
            onClick={() => setSelectedRoleFilter("telecaller")}
          >
            Telecaller ({telecallerCount})
          </Badge>
          <Badge
            variant={
              selectedRoleFilter === "processing" ? "default" : "outline"
            }
            className={cn(
              "cursor-pointer transition-colors",
              selectedRoleFilter === "processing"
                ? "bg-success/10 text-success border-success/20 hover:bg-success/20"
                : "hover:bg-success/10"
            )}
            onClick={() => setSelectedRoleFilter("processing")}
          >
            Processing ({processingCount})
          </Badge>
        </div>

        {users.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No users found
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by adding your first team member
            </p>
            <Button onClick={handleAddUser} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && users.length > 0 && (
          <div className="relative border border-border rounded-lg overflow-hidden bg-card shadow-sm">
            {/* Table Container with Fixed Height and Scroll */}
            <div className="overflow-auto max-h-[600px] scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
              <table className="w-full">
                {/* Fixed Header */}
                <thead className="bg-muted/50 sticky top-0 z-10 border-b border-border backdrop-blur-sm">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground tracking-wider">
                      Name
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground tracking-wider">
                      Email
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground tracking-wider">
                      Role
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-muted-foreground tracking-wider">
                      Created Date
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-muted-foreground tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-border">
                  {sortedUsers.map((u, index) => {
                    const isCurrentUser =
                      u.email?.toLowerCase() === user?.email?.toLowerCase();
                    const isNewlyAdded = u.id === newlyAddedUserId;

                    const roleName =
                      u?.role?.name?.toLowerCase() as keyof typeof userRoleConfig;
                    const config =
                      userRoleConfig[roleName] || userRoleConfig.viewer;
                    const RoleIcon = config.icon;
                    const userPermissions = getPermissions(
                      u.role.name as UserRole
                    );

                    return (
                      <tr
                        key={u.id}
                        className={cn(
                          "group hover:bg-muted/20 transition-colors duration-200",
                          isCurrentUser &&
                          "bg-primary/5 border-l-4 border-l-primary",
                          isNewlyAdded &&
                          "animate-in fade-in slide-in-from-top-4 duration-500 bg-success/10 border-l-4 border-l-success"
                        )}
                      >
                        {/* User Column */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar
                              className={cn(
                                "h-10 w-10 border-2",
                                config.borderColor
                              )}
                            >
                              <AvatarFallback
                                className={cn(
                                  "font-semibold text-sm",
                                  config.bgColor,
                                  config.color
                                )}
                              >
                                {getInitials(u.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex items-center gap-2">
                              <div className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                {u.name}
                              </div>
                              {isCurrentUser && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary border-primary/20"
                                >
                                  You
                                </Badge>
                              )}
                              {isNewlyAdded && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-semibold px-2 py-0.5 bg-success/10 text-success border-success/20 animate-pulse"
                                >
                                  New
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email Column */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground group/email">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{u.email}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0 opacity-0 group-hover/email:opacity-100 transition-opacity"
                              onClick={() =>
                                handleCopy(u.email, `email-${u.id}`)
                              }
                            >
                              {copiedField === `email-${u.id}` ? (
                                <Check className="h-3.5 w-3.5 text-success" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </td>

                        {/* Role Column */}
                        <td className="py-4 px-6">
                          <Badge
                            className={cn(
                              "font-semibold border flex items-center gap-1.5 w-fit",
                              config.bgColor,
                              config.color,
                              config.borderColor
                            )}
                          >
                            <RoleIcon className="h-3.5 w-3.5" />
                            {config.label}
                          </Badge>
                        </td>

                        {/* Created Date Column */}
                        <td className="py-4 px-6">
                          <div className="text-sm text-muted-foreground">
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                              : "N/A"}
                          </div>
                        </td>
                        {/* Actions Column */}
                        <td className="py-4 px-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onClick={() => handleViewUser(u)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {/* Dont show this for admin */}
                              {u?.role?.name?.toLowerCase() !== "admin" && (
                                <DropdownMenuItem
                                  onClick={() => handleChangePassword(u)}
                                >
                                  <Key className="h-4 w-4 mr-2" />
                                  Change Password
                                </DropdownMenuItem>
                              )}
                              {/* Edit and Delete only for Admin */}
                              {user?.role?.toLowerCase() === "admin" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleEditUser(u)}
                                  >
                                    <UserIcon className="h-4 w-4 mr-2" />
                                    Edit User
                                  </DropdownMenuItem>

                                  <DropdownMenuItem
                                    onClick={() => setUserToDelete(u.id)}
                                    disabled={u.id === user?.id}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Delete User
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SectionCard>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl border border-border bg-card shadow-xl">
          <DialogHeader className="border-b border-border pb-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 backdrop-blur-sm flex items-center justify-center border border-primary/20">
                <UserIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle
                  className="text-2xl font-light"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  User Details
                </DialogTitle>
                <DialogDescription className="text-sm font-light mt-0.5">
                  Complete information about this team member
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {viewUser && (
            <div className="space-y-6 pt-4">
              <div className="flex items-start gap-4">
                {(() => {
                  const roleName =
                    viewUser.role.name.toLowerCase() as keyof typeof userRoleConfig;
                  const config =
                    userRoleConfig[roleName] || userRoleConfig.viewer;
                  return (
                    <Avatar
                      className={cn("h-16 w-16 border-2", config.borderColor)}
                    >
                      <AvatarFallback
                        className={cn(
                          "text-xl font-semibold",
                          config.bgColor,
                          config.color
                        )}
                      >
                        {getInitials(viewUser.name)}
                      </AvatarFallback>
                    </Avatar>
                  );
                })()}
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-foreground">
                    {viewUser.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {viewUser.email}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Role
                  </Label>
                  <div>
                    {(() => {
                      const roleName =
                        viewUser.role.name.toLowerCase() as keyof typeof userRoleConfig;
                      const config =
                        userRoleConfig[roleName] || userRoleConfig.viewer;
                      return (
                        <StatusBadge
                          {...config}
                          className="text-base px-4 py-2 flex items-center gap-2"
                        />
                      );
                    })()}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Permissions
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const userPermissions = getPermissions(
                        viewUser.role.name as UserRole
                      );
                      return (
                        <>
                          {userPermissions?.canViewDashboard && (
                            <Badge variant="secondary" className="font-medium">
                              View Dashboard
                            </Badge>
                          )}
                          {userPermissions?.canManageLeads && (
                            <Badge variant="secondary" className="font-medium">
                              Manage Leads
                            </Badge>
                          )}
                          {userPermissions?.canManageCalls && (
                            <Badge variant="secondary" className="font-medium">
                              Manage Calls
                            </Badge>
                          )}
                          {userPermissions?.canManageMeetings && (
                            <Badge variant="secondary" className="font-medium">
                              Manage Meetings
                            </Badge>
                          )}
                          {userPermissions?.canViewReports && (
                            <Badge variant="secondary" className="font-medium">
                              View Reports
                            </Badge>
                          )}
                          {userPermissions?.canManageUsers && (
                            <Badge variant="secondary" className="font-medium">
                              Manage Users
                            </Badge>
                          )}
                          {userPermissions?.canManageStages && (
                            <Badge variant="secondary" className="font-medium">
                              Manage Stages
                            </Badge>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-border">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Account Status
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
                    <span className="text-sm font-medium text-foreground">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSuccess={handleModalSuccess}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setUserToChangePassword(null);
        }}
        user={userToChangePassword}
        onSuccess={handleModalSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!userToDelete}
        onOpenChange={() => setUserToDelete(null)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete User"
        variant="destructive"
      />
    </div>
  );
}
