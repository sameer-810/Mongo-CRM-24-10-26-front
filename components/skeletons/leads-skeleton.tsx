import { PageHeaderSkeleton } from "./page-header-skeleton"
import { StatsCardSkeleton } from "./stats-card-skeleton"
import { TableSkeleton } from "./table-skeleton"

export function LeadsSkeleton() {
  return (
    <div className="space-y-8 p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* <PageHeaderSkeleton />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div> */}
      <TableSkeleton rows={10} columns={8} />
    </div>
  )
}
