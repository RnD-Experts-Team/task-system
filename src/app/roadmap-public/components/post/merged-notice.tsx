import { GitMerge } from "lucide-react"
import { S } from "../../lib/strings"

export function MergedNotice({ fromNumber }: { fromNumber: number }) {
  return (
    <div role="status" className="flex items-start gap-3 rounded-xl border border-border/60 bg-(--rm-accent-soft) px-4 py-3 text-sm">
      <GitMerge aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-(--rm-accent-strong)" />
      <div className="min-w-0">
        <p className="font-medium">{S.post.mergedTitle}</p>
        <p className="mt-0.5 text-muted-foreground">{S.post.mergedBody(fromNumber)}</p>
      </div>
    </div>
  )
}
