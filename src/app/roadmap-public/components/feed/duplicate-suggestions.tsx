import { Check, Loader2 } from "lucide-react"
import { btn } from "../../lib/ui"
import { S } from "../../lib/strings"
import { postPath } from "../../lib/url"
import { useViewerStore, voteKey } from "../../stores/viewerStore"
import type { BoardDetail, SimilarPost } from "../../types"
import { StatusPill } from "../common/status-pill"

interface Props {
  board: BoardDetail
  suggestions: SimilarPost[]
  loading: boolean
}

function Row({ board, post }: { board: BoardDetail; post: SimilarPost }) {
  const k = voteKey(board.board.slug, post.number)
  const voted = useViewerStore((s) => s.voted[k] === true)
  const count = useViewerStore((s) => s.counts[k]) ?? post.votes_count
  const toggle = useViewerStore((s) => s.toggleVote)
  const locked = board.statuses.find((s) => s.slug === post.status.slug)?.locks_voting === true
  const canVote = board.board.allow_votes && !locked

  return (
    <li className="flex items-center gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <a
          href={postPath(board.board.slug, post.number, post.slug)}
          target="_blank"
          rel="noopener noreferrer"
          className="line-clamp-2 text-sm font-medium text-balance underline-offset-4 hover:underline"
        >
          {post.title}
        </a>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <StatusPill name={post.status.name} color={post.status.color} />
          <span className="tabular-nums">{S.common.votes(count)}</span>
        </div>
      </div>
      {canVote ? (
        <button
          type="button"
          aria-pressed={voted}
          onClick={() => toggle(board.board.slug, post.number, post.votes_count, true)}
          className={btn(voted ? "secondary" : "outline", "sm")}
        >
          {voted ? <Check aria-hidden="true" className="size-3.5" /> : null}
          {voted ? S.vote.voted : S.vote.voteInstead}
        </button>
      ) : null}
    </li>
  )
}

/** Duplicate hints shown while typing a title; "Vote instead" avoids creating a second idea. */
export function DuplicateSuggestions({ board, suggestions, loading }: Props) {
  const anyVoted = useViewerStore((s) => suggestions.some((p) => s.voted[voteKey(board.board.slug, p.number)]))
  if (suggestions.length === 0 && !loading) return null
  return (
    <section
      aria-live="polite"
      aria-label={S.submit.similarHeading}
      className="rounded-xl border border-border/60 bg-muted/40 px-4 py-3 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-150"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">{S.submit.similarHeading}</h3>
        {loading ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 aria-hidden="true" className="size-3.5 motion-safe:animate-spin" />
            <span className="sr-only">{S.submit.similarSearching}</span>
          </span>
        ) : null}
      </div>
      {suggestions.length > 0 ? (
        <>
          <p className="mt-0.5 text-[0.8125rem] text-muted-foreground">{S.submit.similarHint}</p>
          <ul className="mt-1 divide-y divide-border/60">
            {suggestions.map((p) => (
              <Row key={p.number} board={board} post={p} />
            ))}
          </ul>
          {anyVoted ? <p className="pt-1 text-[0.8125rem] font-medium text-(--rm-accent-strong)">{S.vote.thanksVote}</p> : null}
        </>
      ) : null}
    </section>
  )
}
