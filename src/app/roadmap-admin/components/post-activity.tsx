import { AlertTriangle, ArrowRight, History, Fingerprint } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "../utils/format"
import type { AdminPostDetail } from "../types"
import { StatusPill } from "./status-pill"

/** Status history timeline. */
export function StatusHistory({ history }: { history: AdminPostDetail["status_history"] }) {
  if (history.length === 0) {
    return <p className="text-sm text-muted-foreground">No status changes yet.</p>
  }
  return (
    <ol className="space-y-3">
      {history.map((change) => (
        <li key={change.id} className="rounded-lg border bg-card/40 p-3">
          <div className="flex flex-wrap items-center gap-2">
            {change.from ? <StatusPill name={change.from.name} color={change.from.color} /> : <span className="text-xs text-muted-foreground">Created</span>}
            <ArrowRight className="size-3 text-muted-foreground" aria-hidden />
            <StatusPill name={change.to.name} color={change.to.color} />
            {change.note && (
              <Badge variant={change.is_public ? "secondary" : "outline"} className="ms-auto">
                {change.is_public ? "Public note" : "Internal note"}
              </Badge>
            )}
          </div>
          {change.note && <p className="mt-2 text-sm whitespace-pre-wrap break-words">{change.note}</p>}
          <p className="mt-1.5 text-xs text-muted-foreground">
            {change.changed_by_name ?? "System"} · {formatDateTime(change.at)}
          </p>
        </li>
      ))}
    </ol>
  )
}

/** Votes grouped by short ip hash — a heavy concentration hints at manipulation. */
export function VotesByIp({ votes, total }: { votes: AdminPostDetail["votes_by_ip"]; total: number }) {
  if (votes.length === 0) return <p className="text-sm text-muted-foreground">No votes recorded.</p>
  const sorted = [...votes].sort((a, b) => b.count - a.count)
  const top = sorted[0]
  const sum = sorted.reduce((acc, v) => acc + v.count, 0) || total || 1
  const concentrated = top.count >= 5 && top.count / sum >= 0.4

  return (
    <div className="space-y-3">
      {concentrated && (
        <p className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            {Math.round((top.count / sum) * 100)}% of votes come from one network (<span className="font-mono">{top.ip_hash_short}</span>).
            Check Visitors &amp; Abuse before trusting this ranking.
          </span>
        </p>
      )}
      <ul className="space-y-1.5">
        {sorted.slice(0, 8).map((v) => (
          <li key={v.ip_hash_short} className="flex items-center gap-2 text-sm">
            <Fingerprint className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="w-20 shrink-0 font-mono text-xs">{v.ip_hash_short}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary/60" style={{ width: `${(v.count / top.count) * 100}%` }} />
            </div>
            <span className="w-8 shrink-0 text-end tabular-nums">{v.count}</span>
          </li>
        ))}
      </ul>
      {sorted.length > 8 && <p className="text-xs text-muted-foreground">+ {sorted.length - 8} more networks</p>}
    </div>
  )
}

export function ActivityHeading({ children }: { children: string }) {
  return (
    <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
      <History className="size-3.5 text-muted-foreground" />
      {children}
    </h4>
  )
}
