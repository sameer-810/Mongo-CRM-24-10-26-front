"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createUser, updateUser, getAllRoles } from "@/lib/server-actions";
import type { User, Role } from "@/lib/types";
import {
  UserPlus,
  Eye,
  EyeOff,
  Check,
  Shield,
  Mail,
  Lock,
  User as UserIcon,
} from "lucide-react";
import { userRoleConfig } from "@/lib/badge-configs";
import { cn } from "@/lib/utils";
import { SITE } from "@/lib/site";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSuccess?: () => void;
}

const DOMAIN = `@${SITE.emailDomain}`;

export default function UserModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: UserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const isEditMode = !!user;

  // Fetch roles when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchRoles = async () => {
        setIsLoadingRoles(true);
        try {
          const result = await getAllRoles();
          if (result && Array.isArray(result)) {
            // Filter only active roles
            const activeRoles = result.filter(
              (role) => role.isActive !== false
            );
            setRoles(activeRoles);
          }
        } catch (error) {
          console.error("Failed to fetch roles:", error);
          toast({
            title: "Error",
            description: "Failed to load roles",
            variant: "destructive",
          });
        } finally {
          setIsLoadingRoles(false);
        }
      };
      fetchRoles();
    }
  }, [isOpen, toast]);

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      if (user) {
        // Extract username from email if it matches the domain
        const emailParts = user.email.split("@");
        const currentUsername =
          emailParts.length > 1 && "@" + emailParts[1] === DOMAIN
            ? emailParts[0]
            : user.email.split("@")[0]; // Fallback to just the user part even if domain differs, to allow editing

        setFormData({
          name: user.name,
          username: currentUsername,
          password: "", // Don't pre-fill password for edit
          role: user.role.toLowerCase(),
        });
      } else {
        setFormData({
          name: "",
          username: "",
          password: "",
          role: "",
        });
      }
      setShowPassword(false); // Reset password visibility
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure strict format
    const cleanUsername = formData.username.trim().toLowerCase();
    const fullEmail = `${cleanUsername}${DOMAIN}`;

    if (
      !formData.name ||
      !cleanUsername ||
      (!isEditMode && !formData.password) ||
      !formData.role
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isEditMode && user) {
        const updateData = {
          id: user.id,
          name: formData.name,
          email: fullEmail,
          role: formData.role,
        };

        const result = await updateUser(updateData);

        if (result) {
          toast({
            title: "Success",
            description: "User updated successfully!",
            variant: "default", // Using default which usually maps to success or standard
            // Note: If you have a specific 'success' variant in your toast, use it. Standard assumes default/destructive types.
          });
          onSuccess?.();
          onClose();
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update user",
            variant: "destructive",
          });
        }
      } else {
        const createData = {
          name: formData.name,
          email: fullEmail,
          password: formData.password,
          role: formData.role,
        };

        const result = await createUser(createData);

        if (result) {
          toast({
            title: "Success",
            description: "User created successfully!",
            variant: "default",
          });
          onSuccess?.();
          onClose();
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create user",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.username.trim() !== "" &&
    formData.role !== "" &&
    (isEditMode || formData.password.trim() !== "");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] border border-border bg-card shadow-2xl p-0 overflow-hidden gap-0 rounded-xl">
        <DialogHeader className="px-8 py-6 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm shrink-0">
              <UserPlus className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-medium tracking-tight">
                {isEditMode ? "Edit User Account" : "Add New User"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                {isEditMode
                  ? "Update user details and access permissions"
                  : "Create a new team member account with specific roles"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
          {/* Name Field */}
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-sm font-medium text-foreground flex items-center gap-2"
            >
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              disabled={isLoading}
              className="h-11 bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>

          {/* Email/Username Field */}
          <div className="space-y-2">
            <Label
              htmlFor="username"
              className="text-sm font-medium text-foreground flex items-center gap-2"
            >
              <Mail className="h-4 w-4 text-muted-foreground" />
              Email Address <span className="text-red-500">*</span>
            </Label>
            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-input focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary/20 bg-background items-center h-11 transition-all">
              <Input
                id="username"
                type="text"
                placeholder="username"
                value={formData.username}
                onChange={(e) => {
                  // Strict validation: Allow only letters, numbers, dots, underscores, hyphens
                  const val = e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9._-]/g, "");
                  setFormData({ ...formData, username: val });
                }}
                required
                disabled={isLoading}
                className="flex-1 border-0 bg-transparent py-0 pl-3 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 h-full rounded-l-md rounded-r-none font-medium text-left"
              />
              <div className="flex select-none items-center pr-3 pl-1 text-sm text-muted-foreground/80 font-medium h-full rounded-r-md bg-muted/20 border-l border-border/50">
                {DOMAIN}
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground pl-1">
              Only letters, numbers, and dots allowed. Domain is fixed.
            </p>
          </div>

          {/* Password Field (only for new users) */}
          {!isEditMode && (
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-foreground flex items-center gap-2"
              >
                <Lock className="h-4 w-4 text-muted-foreground" />
                Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  className="h-11 pr-10 bg-background focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground pl-1">
                Must be at least 8 characters long
              </p>
            </div>
          )}

          {/* Role Field */}
          <div className="space-y-2">
            <Label
              htmlFor="role"
              className="text-sm font-medium text-foreground flex items-center gap-2"
            >
              <Shield className="h-4 w-4 text-muted-foreground" />
              Role <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value as any })
              }
              disabled={isLoading || isLoadingRoles}
            >
              <SelectTrigger className="h-11 bg-background focus:ring-2 focus:ring-primary/20 transition-all">
                <SelectValue
                  placeholder={
                    isLoadingRoles ? "Loading roles..." : "Select Role"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {roles.length > 0
                  ? roles.map((role) => {
                    const roleKey =
                      role.name.toLowerCase() as keyof typeof userRoleConfig;
                    // Fallback to viewer if config not found, or use a default safe config
                    const config =
                      userRoleConfig[roleKey] || userRoleConfig.viewer;
                    const Icon = config.icon;

                    return (
                      <SelectItem
                        key={role.id}
                        value={role.name.toLowerCase()}
                        className={cn(
                          "cursor-pointer py-2.5 my-0.5 transition-all duration-200 ease-in-out",
                          "hover:bg-muted/80 dark:hover:bg-muted/40",
                          "focus:bg-muted/80 dark:focus:bg-muted/40",
                          "group"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              "font-semibold border flex items-center gap-1.5 px-2.5 py-0.5 transition-colors",
                              config.bgColor,
                              config.color,
                              config.borderColor,
                              "group-hover:opacity-100" // Ensure visibility
                            )}
                          >
                            <Icon className={cn("h-3 w-3", config.color)} />
                            {config.label}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })
                  : !isLoadingRoles && (
                    <SelectItem value="" disabled>
                      No roles available
                    </SelectItem>
                  )}
              </SelectContent>
            </Select>
          </div>
        </form>

        <DialogFooter className="px-8 py-5 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="h-10 px-6 border-border/60 hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !isFormValid}
            className="h-10 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                {isEditMode ? "Saving..." : "Creating..."}
              </span>
            ) : isEditMode ? (
              <span className="flex items-center gap-2">
                Save Changes <Check className="h-4 w-4" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Add User <UserPlus className="h-4 w-4" />
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// t
