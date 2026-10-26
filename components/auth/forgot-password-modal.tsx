"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";
import { forgotPassword } from "@/lib/server-actions";

interface ForgotPasswordModalProps {
  children: React.ReactNode;
}

export function ForgotPasswordModal({ children }: ForgotPasswordModalProps) {
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const { toast } = useToast();

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsForgotPasswordLoading(true);

    try {
      const result = await forgotPassword(forgotPasswordEmail);

      if (!result || (result as any)?.success === false) {
        throw new Error(
          (result as any)?.message || "Failed to send password reset email"
        );
      }

      setIsForgotPasswordOpen(false);
      setForgotPasswordEmail("");
      toast({
        title: "Password Reset Email Sent",
        description:
          (result as any)?.message ||
          `If an account with ${forgotPasswordEmail} exists, you will receive a password reset link shortly.`,
        variant: "default",
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  return (
    <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you a link to reset your
            password.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="forgot-email">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="forgot-email"
                type="email"
                placeholder="name@company.com"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isForgotPasswordLoading) {
                    handleForgotPassword();
                  }
                }}
                className="pl-10"
                required
                disabled={isForgotPasswordLoading}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsForgotPasswordOpen(false)}
              disabled={isForgotPasswordLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleForgotPassword}
              disabled={isForgotPasswordLoading || !forgotPasswordEmail}
            >
              {isForgotPasswordLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
