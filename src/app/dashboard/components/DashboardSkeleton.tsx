/**
 * DashboardSkeleton.tsx
 *
 * One file that exports a skeleton variant for every dashboard section.
 * Each skeleton mirrors the pixel layout of its real counterpart so the
 * page never "jumps" when data arrives.
 *
 * Used by:  src/app/dashboard/page.tsx
 */

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// ─── Stat Cards (row of 4) ────────────────────────────────────────────────────

/** Mirrors StatCard — TiltCard wrapper + label/value/icon layout */
export function StatCardSkeleton({ highlight }: { highlight?: boolean }) {
  return (
    <div
      className={cn(
        "glass-glow border rounded-xl p-6 sm:p-8 flex flex-col gap-2",
        highlight && "border-primary/20",
      )}
    >
      {/* label */}
      <Skeleton className="h-3 w-24" />
      {/* value */}
      <Skeleton className="h-10 w-32 mt-1" />
      {/* icon badge */}
      <Skeleton className="mt-3 h-9 w-9 rounded-xl" />
    </div>
  )
}

/** Row of 4 stat card skeletons, responsive grid matches page.tsx */
export function StatCardRowSkeleton() {
  return (
    <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton highlight />
    </section>
  )
}

// ─── Team Carousel ────────────────────────────────────────────────────────────

/** Mirrors TeamCarousel: heading + controls + cards strip + dot nav */
export function TeamCarouselSkeleton() {
  return (
    <section className="space-y-3">
      {/* heading row */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="h-4 w-14" />
      </div>

      {/* carousel strip — show 3 card placeholders */}
      <div className="flex items-center gap-2">
        {/* prev button */}
        <Skeleton className="hidden sm:block size-8 rounded-full shrink-0" />

        <div className="flex flex-1 gap-3 overflow-hidden px-4 py-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                "glass-panel flex-1 min-w-0 flex flex-col items-center gap-3 rounded-2xl border border-border/20 p-4",
                i !== 1 && "opacity-50 scale-95",
              )}
            >
              {/* avatar */}
              <Skeleton className="size-14 rounded-full" />
              {/* name */}
              <Skeleton className="h-4 w-24" />
              {/* role */}
              <Skeleton className="h-3 w-20" />
              {/* badge */}
              <Skeleton className="h-5 w-16 rounded-full" />
              {/* email */}
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>

        {/* next button */}
        <Skeleton className="hidden sm:block size-8 rounded-full shrink-0" />
      </div>

      {/* dot navigation */}
      <div className="flex justify-center gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className={cn("h-1 rounded-full", i === 0 ? "w-5" : "w-1")} />
        ))}
      </div>
    </section>
  )
}

// ─── Project Status Chart ─────────────────────────────────────────────────────

/** Mirrors ProjectStatusChart: card + donut + legend */
export function ProjectStatusChartSkeleton() {
  return (
    <Card className="glass-glow border flex flex-col min-h-0">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-44" />
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center gap-8 min-h-0 pb-6">
        {/* donut placeholder */}
        <Skeleton className="size-36 sm:size-44 rounded-full shrink-0" />

        {/* legend items */}
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Task Velocity Chart ──────────────────────────────────────────────────────

/** Mirrors TaskVelocityChart: card + bar chart area */
export function TaskVelocityChartSkeleton() {
  return (
    <Card className="glass-glow border min-h-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        {/* bar chart area: axis labels + bars */}
        <div className="flex flex-col gap-2">
          <div className="flex items-end gap-3 h-40 px-2">
            {[0.6, 0.9, 0.5, 0.75, 1, 0.45].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                <Skeleton
                  className="w-full rounded-t-md"
                  style={{ height: `${h * 100}%` }}
                />
              </div>
            ))}
          </div>
          {/* x-axis labels */}
          <div className="flex gap-3 px-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="flex-1 h-2.5 rounded" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Help Request Item ────────────────────────────────────────────────────────

/** Single row — mirrors HelpRequestItem */
function HelpRequestItemSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-xl p-4">
      <div className="flex items-center gap-3">
        {/* icon circle */}
        <Skeleton className="size-9 rounded-full shrink-0" />
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-44" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="size-4 rounded shrink-0" />
    </div>
  )
}

/** Card with tabs header + 3 rows of help request items */
export function HelpRequestCardSkeleton() {
  return (
    <Card className="glass-glow border overflow-hidden min-w-0">
      {/* tabs header */}
      <div className="border-b border-border/40 flex">
        <Skeleton className="flex-1 h-12 rounded-none" />
        <Skeleton className="flex-1 h-12 rounded-none" />
      </div>
      {/* list rows */}
      <div className="p-4 space-y-1">
        <HelpRequestItemSkeleton />
        <HelpRequestItemSkeleton />
        <HelpRequestItemSkeleton />
      </div>
    </Card>
  )
}

// ─── Deadline Item ────────────────────────────────────────────────────────────

/** Single deadline row — mirrors DeadlineItem */
function DeadlineItemSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-r-xl border-l-[3px] border-border p-4">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-4 w-14 rounded" />
      </div>
      <div className="flex items-center gap-1.5">
        <Skeleton className="size-3 rounded" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  )
}

/** Critical Deadlines card — mirrors the real card */
export function DeadlineCardSkeleton() {
  return (
    <Card className="glass-glow border w-full lg:w-80 min-w-0">
      <CardHeader>
        <Skeleton className="h-4 w-36" />
      </CardHeader>
      <CardContent className="space-y-3">
        <DeadlineItemSkeleton />
        <DeadlineItemSkeleton />
        <DeadlineItemSkeleton />
      </CardContent>
    </Card>
  )
}

// ─── Right Overview Panel (aside) ────────────────────────────────────────────

/** Mirrors the aside variant of RightOverviewPanel */
export function RightOverviewPanelSkeleton() {
  return (
    <aside className="flex flex-col w-full md:w-72 lg:w-80 md:shrink-0 border-t md:border-t-0 md:border-l border-border/20 overflow-y-auto min-w-0">
      <div className="flex flex-col gap-5 p-5 flex-1 min-h-0">
        {/* user profile card */}
        <Card className="glass-panel border-border/20 shadow-none">
          <CardContent className="p-5 flex flex-col items-center text-center gap-3">
            <Skeleton className="size-20 rounded-full" />
            <div className="space-y-2 w-full flex flex-col items-center">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="size-8 rounded-full" />
            </div>
          </CardContent>
        </Card>

        {/* stat rows */}
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl glass-panel border border-border/10"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-xl shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-2.5 w-14" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="size-3.5 rounded" />
            </div>
          ))}
        </div>

        {/* separator */}
        <Skeleton className="h-px w-full" />

        {/* recent activity */}
        <div className="space-y-4">
          <Skeleton className="h-2.5 w-28" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-1.5 pl-5">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}

// ─── Developer view skeleton ──────────────────────────────────────────────────

/** Mirrors the developer variant of RightOverviewPanel */
export function DeveloperPanelSkeleton() {
  return (
    <section className="w-full">
      <div className="w-full p-2 md:p-4">
        <div className="rounded-2xl bg-background/60 border border-border/20 overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
            {/* left col: stats + activity */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-wrap gap-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex-1 min-w-[160px] rounded-lg glass-panel border border-border/10 p-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-9 rounded-xl shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-2.5 w-16" />
                        <Skeleton className="h-5 w-12" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="mt-2">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-14" />
                  </div>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="size-2 rounded-full mt-1 shrink-0" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-3.5 w-full" />
                        <Skeleton className="h-2.5 w-20" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* right col: profile + CI */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                  <Skeleton className="size-20 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="size-8 rounded-full" />
                    <Skeleton className="size-8 rounded-full" />
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-lg glass-panel border border-border/10 p-3 space-y-2">
                <Skeleton className="h-2.5 w-16" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-20 rounded" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
