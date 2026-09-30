import { Link } from "react-router"
import { ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { humanize, timeAgo } from "../utils/format"
import type { AbuseEvent, AbuseEventType } from "../types"
import { EmptyState } from "./empty-state"
import { ErrorState } from "./error-state"

const TYPE_LABEL: Record<AbuseEventType, string> = {
  honeypot: "Honeypot filled",
  too_fast: "Submitted too fast",
  keyword: "Blocked keyword",
  duplicate: "Duplicate content",
  link_flood: "Too many links",
  rate_limited: "Rate limited",
  daily_limit: "Daily limit hit",
  banned_write: "Banned visitor write",
  bad_token: "Bad form token",
  spike: "Vote spike",
}

/** Serious signals get a warm tint; noise (rate limits) stays neutral. */
const SEVERE: AbuseEventType[] = ["honeypot", "banned_write", "spike", "keyword", "link_flood"]

function metaSummary(meta: AbuseEvent["meta"]): string | null {
  if (!meta) return null
  const parts = Object.entries(meta)
    .filter(([, v]) => v !== null && typeof v !== "object")
    .slice(0, 3)
    .map(([k, v]) => `${humanize(k)}: ${String(v)}`)
  return parts.length ? parts.join(" · ") : null
}

type AbuseEventsListProps = {
  events: AbuseEvent[]
  loading: boolean
  error: string | null
  onRetry: () => void
}

export function AbuseEventsList({ events, loading, error, onRetry }: AbuseEventsListProps) {
  if (error && events.length === 0) return <ErrorState message={error} onRetry={onRetry} />
  if (loading && events.length === 0) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }
  if (events.length === 0) {
    return <EmptyState icon={ShieldCheck} title="No abuse events" description="Blocked and suspicious attempts show up here as they happen." />
  }
  return (
    <ul className="divide-y rounded-md border">
      {events.map((event) => {
        const summary = metaSummary(event.meta)
        return (
          <li key={event.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5">
            <Badge
              variant="outline"
              className={SEVERE.includes(event.type) ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400" : undefined}
            >
              {TYPE_LABEL[event.type] ?? humanize(event.type)}
            </Badge>
            <div className="min-w-0 flex-1 text-xs text-muted-foreground">
              {event.visitor_id ? (
                <Link to={`/roadmap-admin/visitors?visitor=${event.visitor_id}`} className="font-mono underline-offset-2 hover:text-foreground hover:underline">
                  {event.visitor_id.slice(0, 8)}
                </Link>
              ) : (
                <span>No visitor</span>
              )}
              {event.ip_hash_short && <span className="font-mono"> · {event.ip_hash_short}</span>}
              {summary && <span> · {summary}</span>}
            </div>
            <time className="shrink-0 text-xs text-muted-foreground" dateTime={event.created_at}>
              {timeAgo(event.created_at)}
            </time>
          </li>
        )
      })}
    </ul>
  )
}
