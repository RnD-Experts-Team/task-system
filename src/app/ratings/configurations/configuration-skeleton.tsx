import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ConfigurationFormSkeleton() {
  return (
    <div className="flex w-full justify-center p-4 md:p-8 animate-pulse text-left">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="size-10 rounded-md" />
          <div className="flex flex-col gap-2 w-full max-w-sm">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>

        {/* Basic Information Card Skeleton */}
        <Card>
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center gap-2">
               <Skeleton className="size-5 rounded-md" />
               <Skeleton className="h-5 w-32" />
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-4">
             <div className="space-y-2">
                 <Skeleton className="h-4 w-20" />
                 <Skeleton className="h-11 w-full" />
             </div>
             <div className="space-y-2">
                 <Skeleton className="h-4 w-20" />
                 <Skeleton className="h-24 w-full" />
             </div>
             <div className="space-y-2">
                 <Skeleton className="h-4 w-20" />
                 <Skeleton className="h-11 w-full" />
             </div>
          </CardContent>
        </Card>

        {/* Rating Fields Card Skeleton */}
        <Card>
           <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-2">
                 <Skeleton className="size-5 rounded-md" />
                 <Skeleton className="h-5 w-32" />
              </div>
           </CardHeader>
           <CardContent className="space-y-4 pt-4">
              <Skeleton className="h-4 w-64 mb-4" />
              
              <div className="grid gap-4 md:grid-cols-[1fr_2fr_120px_auto] items-start p-4">
                  <div className="space-y-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                  </div>
              </div>
           </CardContent>
        </Card>
        
        {/* Footer Skeleton */}
        <div className="flex justify-end gap-3 pb-4 pt-4 border-t">
           <Skeleton className="h-10 w-24" />
           <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </div>
  )
}
