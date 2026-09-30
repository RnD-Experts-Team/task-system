import { memo } from "react"
import { Link } from "react-router"
import { ArrowRightLeft, MessageSquare, Pin, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { AdminStatusRef, KanbanCard } from "../types"
import { TagChip } from "./status-pill"

type KanbanCardViewProps = {
  card: KanbanCard
  isOverlay?: boolean
  /** Other columns for the "Move to…" menu (mobile / keyboard fallback). Omit to hide it. */
  moveTargets?: AdminStatusRef[]
  onMoveTo?: (card: KanbanCard, statusId: number) => void
  moveDisabled?: boolean
}

/** Visual content of a roadmap card (shared by the sortable card, the overlay and mobile lists). */
export const KanbanCardView = memo(function KanbanCardView({ card, isOverlay, moveTargets, onMoveTo, moveDisabled }: KanbanCardViewProps) {
  return (
    <div
      className={cn(
        "w-full rounded-lg border bg-card p-3 text-start shadow-xs transition-colors",
        isOverlay ? "cursor-grabbing shadow-xl ring-1 ring-primary/40" : "hover:border-primary/30"
      )}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 font-mono text-[0.625rem] text-muted-foreground">#{card.number}</p>
          <h4 className="line-clamp-3 text-sm leading-snug font-medium break-words">{card.title}</h4>
        </div>
        {card.is_pinned && <Pin className="mt-0.5 size-3.5 shrink-0 text-primary" aria-label="Pinned" />}
      </div>

      {card.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {card.tags.slice(0, 3).map((tag) => (
            <TagChip key={tag.id} name={tag.name} color={tag.color} />
          ))}
          {card.tags.length > 3 && <span className="text-[0.625rem] text-muted-foreground">+{card.tags.length - 3}</span>}
        </div>
      )}

      <div className="mt-2.5 flex items-center gap-3 border-t pt-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 font-medium tabular-nums text-foreground">
          <ThumbsUp className="size-3" />
          {card.votes_count}
        </span>
        <span className="inline-flex items-center gap-1 tabular-nums">
          <MessageSquare className="size-3" />
          {card.comments_count}
        </span>
        <div className="ms-auto flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          {!isOverlay && (
            <Button asChild variant="ghost" size="xs" className="text-muted-foreground">
              <Link to={`/roadmap-admin/posts?post=${card.id}`}>Open</Link>
            </Button>
          )}
          {moveTargets && onMoveTo && !isOverlay && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="xs" className="gap-1" disabled={moveDisabled}>
                  <ArrowRightLeft />
                  Move to…
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Move to column</DropdownMenuLabel>
                {moveTargets.map((target) => (
                  <DropdownMenuItem key={target.id} onSelect={() => onMoveTo(card, target.id)}>
                    <span className="size-2 rounded-full" style={{ backgroundColor: target.color }} aria-hidden />
                    {target.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  )
})
