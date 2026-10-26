import { PageHeaderSkeleton } from "@/components/skeletons/page-header-skeleton"
import { StatsCardSkeleton } from "@/components/skeletons/stats-card-skeleton"
import { SectionCardSkeleton } from "@/components/skeletons/section-card-skeleton"

export default function CallsLoading() {
  return (
    <div className="space-y-8 p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header Skeleton with Search */}
      <PageHeaderSkeleton />

      {/* Stats Grid Skeleton */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Call Sections Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCardSkeleton rows={5} />
        <SectionCardSkeleton rows={5} />
      </div>

      {/* Recent Call Logs Skeleton */}
      <SectionCardSkeleton rows={10} />
    </div>
  )
}
