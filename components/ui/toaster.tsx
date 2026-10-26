"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  CircleAlert,
} from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  const getIcon = (variant?: string | null) => {
    switch (variant) {
      case "success":
        return (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-success/10 shrink-0">
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
        );
      case "error":
      case "destructive":
        return (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-error/10 shrink-0">
            <XCircle className="h-5 w-5 text-error" />
          </div>
        );
      case "warning":
        return (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-warning/10 shrink-0">
            <AlertCircle className="h-5 w-5 text-warning" />
          </div>
        );
      case "info":
        return (
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-info/10 shrink-0">
            <Info className="h-5 w-5 text-info" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ToastProvider duration={5000}>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        ...props
      }) {
        const icon = getIcon(variant);
        return (
          <Toast key={id} variant={variant} duration={5000} {...props}>
            <div className="flex items-center gap-4 flex-1 mb-1">
              {icon && icon}
              <div className="grid gap-0.5 flex-1 min-w-0">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
