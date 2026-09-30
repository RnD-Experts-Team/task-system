import { useEffect, useState } from "react"
import { Lightbulb, Loader2, Map, Plus, SearchX } from "lucide-react"
import { Link, useParams } from "react-router"
import { cn } from "@/lib/utils"
import { ActiveFilters } from "../components/feed/active-filters"
import { FeedToolbar } from "../components/feed/feed-toolbar"
import { FiltersPanel } from "../components/feed/filters-panel"
import { OwnPendingBanner } from "../components/feed/own-pending-banner"
import { PostCard } from "../components/feed/post-card"
import { SubmitBox } from "../components/feed/submit-box"
import { BoardIcon } from "../components/common/board-icon"
import { EmptyState } from "../components/common/empty-state"
import { ErrorState } from "../components/common/error-state"
import { RmDrawer } from "../components/common/rm-drawer"
import { FeedSkeleton, PageSkeleton } from "../components/common/skeletons"
import { useBoard, votingDisabledReason } from "../hooks/useBoard"
import { useFeedParams } from "../hooks/useFeedParams"
import { useInfiniteScroll } from "../hooks/useInfiniteScroll"
import { useIsDesktop } from "../hooks/useMediaQuery"
import { usePageMeta } from "../hooks/usePageMeta"
import { usePostFeed } from "../hooks/usePostFeed"
import { isNotFound } from "../lib/errors"
import { S } from "../lib/strings"
import { btn, cardClass, containerClass, eyebrowClass } from "../lib/ui"
import { roadmapPath } from "../lib/url"
import { useSiteStore } from "../stores/siteStore"
import { useViewerStore } from "../stores/viewerStore"
import type { BoardDetail, PublicConfig } from "../types"
import NotFoundPage from "./not-found"

export default function RoadmapBoardPage() {
  const { boardSlug } = useParams()
  const config = useSiteStore((s) => s.config)
  const res = useBoard(boardSlug)

  if (res.error) {
    return isNotFound(res.error) ? (
      <NotFoundPage />
    ) : (
      <div className={cn(containerClass, "py-16")}>
        <ErrorState error={res.error} onRetry={res.reload} className="mx-auto max-w-lg" />
      </div>
    )
  }
  if (!res.data || !config) return <PageSkeleton />
  return <BoardFeed key={res.data.board.slug} detail={res.data} config={config} />
}

// ─── Feed ──────────────────────────────────────────────────────────

function BoardFeed({ detail, config }: { detail: BoardDetail; config: PublicConfig }) {
  const { board } = detail
  const slug = board.slug
  const isDesktop = useIsDesktop()
  const { filters, update, activeFilterCount, hasAny } = useFeedParams()
  const feed = usePostFeed({ board: slug, ...filters })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [submitOpen, setSubmitOpen] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const sentinel = useInfiniteScroll(feed.loadMore, feed.hasMore && !feed.moreLoading && !feed.moreError)

  usePageMeta({
    title: S.meta.boardTitle(board.name, config.site.name),
  })

  // Visitor state (own votes, pending items) loads in parallel with the list.
  useEffect(() => {
    void useViewerStore.getState().hydrate(slug)
  }, [slug])

  function clearAll() {
    update({ q: "", status: [], tag: [] })
    setResetKey((k) => k + 1)
  }

  function openSubmit() {
    if (isDesktop) document.getElementById("rm-submit-title")?.focus()
    else setSubmitOpen(true)
  }

  const canSubmit = board.allow_submissions
  const showRoadmapLink = config.features.roadmap

  const filtersPanel = (prefix: string) => (
    <FiltersPanel
      board={detail}
      status={filters.status}
      tag={filters.tag}
      onStatus={(status) => update({ status })}
      onTag={(tag) => update({ tag })}
      idPrefix={prefix}
    />
  )

  return (
    <div className={cn(containerClass, "py-8 pb-28 sm:py-12 lg:pb-12")}>
      <header className="mb-8 max-w-2xl sm:mb-10">
        <p className={cn(eyebrowClass, "mb-3 flex items-center gap-2")}>
          <BoardIcon icon={board.icon} className="size-4" />
          {S.nav.feedback}
        </p>
        <h1 className="text-[2rem] leading-tight font-semibold tracking-tight text-balance sm:text-4xl">{board.name}</h1>
        {board.description ? <p className="mt-3 text-base text-pretty text-muted-foreground">{board.description}</p> : null}
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-10">
        <div className="min-w-0 space-y-5">
          {isDesktop ? (
            canSubmit ? (
              <SubmitBox
                board={detail}
                limits={config.limits_hint}
                onCreated={(r) => r.moderation_state === "approved" && feed.reload()}
              />
            ) : (
              <div className={cn(cardClass, "p-5")}>
                <h2 className="text-base font-semibold">{S.feed.closedTitle}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{S.feed.closedBody}</p>
              </div>
            )
          ) : null}

          <OwnPendingBanner board={slug} />

          <div className="sticky top-0 z-20 -mx-4 space-y-3 border-b border-border/60 bg-background px-4 py-3 sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-0 lg:px-0 lg:py-0">
            <FeedToolbar
              key={resetKey}
              q={filters.q}
              sort={filters.sort}
              activeFilters={activeFilterCount}
              onSearch={(q) => update({ q })}
              onSort={(sort) => update({ sort })}
              onOpenFilters={() => setFiltersOpen(true)}
            />
            <ActiveFilters
              board={detail}
              status={filters.status}
              tag={filters.tag}
              onStatus={(status) => update({ status })}
              onTag={(tag) => update({ tag })}
              onClear={clearAll}
            />
          </div>

          {feed.error ? (
            <ErrorState error={feed.error} onRetry={feed.reload} />
          ) : feed.loading ? (
            <FeedSkeleton />
          ) : feed.items.length === 0 ? (
            hasAny ? (
              <EmptyState
                icon={SearchX}
                title={S.feed.emptyFilteredTitle}
                body={S.feed.emptyFilteredBody}
                action={
                  <button type="button" onClick={clearAll} className={btn("outline", "md")}>
                    {S.feed.clearFilters}
                  </button>
                }
              />
            ) : (
              <EmptyState
                icon={Lightbulb}
                title={S.feed.emptyTitle}
                body={S.feed.emptyBody}
                action={
                  canSubmit ? (
                    <button type="button" onClick={openSubmit} className={btn("primary", "md")}>
                      <Plus aria-hidden="true" className="size-4" />
                      {S.feed.suggestFab}
                    </button>
                  ) : undefined
                }
              />
            )
          ) : (
            <>
              <ol className="space-y-3">
                {feed.items.map((post, i) => (
                  <li
                    key={post.number}
                    className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:duration-200 motion-safe:fill-mode-backwards"
                    style={{ animationDelay: `${Math.min(i, 8) * 25}ms` }}
                  >
                    <PostCard
                      board={slug}
                      post={post}
                      votingDisabledReason={votingDisabledReason(detail, post.status.slug, {
                        boardClosed: S.vote.boardClosed,
                        closed: S.vote.closed,
                      })}
                      showVoteCounts={config.features.show_vote_counts}
                      showComments={config.features.comments && board.allow_comments}
                    />
                  </li>
                ))}
              </ol>

              {feed.hasMore ? (
                <div className="flex flex-col items-center gap-3 pt-2">
                  <div ref={sentinel} aria-hidden="true" className="h-px w-full" />
                  {feed.moreError ? <p className="text-sm text-destructive">{S.errors.generic}</p> : null}
                  <button type="button" onClick={feed.loadMore} disabled={feed.moreLoading} className={btn("outline", "md", "min-w-36")}>
                    {feed.moreLoading ? <Loader2 aria-hidden="true" className="size-4 motion-safe:animate-spin" /> : null}
                    {feed.moreLoading ? S.feed.loadingMore : S.feed.loadMore}
                  </button>
                </div>
              ) : feed.pagination && feed.pagination.last_page > 1 ? (
                <p className="pt-2 text-center text-sm text-muted-foreground">{S.feed.endOfList}</p>
              ) : null}
            </>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-6">
            <section aria-label={S.feed.filtersTitle} className={cn(cardClass, "p-4")}>
              <h2 className="sr-only">{S.feed.filtersTitle}</h2>
              {filtersPanel("rm-side")}
              {hasAny ? (
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-4 text-[0.8125rem] font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  {S.feed.clearFilters}
                </button>
              ) : null}
            </section>
            {showRoadmapLink ? (
              <Link
                to={roadmapPath(slug)}
                className={cn(
                  cardClass,
                  "group flex items-start gap-3 p-4 transition-[transform,border-color] duration-150 ease-out hover:border-border motion-safe:hover:-translate-y-px",
                )}
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-(--rm-accent-soft) text-(--rm-accent-strong)">
                  <Map aria-hidden="true" className="size-[1.125rem]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{S.feed.roadmapCardTitle}</span>
                  <span className="mt-0.5 block text-[0.8125rem] text-muted-foreground">{S.feed.roadmapCardBody}</span>
                </span>
              </Link>
            ) : null}
          </div>
        </aside>
      </div>

      {/* Mobile: filters drawer + floating suggest button */}
      {!isDesktop ? (
        <>
          <RmDrawer open={filtersOpen} onOpenChange={setFiltersOpen} title={S.feed.filtersTitle}>
            {filtersPanel("rm-drawer")}
            <div className="sticky bottom-0 -mx-5 mt-6 flex gap-3 border-t border-border/60 bg-background px-5 py-3">
              <button type="button" onClick={clearAll} className={btn("outline", "lg", "flex-1")}>
                {S.feed.clearFilters}
              </button>
              <button type="button" onClick={() => setFiltersOpen(false)} className={btn("primary", "lg", "flex-1")}>
                {S.feed.showResults}
              </button>
            </div>
          </RmDrawer>

          {canSubmit ? (
            <>
              <button
                type="button"
                onClick={() => setSubmitOpen(true)}
                className={btn("primary", "lg", "fixed end-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 rounded-full px-5 shadow-[0_8px_24px_-8px_rgb(0_0_0/0.35)]")}
              >
                <Plus aria-hidden="true" className="size-4" />
                {S.feed.suggestFab}
              </button>
              <RmDrawer
                open={submitOpen}
                onOpenChange={setSubmitOpen}
                title={S.submit.heading}
                description={S.submit.subheading}
              >
                <SubmitBox
                  board={detail}
                  limits={config.limits_hint}
                  variant="plain"
                  id="rm-submit-drawer"
                  onDone={() => setSubmitOpen(false)}
                  onCreated={(r) => r.moderation_state === "approved" && feed.reload()}
                />
              </RmDrawer>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
