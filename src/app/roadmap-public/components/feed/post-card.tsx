import { MessageSquare, Pin, Reply } from "lucide-react"
import { Link } from "react-router"
import { cn } from "@/lib/utils"
import { formatCount, formatRelative, isoOrUndefined } from "../../lib/format"
import { S } from "../../lib/strings"
import { cardClass, liftClass } from "../../lib/ui"
import { postPath } from "../../lib/url"
import type { PublicPostListItem } from "../../types"
import { StatusPill } from "../common/status-pill"
import { TagChip } from "../common/tag-chip"
import { VoteButton } from "./vote-button"

interface Props {
  board: string
  post: PublicPostListItem
  votingDisabledReason: string | null
  showVoteCounts: boolean
  showComments: boolean
}

export function PostCard({ board, post, votingDisabledReason, showVoteCounts, showComments }: Props) {
  const to = postPath(board, post.number, post.slug)
  return (
    <article
      className={cn(
        cardClass,
        liftClass,
        "group relative flex items-start gap-3 p-4 has-[h2_a:focus-visible]:border-(--ring) sm:gap-4 sm:p-5",
      )}
    >
      <VoteButton
        board={board}
        number={post.number}
        title={post.title}
        votesCount={post.votes_count}
        disabledReason={votingDisabledReason}
        showCount={showVoteCounts}
      />
      <div className="min-w-0 flex-1">
        {post.is_pinned ? (
          <p className="mb-1 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Pin aria-hidden="true" className="size-3" />
            {S.feed.pinned}
          </p>
        ) : null}
        <h2 className="text-base leading-snug font-semibold tracking-tight text-balance">
          <Link to={to} className="rounded-sm after:absolute after:inset-0 after:content-['']">
            {post.title}
          </Link>
        </h2>
        {post.excerpt ? <p className="mt-1 line-clamp-2 text-sm text-pretty text-muted-foreground">{post.excerpt}</p> : null}
        <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-xs text-muted-foreground">
          <StatusPill name={post.status.name} color={post.status.color} />
          {post.tags.slice(0, 3).map((t) => (
            <TagChip key={t.slug} name={t.name} />
          ))}
          {post.has_response ? (
            <span className="inline-flex items-center gap-1 font-medium text-(--rm-accent-strong)">
              <Reply aria-hidden="true" className="size-3.5" />
              {S.feed.teamReplied}
            </span>
          ) : null}
          {showComments ? (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <MessageSquare aria-hidden="true" className="size-3.5" />
              <span className="sr-only">{S.common.comments(post.comments_count)}</span>
              <span aria-hidden="true">{formatCount(post.comments_count)}</span>
            </span>
          ) : null}
          <span className="truncate">
            {post.author.name}
            {post.published_at ? (
              <>
                {" · "}
                <time dateTime={isoOrUndefined(post.published_at)}>{formatRelative(post.published_at)}</time>
              </>
            ) : null}
          </span>
        </div>
      </div>
    </article>
  )
}
