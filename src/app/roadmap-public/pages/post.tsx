import { useEffect } from "react"
import { ArrowLeft, Sparkles } from "lucide-react"
import { Link, useLocation, useNavigate, useParams } from "react-router"
import { cn } from "@/lib/utils"
import { ErrorState } from "../components/common/error-state"
import { PostDetailSkeleton } from "../components/common/skeletons"
import { StatusPill } from "../components/common/status-pill"
import { TagChip } from "../components/common/tag-chip"
import { CommentsSection } from "../components/post/comments-section"
import { MergedNotice } from "../components/post/merged-notice"
import { OfficialResponse } from "../components/post/official-response"
import { PendingBanner } from "../components/post/pending-banner"
import { PostSideCard } from "../components/post/post-side-card"
import { StatusTimeline } from "../components/post/status-timeline"
import { VoteBar } from "../components/post/vote-bar"
import { useBoard, votingDisabledReason } from "../hooks/useBoard"
import { useIsDesktop } from "../hooks/useMediaQuery"
import { usePageMeta } from "../hooks/usePageMeta"
import { usePost } from "../hooks/usePost"
import { isNotFound } from "../lib/errors"
import { formatDate, formatRelative, isoOrUndefined } from "../lib/format"
import { linkify } from "../lib/linkify"
import { S } from "../lib/strings"
import { containerClass } from "../lib/ui"
import { boardPath, changelogEntryPath, parsePostParam, postPath } from "../lib/url"
import { useSiteStore } from "../stores/siteStore"
import { useViewerStore } from "../stores/viewerStore"
import { useVisitorStore } from "../stores/visitorStore"
import type { BoardDetail, PublicConfig, PublicPostDetail } from "../types"
import NotFoundPage from "./not-found"
import { LabelBadge } from "../components/changelog/label-badge"

export default function RoadmapPostPage() {
  const { boardSlug, postSlug } = useParams()
  const parsed = parsePostParam(postSlug)
  const config = useSiteStore((s) => s.config)
  const hasToken = useVisitorStore((s) => s.token !== null)
  const post = usePost(boardSlug, parsed?.number ?? null, hasToken)
  const board = useBoard(boardSlug)

  if (!parsed) return <NotFoundPage />
  const error = post.error ?? board.error
  if (error) {
    return isNotFound(error) ? (
      <NotFoundPage />
    ) : (
      <div className={cn(containerClass, "py-16")}>
        <ErrorState error={error} onRetry={() => (post.error ? post.reload() : board.reload())} className="mx-auto max-w-lg" />
      </div>
    )
  }
  if (!post.data || !board.data || !config) {
    return (
      <div className={cn(containerClass, "py-8 sm:py-12")}>
        <PostDetailSkeleton />
      </div>
    )
  }
  return <PostView key={`${post.data.board.slug}-${post.data.number}`} post={post.data} board={board.data} config={config} routeSlug={postSlug ?? ""} />
}

// ─── View ──────────────────────────────────────────────────────────

function PostView({
  post,
  board,
  config,
  routeSlug,
}: {
  post: PublicPostDetail
  board: BoardDetail
  config: PublicConfig
  routeSlug: string
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const isDesktop = useIsDesktop()
  const canonicalPath = postPath(post.board.slug, post.number, post.canonical_slug)
  const merged = post.merged_into
  const mergedFrom = (location.state as { mergedFrom?: number } | null)?.mergedFrom

  // Merged posts forward to their target (with a notice); stale slugs are replaced by the canonical URL.
  useEffect(() => {
    if (merged) {
      navigate(postPath(merged.board_slug, merged.number, merged.slug), { replace: true, state: { mergedFrom: post.number } })
    } else if (post.canonical_slug && routeSlug !== `${post.number}-${post.canonical_slug}`) {
      navigate(canonicalPath, { replace: true, state: location.state })
    }
  }, [merged, post.number, post.canonical_slug, routeSlug, canonicalPath, navigate, location.state])

  // Own votes / pending items for this board.
  useEffect(() => {
    void useViewerStore.getState().hydrate(post.board.slug)
  }, [post.board.slug])

  usePageMeta({
    title: S.meta.postTitle(post.title, post.board.name, config.site.name),
    description: post.excerpt || post.body.slice(0, 155),
    canonical: canonicalPath,
  })

  const disabledReason = votingDisabledReason(board, post.status.slug, {
    boardClosed: S.vote.boardClosed,
    closed: S.vote.closed,
  })
  const showCounts = config.features.show_vote_counts
  const commentsEnabled = config.features.comments && board.board.allow_comments

  if (merged) {
    return (
      <div className={cn(containerClass, "py-8 sm:py-12")}>
        <PostDetailSkeleton />
      </div>
    )
  }

  return (
    <div className={cn(containerClass, "py-6 pb-32 sm:py-10 lg:pb-12")}>
      <Link
        to={boardPath(post.board.slug)}
        className="-ms-2 mb-6 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4 rtl:rotate-180" />
        {S.post.backToBoard(post.board.name)}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
        <article className="min-w-0 space-y-8">
          {mergedFrom ? <MergedNotice fromNumber={mergedFrom} /> : null}
          {post.viewer.is_owner_pending ? (
            <PendingBanner title={S.post.pendingTitle} body={S.post.pendingBody} />
          ) : null}

          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill name={post.status.name} color={post.status.color} />
              {post.tags.map((t) => (
                <TagChip key={t.slug} name={t.name} />
              ))}
            </div>
            <h1 className="text-[1.75rem] leading-tight font-semibold tracking-tight text-balance sm:text-4xl">{post.title}</h1>
            <p className="flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{post.author.name}</span>
              {post.author.is_team ? (
                <span className="rounded-full bg-(--rm-accent-soft) px-2 py-0.5 text-[0.6875rem] font-medium text-(--rm-accent-strong)">
                  {S.common.team}
                </span>
              ) : null}
              {post.published_at ? (
                <>
                  <span aria-hidden="true">&middot;</span>
                  <time dateTime={isoOrUndefined(post.published_at)} title={formatDate(post.published_at, "long")}>
                    {formatRelative(post.published_at)}
                  </time>
                </>
              ) : null}
            </p>
          </header>

          {post.body ? (
            <p className="text-base leading-relaxed break-words whitespace-pre-line text-foreground/90 sm:text-[1.0625rem]">
              {linkify(post.body)}
            </p>
          ) : null}

          {post.response ? <OfficialResponse response={post.response} /> : null}

          {post.related_changelog.length > 0 ? (
            <section aria-label={S.post.relatedHeading} className="space-y-2">
              <h2 className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">{S.post.relatedHeading}</h2>
              <ul className="space-y-2">
                {post.related_changelog.map((c) => (
                  <li key={c.slug}>
                    <Link
                      to={changelogEntryPath(c.slug)}
                      className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 text-sm transition-[transform,border-color] duration-150 ease-out hover:border-border motion-safe:hover:-translate-y-px"
                    >
                      <Sparkles aria-hidden="true" className="size-4 shrink-0 text-(--rm-accent-strong)" />
                      <span className="min-w-0 flex-1 truncate font-medium">{c.title}</span>
                      <LabelBadge label={c.label} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {!isDesktop ? <StatusTimeline history={post.status_history} createdAt={post.published_at} /> : null}

          <CommentsSection board={post.board.slug} number={post.number} limits={config.limits_hint} enabled={commentsEnabled} />
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <PostSideCard post={post} votingDisabledReason={disabledReason} showVoteCounts={showCounts} />
          </div>
        </aside>
      </div>

      {!isDesktop ? <VoteBar post={post} votingDisabledReason={disabledReason} showVoteCounts={showCounts} /> : null}
    </div>
  )
}
