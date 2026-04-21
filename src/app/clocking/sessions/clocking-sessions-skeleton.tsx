import { Skeleton } from "@/components/ui/skeleton"

export function ClockingSessionsGridSkeleton() {
  return (
    <div className="animate-pulse w-full">
       <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-4">
             <Skeleton className="h-3 w-16" />
             <Skeleton className="h-3 w-16" />
          </div>
       </div>

       <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="group relative overflow-hidden rounded-2xl bg-card/60 p-4 transition-all duration-300 sm:p-5 border border-border/10">
              {/* Top row */}
              <div className="mb-3 flex items-start justify-between sm:mb-4">
                <div className="relative">
                  <Skeleton className="size-10 rounded-xl sm:size-12" />
                  <Skeleton className="absolute -bottom-1 -right-1 size-3.5 rounded-full border-4 border-card sm:size-4" />
                </div>
                <Skeleton className="h-3 w-16 rounded-md" />
              </div>

              {/* Names header */}
              <div className="mb-4">
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-4 rounded-xl bg-background/50 p-2.5 sm:p-3">
                <div className="flex-1">
                  <Skeleton className="h-3 w-10 mb-1" />
                  <Skeleton className="h-4 w-full" />
                </div>
                <div className="h-8 w-px bg-border/40" />
                <div className="flex-1 text-right">
                  <Skeleton className="h-3 w-10 mb-1 ml-auto" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          ))}
       </div>
    </div>
  )
}
