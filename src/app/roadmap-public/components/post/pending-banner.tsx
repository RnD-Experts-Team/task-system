import { Clock } from "lucide-react"

interface Props {
  title: string
  body: string
}

/** "Awaiting review" note visible only to the owner (post or comments). */
export function PendingBanner({ title, body }: Props) {
  return (
    <div role="status" className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/50 px-4 py-3 text-sm">
      <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-muted-foreground">{body}</p>
      </div>
    </div>
  )
}
