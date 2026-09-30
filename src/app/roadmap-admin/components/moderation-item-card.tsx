import { forwardRef, type KeyboardEvent } from "react"
import { Link } from "react-router"
import { Check, CornerDownRight, Flag, MessageSquare, ShieldAlert, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { timeAgo } from "../utils/format"
import type { AdminComment, AdminPostListItem } from "../types"
import type { ModerationDecision } from "../store/moderationStore"
import { VisitorSummary } from "./visitor-summary"

type ModerationItemCardProps = {
  item: AdminPostListItem | AdminComment
  selected: boolean
  busy?: boolean
  canDecide: boolean
  onSelectChange: (selected: boolean) => void
  onDecide: (state: ModerationDecision) => void
}

function isPost(item: AdminPostListItem | AdminComment): item is AdminPostListItem {
  return "title" in item && "board" in item
}

/** Flag codes come from the server ("links:3", "same_ip_content", …) — show them readable. */
function flagLabel(flag: string): string {
  if (flag.startsWith("links:")) return `${flag.slice(6)} links`
  return flag.replace(/[_:]+/g, " ")
}

/** A pending post/comment with visitor context and A / R / S keyboard shortcuts. */
export const ModerationItemCard = forwardRef<HTMLDivElement, ModerationItemCardProps>(function ModerationItemCard(
  { item, selected, busy, canDecide, onSelectChange, onDecide },
  ref
) {
  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!canDecide || busy || event.metaKey || event.ctrlKey || event.altKey) return
    const target = event.target as HTMLElement
    if (target.closest("input, textarea, select, [contenteditable='true']")) return
    const key = event.key.toLowerCase()
    if (key === "a") onDecide("approved")
    else if (key === "r") onDecide("rejected")
    else if (key === "s") onDecide("spam")
    else return
    event.preventDefault()
  }

  const post = isPost(item)
  const boardName = post ? item.board.name : item.post.board_slug

  return (
    <Card
      ref={ref}
      tabIndex={0}
      role="group"
      aria-label={post ? `Pending post: ${item.title}` : `Pending comment on ${item.post.title}`}
      onKeyDown={handleKeyDown}
      data-item-id={item.id}
      className={cn(
        "gap-3 py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected && "ring-2 ring-primary/40"
      )}
    >
      <CardContent className="flex gap-3 px-4">
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelectChange(checked === true)}
          aria-label="Select for bulk action"
          className="mt-1"
        />
        <div className="min-w-0 flex-1 space-y-2.5">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <Badge variant="secondary">{boardName}</Badge>
            {post ? (
              <span className="font-mono">#{item.number}</span>
            ) : (
              <span className="inline-flex items-center gap-1">
                {item.parent_id ? <CornerDownRight className="size-3" /> : <MessageSquare className="size-3" />}
                {item.parent_id ? "Reply" : "Comment"} on
                <Link
                  to={`/roadmap-admin/posts?post=${item.post.id}`}
                  className="max-w-[16rem] truncate font-medium text-foreground underline-offset-2 hover:underline"
                >
                  {item.post.title}
                </Link>
              </span>
            )}
            <span aria-hidden>·</span>
            <span>{item.author_name?.trim() || "Anonymous"}</span>
            <span aria-hidden>·</span>
            <time dateTime={item.created_at}>{timeAgo(item.created_at)}</time>
          </div>

          {/* Content */}
          {post ? (
            <div className="space-y-1">
              <h3 className="text-base font-semibold leading-snug break-words">{item.title}</h3>
              {item.excerpt && <p className="line-clamp-4 text-sm whitespace-pre-wrap break-words text-muted-foreground">{item.excerpt}</p>}
            </div>
          ) : (
            <p className="line-clamp-6 text-sm whitespace-pre-wrap break-words">{item.body}</p>
          )}

          {/* Flags */}
          {item.flags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Flag className="size-3.5 text-amber-600 dark:text-amber-400" aria-hidden />
              {item.flags.map((flag) => (
                <Badge
                  key={flag}
                  variant="outline"
                  className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-700 capitalize dark:text-amber-400"
                >
                  {flagLabel(flag)}
                </Badge>
              ))}
            </div>
          )}

          <VisitorSummary visitor={item.visitor} />
        </div>
      </CardContent>

      {canDecide && (
        <div className="flex flex-wrap items-center gap-2 border-t px-4 pt-3">
          <Button size="lg" disabled={busy} onClick={() => onDecide("approved")} className="gap-1.5">
            <Check />
            Approve
            <kbd className="ms-1 hidden rounded border border-primary-foreground/30 px-1 font-mono text-[0.625rem] sm:inline">A</kbd>
          </Button>
          <Button size="lg" variant="outline" disabled={busy} onClick={() => onDecide("rejected")} className="gap-1.5">
            <X />
            Reject
            <kbd className="ms-1 hidden rounded border px-1 font-mono text-[0.625rem] text-muted-foreground sm:inline">R</kbd>
          </Button>
          <Button size="lg" variant="destructive" disabled={busy} onClick={() => onDecide("spam")} className="gap-1.5">
            <ShieldAlert />
            Spam
            <kbd className="ms-1 hidden rounded border border-destructive/30 px-1 font-mono text-[0.625rem] sm:inline">S</kbd>
          </Button>
        </div>
      )}
    </Card>
  )
})
