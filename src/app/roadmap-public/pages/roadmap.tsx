import { useEffect } from "react"
import { Link, useParams } from "react-router"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { ErrorState } from "../components/common/error-state"
import { PageSkeleton, RoadmapSkeleton } from "../components/common/skeletons"
import { RoadmapColumns } from "../components/roadmap/roadmap-columns"
import { useBoard } from "../hooks/useBoard"
import { usePageMeta } from "../hooks/usePageMeta"
import { useRoadmap } from "../hooks/useRoadmap"
import { isNotFound } from "../lib/errors"
import { S } from "../lib/strings"
import { containerClass, eyebrowClass } from "../lib/ui"
import { boardPath, roadmapPath } from "../lib/url"
import { useSiteStore } from "../stores/siteStore"
import { useViewerStore } from "../stores/viewerStore"
import NotFoundPage from "./not-found"

export default function RoadmapColumnsPage() {
  const { boardSlug } = useParams()
  const config = useSiteStore((s) => s.config)
  const board = useBoard(boardSlug)
  const roadmap = useRoadmap(boardSlug)

  usePageMeta({
    title: S.meta.roadmapTitle(board.data?.board.name ?? "", config?.site.name ?? ""),
    description: board.data ? S.meta.roadmapDescription(board.data.board.name) : undefined,
    canonical: boardSlug ? roadmapPath(boardSlug) : undefined,
  })

  useEffect(() => {
    if (boardSlug) void useViewerStore.getState().hydrate(boardSlug)
  }, [boardSlug])

  const error = board.error ?? roadmap.error
  if (error) {
    return isNotFound(error) ? (
      <NotFoundPage />
    ) : (
      <div className={cn(containerClass, "py-16")}>
        <ErrorState error={error} onRetry={() => (board.error ? board.reload() : roadmap.reload())} className="mx-auto max-w-lg" />
      </div>
    )
  }
  if (!config || !boardSlug) return <PageSkeleton />
  if (!config.features.roadmap) {
    return (
      <div className={cn(containerClass, "py-16")}>
        <ErrorState title={S.errors.notFoundTitle} message={S.roadmap.featureOff} className="mx-auto max-w-lg" />
      </div>
    )
  }

  return (
    <div className={cn(containerClass, "py-8 sm:py-12")}>
      <header className="mb-8 max-w-2xl sm:mb-10">
        <Link
          to={boardPath(boardSlug)}
          className={cn(eyebrowClass, "-ms-1 mb-3 inline-flex items-center gap-1.5 rounded px-1 transition-colors hover:text-foreground")}
        >
          <ArrowLeft aria-hidden="true" className="size-3.5 rtl:rotate-180" />
          {board.data?.board.name ?? boardSlug}
        </Link>
        <h1 className="text-[2rem] leading-tight font-semibold tracking-tight text-balance sm:text-4xl">{S.roadmap.title}</h1>
        <p className="mt-3 text-base text-pretty text-muted-foreground">{S.roadmap.subtitle}</p>
      </header>

      {roadmap.loading || !roadmap.data ? (
        <RoadmapSkeleton />
      ) : (
        <RoadmapColumns
          board={boardSlug}
          columns={roadmap.data.columns}
          showVoteCounts={config.features.show_vote_counts}
          showComments={config.features.comments && (board.data?.board.allow_comments ?? true)}
        />
      )}
    </div>
  )
}
