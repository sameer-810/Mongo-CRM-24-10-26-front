import { PageHeaderSkeleton } from "./page-header-skeleton"
import { StatsCardSkeleton } from "./stats-card-skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function UsersSkeleton() {
  return (
    <div className="space-y-8 p-6 md:p-8 max-w-[1600px] mx-auto">
      <PageHeaderSkeleton />
      
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
      
      <Card className="border border-border bg-card shadow-sm">
        <div className="border-b border-border p-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-64" />
            </div>
          </div>
        </div>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-14 w-14 rounded-full" />
                    <div className="flex-1 space-y-3">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                      <Skeleton className="h-6 w-24 rounded-md" />
                      <div className="flex flex-wrap gap-1.5">
                        <Skeleton className="h-5 w-16 rounded-sm" />
                        <Skeleton className="h-5 w-14 rounded-sm" />
                        <Skeleton className="h-5 w-18 rounded-sm" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
