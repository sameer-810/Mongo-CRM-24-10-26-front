import { Badge } from "@/components/ui/badge"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  label: string
  color: string
  bgColor: string
  borderColor: string
  icon?: LucideIcon
  showIcon?: boolean
  className?: string
}

export function StatusBadge({
  label,
  color,
  bgColor,
  borderColor,
  icon: Icon,
  showIcon = true,
  className,
}: StatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "font-semibold border",
        bgColor,
        color,
        borderColor,
        className
      )}
    >
      {Icon && showIcon && <Icon className="h-3 w-3 mr-1" />}
      {label}
    </Badge>
  )
}

