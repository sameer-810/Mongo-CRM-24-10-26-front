import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function StatsCardSkeleton() {
  return (
    <Card className="relative overflow-hidden border border-border bg-card">
      <div className="absolute top-0 right-0 w-32 h-32 bg-muted/20 rounded-full blur-3xl" />
      
      <CardHeader className="flex flex-row items-center justify-between pb-3 space-y-0 relative">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </CardHeader>
      
      <CardContent className="pt-0 relative">
        <Skeleton className="h-3 w-32 mb-2" />
        <div className="flex items-center gap-2 pt-2 border-t border-border/50">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

