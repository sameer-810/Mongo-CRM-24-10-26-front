import { Skeleton } from "@/components/ui/skeleton"

export function PageHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-12 w-96" />
          <Skeleton className="h-5 w-[500px]" />
        </div>
        <Skeleton className="h-11 w-40" />
      </div>
      <Skeleton className="h-px w-full" />
    </div>
  )
}

