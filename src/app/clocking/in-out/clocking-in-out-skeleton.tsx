import { Skeleton } from "@/components/ui/skeleton"

export function ClockingInOutSkeleton() {
  return (
    <div className="w-full rounded-3xl border border-border/50 bg-card/60 p-6 backdrop-blur-xl transition-all sm:p-8 lg:p-10 animate-pulse">
      {/* Stats Row Skeleton */}
      <div className="mb-8 grid grid-cols-3 gap-4 border-b border-border/20 pb-8 sm:gap-8">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 sm:h-8 w-24" />
        </div>
        <div className="flex flex-col items-center gap-2 border-x border-border/20">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 sm:h-8 w-24" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 sm:h-8 w-12" />
        </div>
      </div>

      {/* Action Area Skeleton */}
      <div className="flex flex-col items-center gap-6">
         <Skeleton className="size-24 sm:size-32 rounded-full" />
         <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
            <Skeleton className="h-4 w-32" />
         </div>
      </div>
    </div>
  )
}
