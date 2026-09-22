import type { ReactNode } from "react"
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Link2,
  ListChecks,
  RotateCcw,
  StickyNote,
  Timer,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import type { WorkSession, WorkSessionItem } from "../types"
import { formatDateTime, formatWorkDate, minutesToHuman, sumEstimatedMinutes } from "../utils/format"
import { OutcomeBadge } from "./outcome-badge"
import { PriorityBadge } from "./priority-badge"
import { SessionStatusBadge } from "./session-status-badge"

type SessionDetailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  session: WorkSession | null
  loading?: boolean
  error?: string | null
  /** Rendered next to the status badge in the header (e.g. admin Reopen) */
  headerActions?: ReactNode
  /** Rendered in the sheet footer (e.g. "Review & confirm" for open sessions) */
  footer?: ReactNode
}

// Two initials from a full name ("John Doe" → "JD")
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/** One key/value line in the header metadata block */
function MetaRow({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium text-foreground">{value}</span>
    </div>
  )
}

/** Read-only item row used inside the sheet */
function ReadonlyItem({ item, index }: { item: WorkSessionItem; index: number }) {
  return (
    <li className="rounded-lg border bg-card/40 p-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[10px] text-muted-foreground">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium leading-tight text-foreground">{item.title}</p>
            {item.carried_from_item_id && (
              <Badge variant="secondary" className="gap-1">
                <RotateCcw />
                Carried over
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <OutcomeBadge outcome={item.outcome} />
            <PriorityBadge priority={item.priority} />
            {item.estimated_minutes !== null && (
              <span className="inline-flex items-center gap-1 text-[0.625rem] text-muted-foreground">
                <Timer className="size-3" />
                {minutesToHuman(item.estimated_minutes)}
              </span>
            )}
          </div>

          {item.task && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Link2 className="size-3" />
              <span className="truncate">{item.task.name}</span>
            </p>
          )}

          {item.description && (
            <p className="whitespace-pre-wrap text-xs text-muted-foreground">{item.description}</p>
          )}

          {item.outcome_note && (
            <p className="rounded-md border border-dashed bg-muted/40 px-2 py-1.5 text-xs italic text-muted-foreground">
              {item.outcome_note}
            </p>
          )}
        </div>
      </div>
    </li>
  )
}

/** Header + items + summary skeleton while the session is loading */
function SheetSkeleton() {
  return (
    <div className="space-y-4 px-6">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-2/5" />
      <Separator />
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  )
}

/** Read-only detail view of a work session (shared by employee History and admin lists) */
export function SessionDetailSheet({
  open,
  onOpenChange,
  session,
  loading = false,
  error,
  headerActions,
  footer,
}: SessionDetailSheetProps) {
  const items = session?.items ?? []
  const totalEstimate = sumEstimatedMinutes(items)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        {/* ── Header ── */}
        <SheetHeader className="border-b pb-4 pr-12">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <CalendarDays className="size-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <SheetTitle className="text-base">
                {session ? formatWorkDate(session.work_date) : "Work session"}
              </SheetTitle>
              <SheetDescription>
                {session
                  ? `${items.length} item${items.length === 1 ? "" : "s"} · ${
                      totalEstimate > 0 ? `${minutesToHuman(totalEstimate)} estimated` : "no estimates"
                    }`
                  : "Session details"}
              </SheetDescription>
            </div>
          </div>

          {session && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <SessionStatusBadge status={session.status} />
              {headerActions}
            </div>
          )}
        </SheetHeader>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto py-4">
          {loading && <SheetSkeleton />}

          {!loading && error && (
            <div className="mx-6 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && session && (
            <div className="space-y-5 px-6">
              {/* User (present on admin responses) */}
              {session.user && (
                <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarImage src={session.user.avatar_url ?? undefined} alt={session.user.name} />
                    <AvatarFallback className="text-xs">{getInitials(session.user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{session.user.name}</p>
                    {session.user.email && (
                      <p className="truncate text-xs text-muted-foreground">{session.user.email}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Timeline metadata */}
              <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                <MetaRow icon={Clock} label="Started" value={formatDateTime(session.started_at)} />
                <MetaRow icon={CheckCircle2} label="Confirmed" value={formatDateTime(session.confirmed_at)} />
                {session.reopened_at && (
                  <MetaRow
                    icon={RotateCcw}
                    label={
                      session.reopened_by_user ? `Reopened by ${session.reopened_by_user.name}` : "Reopened"
                    }
                    value={formatDateTime(session.reopened_at)}
                  />
                )}
              </div>

              {/* Summary note */}
              <section className="space-y-2">
                <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <StickyNote className="size-3.5" />
                  Summary
                </h4>
                {session.summary_note ? (
                  <p className="whitespace-pre-wrap rounded-lg border bg-card/40 p-3 text-sm">
                    {session.summary_note}
                  </p>
                ) : (
                  <p className="text-xs italic text-muted-foreground">No summary written.</p>
                )}
              </section>

              {/* Items */}
              <section className="space-y-2">
                <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <ListChecks className="size-3.5" />
                  Items
                  <Badge variant="secondary" className="ml-auto">
                    {items.length}
                  </Badge>
                </h4>
                {items.length === 0 ? (
                  <p className="text-xs italic text-muted-foreground">No items were planned for this day.</p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((item, index) => (
                      <ReadonlyItem key={item.id} item={item} index={index} />
                    ))}
                  </ul>
                )}
              </section>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        {footer && <SheetFooter className="mt-0 border-t">{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  )
}
