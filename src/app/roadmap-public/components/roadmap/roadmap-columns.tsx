import { useRef, useState } from "react"
import { ArrowRight } from "lucide-react"
import { Link } from "react-router"
import { cn } from "@/lib/utils"
import { safeColor, tint, tintText } from "../../lib/format"
import { S } from "../../lib/strings"
import { boardPath } from "../../lib/url"
import type { RoadmapColumn } from "../../types"
import { EmptyState } from "../common/empty-state"
import { RoadmapCard } from "./roadmap-card"
import { Inbox } from "lucide-react"

interface Props {
  board: string
  columns: RoadmapColumn[]
  showVoteCounts: boolean
  showComments: boolean
}

/**
 * Desktop: columns side by side. Mobile: one full-width column at a time, swipeable
 * (CSS scroll-snap) with count tabs that scroll to and follow the active column.
 */
export function RoadmapColumns({ board, columns, showVoteCounts, showComments }: Props) {
  const scroller = useRef<HTMLDivElement | null>(null)
  const [active, setActive] = useState(0)

  function goTo(index: number) {
    const el = scroller.current
    if (!el) return
    setActive(index)
    const rtl = getComputedStyle(el).direction === "rtl"
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    el.scrollTo({ left: index * el.clientWidth * (rtl ? -1 : 1), behavior: reduce ? "auto" : "smooth" })
  }

  function onScroll() {
    const el = scroller.current
    if (!el || el.clientWidth === 0) return
    const index = Math.round(Math.abs(el.scrollLeft) / el.clientWidth)
    setActive((prev) => (prev === index ? prev : Math.min(index, columns.length - 1)))
  }

  function onTabKey(e: React.KeyboardEvent, index: number) {
    const last = columns.length - 1
    let next = index
    if (e.key === "ArrowRight") next = Math.min(last, index + 1)
    else if (e.key === "ArrowLeft") next = Math.max(0, index - 1)
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = last
    else return
    e.preventDefault()
    goTo(next)
    document.getElementById(`rm-col-tab-${next}`)?.focus()
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label={S.roadmap.tabsLabel}
        className="rm-scroll-x -mx-4 mb-4 flex gap-1 overflow-x-auto border-b border-border/60 px-4 md:hidden"
      >
        {columns.map((c, i) => (
          <button
            key={c.status.slug}
            id={`rm-col-tab-${i}`}
            role="tab"
            type="button"
            aria-selected={active === i}
            aria-controls={`rm-col-${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => goTo(i)}
            onKeyDown={(e) => onTabKey(e, i)}
            className={cn(
              "-mb-px inline-flex h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-sm font-medium transition-colors duration-150",
              active === i ? "border-foreground text-foreground" : "border-transparent text-muted-foreground",
            )}
          >
            <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: safeColor(c.status.color) }} />
            {c.status.name}
            <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums">{c.total}</span>
          </button>
        ))}
      </div>

      <div
        ref={scroller}
        onScroll={onScroll}
        className="rm-scroll-x flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain md:grid md:snap-none md:grid-flow-col md:auto-cols-[minmax(17rem,1fr)] md:gap-5 md:overflow-x-auto"
      >
        {columns.map((c, i) => (
          <section
            key={c.status.slug}
            id={`rm-col-${i}`}
            role="tabpanel"
            aria-labelledby={`rm-col-tab-${i}`}
            className="relative min-w-full snap-start md:min-w-0"
          >
            <h2 className="sr-only md:hidden">{c.status.name}</h2>
            <div className="mb-3 hidden items-center gap-2.5 md:flex">
              <h2
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold"
                style={{ backgroundColor: tint(c.status.color, 14), color: tintText(c.status.color) }}
              >
                <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: safeColor(c.status.color) }} />
                {c.status.name}
              </h2>
              <span className="text-sm tabular-nums text-muted-foreground">{c.total}</span>
            </div>

            {c.posts.length === 0 ? (
              <EmptyState icon={Inbox} title={S.roadmap.emptyColumn} className="py-10" />
            ) : (
              <ul className="space-y-3">
                {c.posts.map((p) => (
                  <li key={p.number}>
                    <RoadmapCard board={board} post={p} showVoteCounts={showVoteCounts} showComments={showComments} />
                  </li>
                ))}
              </ul>
            )}

            {c.total > 0 ? (
              <Link
                to={`${boardPath(board)}?status=${encodeURIComponent(c.status.slug)}`}
                className="group mt-3 inline-flex h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-(--rm-accent-strong) transition-colors hover:bg-(--rm-accent-soft)"
              >
                {S.common.seeAll(c.total)}
                <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5 rtl:rotate-180" />
              </Link>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  )
}
