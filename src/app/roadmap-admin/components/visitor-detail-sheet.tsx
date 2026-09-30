import { useEffect, useState } from "react"
import { Ban, Fingerprint, ShieldCheck, Trash2, UserRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { useRoadmapPermissions } from "../hooks/useRoadmapPermissions"
import { useVisitorsStore } from "../store/visitorsStore"
import { formatDateTime, timeAgo } from "../utils/format"
import type { AdminVisitorDetail } from "../types"
import { BanVisitorDialog } from "./ban-visitor-dialog"
import { BulkRemoveDialog } from "./bulk-remove-dialog"
import { ErrorState } from "./error-state"
import { ModerationBadge } from "./moderation-badge"

type VisitorDetailSheetProps = {
  visitorId: string | null
  onClose: () => void
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

export function VisitorDetailSheet({ visitorId, onClose }: VisitorDetailSheetProps) {
  const selected = useVisitorsStore((s) => s.selected)
  const loading = useVisitorsStore((s) => s.selectedLoading)
  const error = useVisitorsStore((s) => s.selectedError)
  const fetchVisitor = useVisitorsStore((s) => s.fetchVisitor)
  const clearSelected = useVisitorsStore((s) => s.clearSelected)

  useEffect(() => {
    if (visitorId) void fetchVisitor(visitorId)
    else clearSelected()
  }, [visitorId, fetchVisitor, clearSelected])

  const visitor = selected && selected.id === visitorId ? selected : null

  return (
    <Sheet open={visitorId !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        {loading || (!visitor && !error) ? (
          <>
            <SheetHeader className="border-b pe-12">
              <SheetTitle>Visitor</SheetTitle>
              <SheetDescription>Loading visitor…</SheetDescription>
            </SheetHeader>
            <div className="space-y-4 p-6">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </>
        ) : error && !visitor ? (
          <>
            <SheetHeader className="border-b pe-12">
              <SheetTitle>Visitor</SheetTitle>
              <SheetDescription>Something went wrong.</SheetDescription>
            </SheetHeader>
            <div className="p-6">{visitorId && <ErrorState message={error} onRetry={() => void fetchVisitor(visitorId)} />}</div>
          </>
        ) : visitor ? (
          <VisitorBody visitor={visitor} />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

function VisitorBody({ visitor }: { visitor: AdminVisitorDetail }) {
  const { canModerate } = useRoadmapPermissions()
  const unban = useVisitorsStore((s) => s.unban)
  const [banOpen, setBanOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkTarget, setBulkTarget] = useState<{ by: "visitor" | "ip_hash"; value: string } | null>(null)
  const [unbanBusy, setUnbanBusy] = useState(false)

  return (
    <>
      <SheetHeader className="border-b pb-4 pe-12">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <UserRound className="size-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <SheetTitle className="font-mono text-base break-all">{visitor.id}</SheetTitle>
            <SheetDescription asChild>
              <div className="flex flex-wrap items-center gap-2">
                {visitor.is_banned && (
                  <Badge variant="destructive" className="gap-1">
                    <Ban />
                    Banned
                  </Badge>
                )}
                {visitor.is_trusted && (
                  <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                    <ShieldCheck />
                    Trusted
                  </Badge>
                )}
                {visitor.suspicious && (
                  <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    Suspicious
                  </Badge>
                )}
                {visitor.ip_hash_short && (
                  <span className="inline-flex items-center gap-1 font-mono text-xs">
                    <Fingerprint className="size-3" />
                    {visitor.ip_hash_short}
                  </span>
                )}
              </div>
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        {visitor.is_banned && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
            <p className="font-medium text-destructive">Banned {visitor.banned_at ? timeAgo(visitor.banned_at) : ""}</p>
            {visitor.banned_reason && <p className="mt-0.5 text-muted-foreground">{visitor.banned_reason}</p>}
          </div>
        )}

        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Stat label="Posts" value={`${visitor.approved_posts_count}/${visitor.posts_count}`} />
          <Stat label="Comments" value={`${visitor.approved_comments_count}/${visitor.comments_count}`} />
          <Stat label="Votes" value={visitor.votes_count} />
          <Stat label="Same-IP visitors" value={visitor.same_ip_visitors} />
          <Stat label="First seen" value={<span className="text-sm">{formatDateTime(visitor.first_seen_at)}</span>} />
          <Stat label="Last seen" value={<span className="text-sm">{formatDateTime(visitor.last_seen_at)}</span>} />
        </dl>
        <p className="-mt-3 text-xs text-muted-foreground">Posts and comments show approved / total.</p>

        {visitor.same_ip_visitors > 3 && (
          <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
            {visitor.same_ip_visitors} other visitors were seen from this network. That can be a shared office, or one person minting identities.
          </p>
        )}

        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Recent posts</h3>
          {visitor.recent_posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts.</p>
          ) : (
            <ul className="space-y-1.5">
              {visitor.recent_posts.map((p) => (
                <li key={p.id} className="flex items-center gap-2 text-sm">
                  <span className="shrink-0 font-mono text-xs text-muted-foreground">
                    {p.board_slug} #{p.number}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{p.title}</span>
                  <ModerationBadge state={p.moderation_state} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Recent comments</h3>
          {visitor.recent_comments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No comments.</p>
          ) : (
            <ul className="space-y-2">
              {visitor.recent_comments.map((c) => (
                <li key={c.id} className="flex items-start gap-2 rounded-lg border bg-card/40 p-2.5 text-sm">
                  <p className="line-clamp-2 min-w-0 flex-1 break-words">{c.body}</p>
                  <ModerationBadge state={c.moderation_state} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-2">
          <h3 className="text-sm font-semibold">Recent votes</h3>
          {visitor.recent_votes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No votes.</p>
          ) : (
            <ul className="space-y-1.5">
              {visitor.recent_votes.map((v, i) => (
                <li key={`${v.post_id}-${i}`} className="flex items-center gap-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">{v.post_title}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(v.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {canModerate && (
        <div className="flex flex-wrap items-center gap-2 border-t p-4">
          {visitor.is_banned ? (
            <Button
              size="lg"
              variant="outline"
              disabled={unbanBusy}
              onClick={async () => {
                setUnbanBusy(true)
                await unban(visitor.id)
                setUnbanBusy(false)
              }}
            >
              Unban
            </Button>
          ) : (
            <Button size="lg" variant="destructive" className="gap-1.5" onClick={() => setBanOpen(true)}>
              <Ban />
              Ban…
            </Button>
          )}
          <Button
            size="lg"
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              setBulkTarget({ by: "visitor", value: visitor.id })
              setBulkOpen(true)
            }}
          >
            <Trash2 />
            Remove content…
          </Button>
          {visitor.ip_hash && (
            <Button
              size="lg"
              variant="ghost"
              className="gap-1.5"
              onClick={() => {
                setBulkTarget({ by: "ip_hash", value: visitor.ip_hash ?? "" })
                setBulkOpen(true)
              }}
            >
              <Fingerprint />
              Whole network…
            </Button>
          )}
        </div>
      )}

      <BanVisitorDialog open={banOpen} onOpenChange={setBanOpen} visitor={visitor} />
      <BulkRemoveDialog open={bulkOpen} onOpenChange={setBulkOpen} initial={bulkTarget} />
    </>
  )
}
