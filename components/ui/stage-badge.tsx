// import { Badge } from "@/components/ui/badge"
//  import type { LeadStage } from "@/lib/types"
// import { cn } from "@/lib/utils"

// interface StageBadgeProps {
//   stage: LeadStage
//   showIcon?: boolean
//   className?: string
// }

// export function StageBadge({ stage, showIcon = false, className }: StageBadgeProps) {
//   const config = stageConfig[stage]
//   const Icon = config.icon

//   return (
//     <Badge
//       variant="outline"
//       className={cn("gap-1.5 font-medium", config.bgColor, config.color, config.borderColor, className)}
//     >
//       {showIcon && <Icon className="h-3.5 w-3.5" />}
//       {config.label}
//     </Badge>
//   )
// }
