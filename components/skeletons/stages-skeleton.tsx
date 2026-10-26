import { PageHeaderSkeleton } from "./page-header-skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function StagesSkeleton() {
  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8 max-w-[1600px] mx-auto">
      <PageHeaderSkeleton />
      
      {/* 8 mini stage cards */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="border border-border bg-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-muted/20 rounded-full blur-2xl" />
            <CardContent className="p-3 sm:p-6 relative">
              <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg mb-2" />
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-7 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Stage detail cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="border border-border bg-card shadow-sm">
            <div className="border-b border-border p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
                <Skeleton className="h-8 w-12 rounded-md" />
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-8 w-full mt-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

