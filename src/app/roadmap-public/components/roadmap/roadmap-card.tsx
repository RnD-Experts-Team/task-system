import { ChevronUp, MessageSquare } from "lucide-react"
import { Link } from "react-router"
import { cn } from "@/lib/utils"
import { formatCount } from "../../lib/format"
import { S } from "../../lib/strings"
import { cardClass, liftClass } from "../../lib/ui"
import { postPath } from "../../lib/url"
import { useViewerStore, voteKey } from "../../stores/viewerStore"
import type { PublicPostListItem } from "../../types"
import { TagChip } from "../common/tag-chip"

interface Props {
  board: string
  post: PublicPostListItem
  showVoteCounts: boolean
  showComments: boolean
}

/** Compact read-only card for the roadmap columns; the whole card opens the idea. */
export function RoadmapCard({ board, post, showVoteCounts, showComments }: Props) {
  const k = voteKey(board, post.number)
  const voted = useViewerStore((s) => s.voted[k] === true)
  const votes = useViewerStore((s) => s.counts[k]) ?? post.votes_count
  return (
    <article className={cn(cardClass, liftClass, "relative flex items-start gap-3 p-4 has-[h3_a:focus-visible]:border-(--ring)")}>
      {showVoteCounts ? (
        <span
          className={cn(
            "inline-flex h-11 w-10 shrink-0 flex-col items-center justify-center rounded-lg border text-xs font-semibold tabular-nums",
            voted ? "border-primary/40 bg-(--rm-accent-soft) text-(--rm-accent-strong)" : "border-border text-muted-foreground",
          )}
        >
          <ChevronUp aria-hidden="true" className="size-3.5" strokeWidth={2.25} />
          <span className="sr-only">{S.common.votes(votes)}</span>
          <span aria-hidden="true">{formatCount(votes)}</span>
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <h3 className="text-[0.9375rem] leading-snug font-semibold tracking-tight text-balance">
          <Link to={postPath(board, post.number, post.slug)} className="rounded-sm after:absolute after:inset-0 after:content-['']">
            {post.title}
          </Link>
        </h3>
        {post.tags.length > 0 || (showComments && post.comments_count > 0) ? (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {post.tags.slice(0, 2).map((t) => (
              <TagChip key={t.slug} name={t.name} />
            ))}
            {showComments && post.comments_count > 0 ? (
              <span className="inline-flex items-center gap-1 tabular-nums">
                <MessageSquare aria-hidden="true" className="size-3.5" />
                <span className="sr-only">{S.common.comments(post.comments_count)}</span>
                <span aria-hidden="true">{post.comments_count}</span>
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  )
}
