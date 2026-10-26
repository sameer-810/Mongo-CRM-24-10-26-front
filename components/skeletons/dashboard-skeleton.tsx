import { PageHeaderSkeleton } from "./page-header-skeleton"
import { StatsCardSkeleton } from "./stats-card-skeleton"
import { SectionCardSkeleton } from "./section-card-skeleton"

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-6 md:p-8 max-w-[1600px] mx-auto">
      <PageHeaderSkeleton />
      
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCardSkeleton showChart chartHeight={320} />
        <SectionCardSkeleton showChart chartHeight={320} />
      </div>
      
      <SectionCardSkeleton rows={4} />
    </div>
  )
}
