// import { Badge } from "@/components/ui/badge"
// import { statusConfig } from "@/lib/config/status-config"
// import type { LeadStatus } from "@/lib/types"
// import { cn } from "@/lib/utils"

// interface StatusBadgeProps {
//   status: LeadStatus
//   showIcon?: boolean
//   className?: string
// }

// export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
//   const config = statusConfig[status]
//   const Icon = config.icon

//   return (
//     <Badge
//       variant="outline"
//       className={cn("gap-1.5 font-medium", config.bgColor, config.textColor, config.borderColor, className)}
//     >
//       {showIcon && <Icon className="h-3.5 w-3.5" />}
//       {config.label}
//     </Badge>
//   )
// }
