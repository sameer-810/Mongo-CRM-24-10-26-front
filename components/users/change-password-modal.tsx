"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { updateUserPassword } from "@/lib/server-actions";
import { Eye, EyeOff, Lock, Key, Check } from "lucide-react";
import type { UsersResponse } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UsersResponse | null;
  onSuccess?: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: ChangePasswordModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    reset,
  } = form;

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setShowPassword(false);
      setShowConfirmPassword(false);
      onClose();
    }
  };

  const onSubmit = async (data: PasswordFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "No user selected",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateUserPassword(user.id, data.password);

      if (result !== null && result !== undefined) {
        toast({
          title: "Success",
          description: `Password has been changed successfully for ${user.name}`,
          variant: "success",
        });
        onSuccess?.();
        handleClose();
      } else {
        toast({
          title: "Error",
          description: "Failed to update password",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] border border-border bg-card shadow-2xl p-0 overflow-hidden gap-0 rounded-xl">
        <DialogHeader className="px-8 py-6 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm shrink-0">
              <Key className="h-7 w-7 text-primary" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-medium tracking-tight">
                Change Password
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                {user
                  ? `Update password for ${user.name}`
                  : "Update user password"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-5">
          {/* New Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-foreground flex items-center gap-2"
            >
              <Lock className="h-4 w-4 text-muted-foreground" />
              New Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                {...register("password")}
                disabled={isLoading}
                className={cn(
                  "h-11 pr-10 bg-background focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm",
                  errors.password
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                )}
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

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-foreground flex items-center gap-2"
            >
              <Lock className="h-4 w-4 text-muted-foreground" />
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                {...register("confirmPassword")}
                disabled={isLoading}
                className={cn(
                  "h-11 pr-10 bg-background focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm",
                  errors.confirmPassword
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 font-medium mt-1.5">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <DialogFooter className="px-0 py-0 border-t border-border bg-muted/20 flex items-center justify-end gap-3 mt-6 pt-5">
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
              type="submit"
              disabled={isLoading}
              className="h-10 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Updating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Update Password <Key className="h-4 w-4" />
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
