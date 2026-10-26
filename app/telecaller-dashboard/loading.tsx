import { PageHeaderSkeleton } from "@/components/skeletons/page-header-skeleton"
import { SectionCardSkeleton } from "@/components/skeletons/section-card-skeleton"

export default function TelecallerDashboardLoading() {
  return (
    <div className="space-y-8 p-6 md:p-8 max-w-[1600px] mx-auto">
      {/* Header Skeleton */}
      <PageHeaderSkeleton />

      {/* Coming Soon Section Skeleton */}
      <SectionCardSkeleton rows={1} />
    </div>
  )
}

