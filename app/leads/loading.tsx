import { PageHeaderSkeleton } from "@/components/skeletons/page-header-skeleton"
import { StatsCardSkeleton } from "@/components/skeletons/stats-card-skeleton"
import { TableSkeleton } from "@/components/skeletons/table-skeleton"

export default function LeadsLoading() {
  return (
    <div className="space-y-8 p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header Skeleton */}
      <PageHeaderSkeleton />

      {/* Stats Grid Skeleton */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Table Skeleton */}
      <TableSkeleton rows={10} columns={8} />
    </div>
  )
}
