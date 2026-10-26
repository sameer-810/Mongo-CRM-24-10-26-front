import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type ColorClass = "primary" | "success" | "error" | "info" | "warning";

// interface TrendData {
//   value?: string;
//   label?: string;
//   isPositive: boolean;
//   icon: LucideIcon;
// }

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  // trend?: TrendData;
  colorClass?: ColorClass;
}

const colorConfig = {
  primary: {
    icon: "bg-primary/10 border-primary/20 text-primary",
    glow: "bg-primary/5 group-hover:bg-primary/10",
    border: "hover:border-primary/30",
  },
  success: {
    icon: "bg-success/10 border-success/20 text-success",
    glow: "bg-success/5 group-hover:bg-success/10",
    border: "hover:border-success/30",
  },
  error: {
    icon: "bg-error/10 border-error/20 text-error",
    glow: "bg-error/5 group-hover:bg-error/10",
    border: "hover:border-error/30",
  },
  info: {
    icon: "bg-info/10 border-info/20 text-info",
    glow: "bg-info/5 group-hover:bg-info/10",
    border: "hover:border-info/30",
  },
  warning: {
    icon: "bg-warning/10 border-warning/20 text-warning",
    glow: "bg-warning/5 group-hover:bg-warning/10",
    border: "hover:border-warning/30",
  },
};

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  colorClass = "primary",
}: StatsCardProps) {
  const colors = colorConfig[colorClass];

  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-border bg-card transition-all duration-300 hover:shadow-lg group gap-4 py-4",
        colors.border
      )}
    >
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl transition-colors duration-500",
          colors.glow
        )}
      />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 relative">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground tracking-wide">
            {title}
          </CardTitle>
          <div
            className="text-3xl font-light text-foreground"
            style={{ fontFamily: "monospace" }}
          >
            {value}
          </div>
        </div>
        <div
          className={cn(
            "h-12 w-12 rounded-xl backdrop-blur-sm flex items-center justify-center border transition-all",
            colors.icon,
            "group-hover:scale-105"
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </CardHeader>

      <CardContent className="pt-0 relative">
        {description && (
          <p className="text-xs text-muted-foreground font-light">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
