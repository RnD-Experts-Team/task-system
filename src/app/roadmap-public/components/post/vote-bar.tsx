import { cn } from "@/lib/utils"
import type { PublicPostDetail } from "../../types"
import { VoteButton } from "../feed/vote-button"

interface Props {
  post: PublicPostDetail
  votingDisabledReason: string | null
  showVoteCounts: boolean
}

/** Sticky bottom vote bar for mobile post pages. */
export function VoteBar({ post, votingDisabledReason, showVoteCounts }: Props) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-background px-4 pt-3 lg:hidden",
        "pb-[max(0.75rem,env(safe-area-inset-bottom))]",
      )}
    >
      <VoteButton
        variant="bar"
        board={post.board.slug}
        number={post.number}
        title={post.title}
        votesCount={post.votes_count}
        disabledReason={votingDisabledReason}
        showCount={showVoteCounts}
        className="w-full"
      />
    </div>
  )
}
