import type { MouseEvent } from "react"
import { ChevronUp } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { formatCount } from "../../lib/format"
import { S } from "../../lib/strings"
import { useViewerStore, voteKey } from "../../stores/viewerStore"

interface Props {
  board: string
  number: number
  title: string
  votesCount: number
  /** Non-null disables voting and is shown as the tooltip. */
  disabledReason: string | null
  showCount?: boolean
  /** "card" is the 56x64 column button; "bar" is the wide mobile bottom-bar button. */
  variant?: "card" | "bar"
  className?: string
}

/**
 * Optimistic upvote. States: default, voted, pending (request queued/in flight), disabled.
 * The store debounces to the final desired state and rolls back on failure.
 */
export function VoteButton({
  board,
  number,
  title,
  votesCount,
  disabledReason,
  showCount = true,
  variant = "card",
  className,
}: Props) {
  const k = voteKey(board, number)
  const voted = useViewerStore((s) => s.voted[k] === true)
  const count = useViewerStore((s) => s.counts[k]) ?? votesCount
  const pending = useViewerStore((s) => s.pending[k] === true)
  const toggle = useViewerStore((s) => s.toggleVote)
  const disabled = disabledReason !== null

  function onClick(e: MouseEvent<HTMLButtonElement>) {
    // The card is a link: never let a vote click navigate.
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    toggle(board, number, votesCount)
  }

  const button = (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={voted}
      aria-disabled={disabled || undefined}
      aria-busy={pending || undefined}
      aria-label={S.vote.label(title, showCount ? count : undefined)}
      data-state={disabled ? "disabled" : pending ? "pending" : voted ? "voted" : "default"}
      className={cn(
        "relative z-10 flex select-none items-center justify-center border transition-[background-color,border-color,color,transform] duration-150 ease-out",
        "motion-safe:active:scale-[0.97]",
        variant === "card"
          ? "h-16 w-14 shrink-0 flex-col gap-0.5 rounded-xl"
          : "h-11 flex-1 flex-row gap-2 rounded-xl px-4 text-sm font-medium",
        voted
          ? "border-primary bg-primary text-primary-foreground hover:bg-primary/90"
          : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-(--rm-accent-soft)",
        pending && "opacity-90",
        disabled && "cursor-not-allowed opacity-55 hover:border-border hover:bg-card",
        className,
      )}
    >
      <ChevronUp
        aria-hidden="true"
        className={cn(
          "size-5 transition-transform duration-150 ease-out",
          variant === "card" ? "" : "size-4",
          voted && "motion-safe:-translate-y-px",
        )}
        strokeWidth={2.25}
      />
      {showCount ? (
        <span className={cn("tabular-nums", variant === "card" ? "text-[0.9375rem] font-semibold leading-none" : "")}>
          {variant === "bar" ? `${voted ? S.vote.voted : S.vote.labelShort(voted)} · ${formatCount(count)}` : formatCount(count)}
        </span>
      ) : variant === "bar" ? (
        <span>{voted ? S.vote.voted : S.vote.labelShort(voted)}</span>
      ) : (
        <span className="sr-only">{S.vote.hiddenCount}</span>
      )}
    </button>
  )

  if (!disabled) return button
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right">{disabledReason}</TooltipContent>
    </Tooltip>
  )
}
