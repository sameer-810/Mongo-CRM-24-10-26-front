"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ResetPasswordModal } from "@/components/auth/reset-password-modal";
import { useToast } from "@/hooks/use-toast";
import { Building2, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null); // null = checking, true = valid, false = invalid
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const tokenParam = searchParams.get("token");

    if (!tokenParam) {
      setIsValidToken(false);
      setIsChecking(false);
      toast({
        title: "Invalid Reset Link",
        description:
          "No reset token found in the URL. Please request a new password reset.",
        variant: "destructive",
      });
      return;
    }

    setToken(tokenParam);
    setIsValidToken(true);
    setIsModalOpen(true);
    setIsChecking(false);
  }, [searchParams, toast]);

  const handleSuccess = () => {
    setIsModalOpen(false);
  };

  // Show loading state while checking for token
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">CRM Pro</span>
          </div>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  // Show error state if token is invalid
  if (isValidToken === false || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">CRM Pro</span>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Invalid Reset Link</AlertTitle>
            <AlertDescription>
              The password reset link is invalid or has expired. Please request
              a new password reset link.
            </AlertDescription>
          </Alert>

          <div className="flex justify-center">
            <button
              onClick={() => router.push("/login")}
              className="text-primary hover:underline"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show reset password form if token is valid
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Building2 className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">CRM Pro</span>
        </div>

        {token && (
          <ResetPasswordModal
            isOpen={isModalOpen}
            token={token}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background p-8">
          <div className="w-full max-w-md space-y-6">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                CRM Pro
              </span>
            </div>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
