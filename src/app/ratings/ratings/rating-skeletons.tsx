import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function RatingGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="transition-all hover:shadow-md p-4">
          <div className="flex items-start justify-between gap-2 pb-3">
            <div className="flex flex-col gap-2 min-w-0 w-full">
               <Skeleton className="h-5 w-3/4" />
               <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-5 w-16 px-2 rounded-full flex-shrink-0" />
          </div>
          <div className="flex flex-col gap-3 pt-0">
             <Skeleton className="h-3 w-full" />
             <Skeleton className="h-3 w-5/6" />
             
             <div className="flex items-center gap-3 mt-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
             </div>
             
             <div className="flex items-center gap-2 mt-4">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="size-6 rounded-full" />
             </div>
             
             <Skeleton className="h-8 w-full mt-2" />
          </div>
        </Card>
      ))}
    </div>
  )
}
