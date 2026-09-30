import { Clock } from "lucide-react"
import { S } from "../../lib/strings"
import { useViewerStore } from "../../stores/viewerStore"

/** "Awaiting review" note for the visitor's own pending ideas on this board. */
export function OwnPendingBanner({ board }: { board: string }) {
  const items = useViewerStore((s) => s.ownPending)
  const mine = items.filter((p) => p.board === board && p.type === "post")
  if (mine.length === 0) return null
  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/50 px-4 py-3 text-sm"
    >
      <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="font-medium">{S.feed.ownPendingTitle(mine.length)}</p>
        <p className="mt-0.5 text-muted-foreground">
          {mine.length === 1 && mine[0]?.title ? `“${mine[0].title}”. ` : ""}
          {S.feed.ownPendingBody}
        </p>
      </div>
    </div>
  )
}
