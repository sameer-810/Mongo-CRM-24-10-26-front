import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionCardProps {
  title: string
  description: string
  icon: LucideIcon
  iconColor?: "primary" | "success" | "error" | "info" | "warning"
  action?: ReactNode
  children: ReactNode
  className?: string
}

const iconColorConfig = {
  primary: "bg-primary/10 border-primary/20 text-primary",
  success: "bg-success/10 border-success/20 text-success",
  error: "bg-error/10 border-error/20 text-error",
  info: "bg-info/10 border-info/20 text-info",
  warning: "bg-warning/10 border-warning/20 text-warning",
}

export function SectionCard({
  title,
  description,
  icon: Icon,
  iconColor = "primary",
  action,
  children,
  className,
}: SectionCardProps) {
  return (
    <Card className={cn("border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-300", className)}>
      <CardHeader className="border-b border-border pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-lg backdrop-blur-sm flex items-center justify-center border",
              iconColorConfig[iconColor]
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">{title}</CardTitle>
              <CardDescription className="text-sm font-light mt-0.5">
                {description}
              </CardDescription>
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {children}
      </CardContent>
    </Card>
  )
}

