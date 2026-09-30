import { cn } from "@/lib/utils"
import { cardClass, containerClass } from "../../lib/ui"

export function Skel({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("rounded-md bg-muted motion-safe:animate-pulse", className)} />
}

export function PostCardSkeleton() {
  return (
    <div className={cn(cardClass, "flex gap-4 p-4 sm:p-5")}>
      <Skel className="h-16 w-14 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-3 pt-1">
        <Skel className="h-5 w-3/4" />
        <Skel className="h-4 w-full" />
        <div className="flex gap-2 pt-1">
          <Skel className="h-5 w-20 rounded-full" />
          <Skel className="h-5 w-12" />
        </div>
      </div>
    </div>
  )
}

export function FeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading" className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div role="status" aria-label="Loading" className={cn(containerClass, "space-y-6 py-10")}>
      <Skel className="h-9 w-2/3 max-w-md" />
      <Skel className="h-5 w-1/2 max-w-sm" />
      <div className="space-y-3 pt-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    </div>
  )
}

export function RoadmapSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }, (_, c) => (
        <div key={c} className="space-y-3">
          <Skel className="h-6 w-32" />
          {Array.from({ length: 3 }, (_, i) => (
            <Skel key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function PostDetailSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-5">
        <Skel className="h-5 w-24" />
        <Skel className="h-9 w-4/5" />
        <Skel className="h-5 w-40" />
        <Skel className="h-32 w-full rounded-xl" />
      </div>
      <Skel className="hidden h-48 rounded-xl lg:block" />
    </div>
  )
}

export function ChangelogSkeleton() {
  return (
    <div role="status" aria-label="Loading" className="space-y-8">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="space-y-3">
          <Skel className="h-4 w-24" />
          <Skel className="h-7 w-2/3" />
          <Skel className="h-4 w-full" />
        </div>
      ))}
    </div>
  )
}
