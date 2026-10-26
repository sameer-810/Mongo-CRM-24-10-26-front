import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface SectionCardSkeletonProps {
  rows?: number
  showChart?: boolean
  chartHeight?: number
}

export function SectionCardSkeleton({ 
  rows = 3, 
  showChart = false, 
  chartHeight = 320 
}: SectionCardSkeletonProps) {
  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardHeader className="border-b border-border pb-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {showChart ? (
          <Skeleton className={`w-full h-[${chartHeight}px]`} />
        ) : (
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="p-4 border border-border rounded-lg">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

