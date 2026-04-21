import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function TaskRatingFormSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 w-full max-w-4xl mx-auto animate-pulse">
      {/* Header Placeholder */}
      <div className="flex items-center gap-4">
         <Skeleton className="size-10 rounded-md" />
         <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
         </div>
      </div>
      
      <Card className="mt-4">
        <div className="p-6 border-b">
           <Skeleton className="h-6 w-32 mb-2" />
           <Skeleton className="h-4 w-full max-w-lg mb-1" />
           <Skeleton className="h-4 w-3/4 max-w-sm" />
        </div>
        <CardContent className="space-y-6 pt-6">
           <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                 <Skeleton className="h-4 w-24" />
                 <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-3">
                 <Skeleton className="h-4 w-24" />
                 <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-3">
                 <Skeleton className="h-4 w-24" />
                 <Skeleton className="h-10 w-full" />
              </div>
           </div>
           
           <div className="space-y-3 pt-4 border-t">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-24 w-full" />
           </div>
           
           <div className="flex justify-end gap-3 pt-6">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
           </div>
        </CardContent>
      </Card>
    </div>
  )
}
