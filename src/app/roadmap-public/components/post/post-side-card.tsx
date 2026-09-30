import { cn } from "@/lib/utils"
import { formatDate, isoOrUndefined } from "../../lib/format"
import { S } from "../../lib/strings"
import { cardClass } from "../../lib/ui"
import type { PublicPostDetail } from "../../types"
import { StatusPill } from "../common/status-pill"
import { VoteButton } from "../feed/vote-button"
import { ShareButton } from "./share-button"
import { StatusTimeline } from "./status-timeline"

interface Props {
  post: PublicPostDetail
  votingDisabledReason: string | null
  showVoteCounts: boolean
}

/** Desktop sticky card: vote, status, progress timeline and share. */
export function PostSideCard({ post, votingDisabledReason, showVoteCounts }: Props) {
  return (
    <div className={cn(cardClass, "space-y-5 p-5")}>
      <VoteButton
        variant="bar"
        board={post.board.slug}
        number={post.number}
        title={post.title}
        votesCount={post.votes_count}
        disabledReason={votingDisabledReason}
        showCount={showVoteCounts}
        className="w-full flex-none"
      />
      <dl className="space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">{S.post.statusHeading}</dt>
          <dd>
            <StatusPill name={post.status.name} color={post.status.color} />
          </dd>
        </div>
        {post.published_at ? (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">{S.post.historyCreated}</dt>
            <dd>
              <time dateTime={isoOrUndefined(post.published_at)}>{formatDate(post.published_at)}</time>
            </dd>
          </div>
        ) : null}
      </dl>
      <StatusTimeline history={post.status_history} createdAt={post.published_at} />
      <ShareButton className="w-full" />
    </div>
  )
}
