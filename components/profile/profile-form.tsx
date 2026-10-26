"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { updateUserPassword } from "@/lib/server-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  Mail,
  User,
  Key,
  Check,
  LucideIcon,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { userRoleConfig } from "@/lib/badge-configs";
import { cn } from "@/lib/utils";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface ProfileFormProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
    isPasswordChanged: boolean;
    id: string;
  };
}

// Role-based permissions map
const rolePermissions: Record<string, string[]> = {
  admin: [
    "Full System Access",
    "User Management",
    "Lead Management",
    "Reports & Analytics",
    "Settings Configuration",
  ],
  manager: [
    "Team Management",
    "Lead Management",
    "Reports Access",
    "Meeting Management",
  ],
  advisor: ["Lead Management", "Meeting Management", "Client Communication"],
  telecaller: ["Lead Calling", "Basic Lead Updates", "Call Logging"],
  processing: ["Dashboard Access", "Document Processing", "Status Updates"],
  sales: [
    "Lead Management",
    "Sales Pipeline",
    "Client Communication",
    "Meeting Management",
  ],
};

export function ProfileForm({ user }: ProfileFormProps) {
  console.log(user, "user");

  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  // Get role configuration
  const roleKey = user.role?.toLowerCase() as keyof typeof userRoleConfig;
  const roleConfig = userRoleConfig[roleKey] || userRoleConfig.telecaller;
  const RoleIcon = roleConfig.icon;
  const permissions = rolePermissions[roleKey] || [];

  // Admin should not see this page, but as a safeguard
  if (user.role === "Admin") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          Administrators do not have a profile page.
        </AlertDescription>
      </Alert>
    );
  }

  const onSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);

    try {
      await updateUserPassword(user.id, data.password);

      toast({
        title: "Password Updated",
        description:
          "Your password has been changed successfully. Redirecting to login...",
        variant: "success",
      });

      // Sign out and redirect to login
      await signOut({ callbackUrl: "/login" });
    } catch (err: any) {
      toast({
        title: "Error",
        description:
          err.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Password Change Alert - Only shown if required */}
      {!user.isPasswordChanged && (
        <Alert
          variant="destructive"
          className="mb-6 border-2 border-red-500 bg-red-50 dark:bg-red-950/20"
        >
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-700 dark:text-red-300 font-bold text-base">
            Action Required
          </AlertTitle>
          <AlertDescription className="text-red-600 dark:text-red-400">
            You must change your password before you can access the Platform.
          </AlertDescription>
        </Alert>
      )}

      {/* Hero Section with Role-Based Gradient */}
      <Card
        className={cn("mb-6 overflow-hidden border-2", roleConfig.borderColor)}
      >
        <div className={cn("h-32 relative", roleConfig.bgColor)}>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/10" />
          <div
            className={cn(
              "absolute -bottom-16 left-8 p-1 rounded-full bg-background shadow-xl"
            )}
          >
            <Avatar className="h-28 w-28 border-4 border-background">
              <AvatarImage src={user.image || ""} alt={user.name || "User"} />
              <AvatarFallback
                className={cn(
                  "text-4xl font-bold",
                  roleConfig.color,
                  roleConfig.bgColor
                )}
              >
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        <CardContent className="pt-20 pb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight">
                  {user.name}
                </h1>
                <Badge
                  className={cn(
                    "text-sm font-semibold px-3 py-1",
                    roleConfig.bgColor,
                    roleConfig.color,
                    roleConfig.borderColor,
                    "border"
                  )}
                >
                  <RoleIcon className="h-4 w-4 mr-1.5" />
                  {roleConfig.label}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <p className="text-sm">{user.email}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {roleConfig.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Details Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className={cn("h-5 w-5", roleConfig.color)} />
                <CardTitle>Profile Information</CardTitle>
              </div>
              <CardDescription>
                Your personal details and account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Full Name
                  </Label>
                  <p className="text-sm font-medium">{user.name}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Email Address
                  </Label>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    Role
                  </Label>
                  <div className="flex items-center gap-2">
                    <RoleIcon className={cn("h-4 w-4", roleConfig.color)} />
                    <p className={cn("text-sm font-medium", roleConfig.color)}>
                      {roleConfig.label}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    User ID
                  </Label>
                  <p className="text-sm font-mono text-muted-foreground">
                    {user.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Change Card */}
          <Card
            className={
              !user.isPasswordChanged ? cn("border-2", "border-red-500") : ""
            }
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <Key
                  className={cn(
                    "h-5 w-5",
                    !user.isPasswordChanged ? "text-red-500" : roleConfig.color
                  )}
                />
                <CardTitle>Security Settings</CardTitle>
              </div>
              <CardDescription>
                {user.isPasswordChanged
                  ? "Update your password to keep your account secure"
                  : "Please set a new password to continue using the platform"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-sm font-medium">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      {...register("password")}
                      placeholder="Enter new password"
                      className={cn(
                        "pr-10 transition-all",
                        errors.password
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 font-medium mt-1.5">
                      {errors.password.message}
                    </p>
                  )}
                  <div className="mt-3 p-3 rounded-lg bg-muted/50 space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      Password Requirements:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 text-green-500" />
                        <span>Minimum 8 characters</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 text-green-500" />
                        <span>One uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 text-green-500" />
                        <span>One number</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 text-green-500" />
                        <span>One special character</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="confirm-password"
                    className="text-sm font-medium"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      {...register("confirmPassword")}
                      placeholder="Confirm new password"
                      className={cn(
                        "pr-10 transition-all",
                        errors.confirmPassword
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      )}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 font-medium mt-1.5">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "w-full sm:w-auto mt-4 font-medium hover:bg-accent-foreground",
                    roleConfig.bgColor,
                    roleConfig.color
                  )}
                  size="lg"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Key className="mr-2 h-4 w-4" />
                  Update Password & Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Role Info & Permissions */}
        <div className="space-y-6">
          {/* Role Overview Card */}
          <Card className={cn("border-2", roleConfig.borderColor)}>
            <CardHeader className={cn("pb-4", roleConfig.bgColor)}>
              <div className="flex items-center gap-3">
                <div
                  className={cn("p-2 rounded-lg bg-background/80 shadow-sm")}
                >
                  <RoleIcon className={cn("h-6 w-6", roleConfig.color)} />
                </div>
                <div>
                  <CardTitle className="text-lg">Your Role</CardTitle>
                  <CardDescription className="text-xs">
                    {roleConfig.label}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {roleConfig.description}
                </p>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className={cn("h-4 w-4", roleConfig.color)} />
                  <h4 className="text-sm font-semibold">Access Permissions</h4>
                </div>
                <ul className="space-y-2">
                  {permissions.map((permission, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check
                        className={cn(
                          "h-4 w-4 mt-0.5 flex-shrink-0",
                          roleConfig.color
                        )}
                      />
                      <span className="text-muted-foreground">
                        {permission}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Account Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Security Status</span>
                </div>
                <Badge
                  variant={user.isPasswordChanged ? "default" : "destructive"}
                  className="text-xs"
                >
                  {user.isPasswordChanged ? "Secure" : "Action Required"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Account Type</span>
                </div>
                <Badge
                  className={cn(
                    "text-xs",
                    roleConfig.bgColor,
                    roleConfig.color,
                    "border",
                    roleConfig.borderColor
                  )}
                >
                  {roleConfig.label}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
