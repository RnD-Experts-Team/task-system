// ─── UserAssignedTickets ───────────────────────────────────────────────────────
// Displays a paginated list of support tickets currently assigned TO this user
// (i.e. this user is handling them on behalf of whoever submitted the ticket).
// Endpoint: GET /users/{userId}/tickets/assigned
// Returns null when no data so the section disappears entirely in the detail sheet.
// Renders a leading <Separator /> when it has content, so the sheet's layout
// doesn't need to track per-section visibility.

import { useEffect } from "react"
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  User,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useUsersStore } from "@/app/users/stores/usersStore"
import {
  TICKET_STATUS_LABELS,
  TICKET_TYPE_LABELS,
  TICKET_PRIORITY_LABELS,
  formatTicketDate,
  getRequesterName,
} from "@/app/tickets/types"
import type { ApiTicketStatus, ApiTicketPriority } from "@/app/tickets/types"

// ─── Props ────────────────────────────────────────────────────────────────────
type UserAssignedTicketsProps = {
  /** The user id whose assigned tickets should be loaded */
  userId: string
}

// ─── Status badge ──────────────────────────────────────────────────────────────
// Same colour mapping used in UserRequestedTickets for visual consistency
function StatusBadge({ status }: { status: ApiTicketStatus }) {
  const configs: Record<string, { dot: string; variant: "default" | "secondary" | "outline" }> = {
    open:        { dot: "bg-muted-foreground", variant: "outline" },
    in_progress: { dot: "bg-blue-500",         variant: "secondary" },
    resolved:    { dot: "bg-primary",           variant: "default" },
  }
  const { dot, variant } = configs[status] ?? configs.open
  return (
    <Badge variant={variant} className="whitespace-nowrap">
      <span className={`mr-1.5 inline-block size-2 rounded-full ${dot}`} />
      {TICKET_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}

// ─── Priority badge ─────────────────────────────────────────────────────────────
// Custom Tailwind classes matching the priority colour scale across the app
const PRIORITY_CLASS: Record<string, string> = {
  low:      "bg-slate-100  text-slate-600  border-slate-200  dark:bg-slate-800  dark:text-slate-300",
  medium:   "bg-blue-50    text-blue-600   border-blue-200   dark:bg-blue-950   dark:text-blue-400",
  high:     "bg-orange-50  text-orange-600 border-orange-200 dark:bg-orange-950 dark:text-orange-400",
  critical: "bg-red-50     text-red-600    border-red-200    dark:bg-red-950    dark:text-red-400",
}

function PriorityBadge({ priority }: { priority: ApiTicketPriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap
        ${PRIORITY_CLASS[priority] ?? "bg-muted text-muted-foreground border-muted"}`}
    >
      {TICKET_PRIORITY_LABELS[priority] ?? priority}
    </span>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export function UserAssignedTickets({ userId }: UserAssignedTicketsProps) {
  // Read only the slices we need; avoids triggering the fetchUsers side-effect
  const {
    userAssignedTickets,
    userAssignedTicketsPagination,
    userAssignedTicketsLoading,
    userAssignedTicketsError,
    fetchUserAssignedTickets,
  } = useUsersStore()

  // Fetch page 1 whenever the viewed user changes
  useEffect(() => {
    fetchUserAssignedTickets(userId, 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Navigate to a different page
  const goToPage = (page: number) => fetchUserAssignedTickets(userId, page)

  // ── Loading skeleton (first load, before any data arrives) ──────────────
  if (userAssignedTicketsLoading && !userAssignedTickets) {
    return (
      <>
        {/* Separator separates this section from whatever is above it */}
        <Separator />
        <div className="space-y-2">
          <Skeleton className="h-4 w-44" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-md" />
          ))}
        </div>
      </>
    )
  }

  // ── Error state: show only real failures, not cancelled requests ─────────
  if (userAssignedTicketsError && !userAssignedTickets) {
    return (
      <>
        <Separator />
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <AlertCircle className="size-7 text-destructive" />
          <p className="text-sm text-destructive">{userAssignedTicketsError}</p>
          {/* Retry re-triggers page 1 */}
          <Button variant="outline" size="sm" onClick={() => fetchUserAssignedTickets(userId, 1)}>
            Retry
          </Button>
        </div>
      </>
    )
  }

  // ── Empty / not-yet-loaded: hide section entirely ────────────────────────
  // Returns null so no separator or heading appears when there is no data.
  if (!userAssignedTickets || userAssignedTickets.length === 0) return null

  const pagination = userAssignedTicketsPagination

  return (
    <>
      {/* Separator separates this section from whatever rendered above it */}
      <Separator />

      <div className="space-y-3">
        {/* ── Section heading ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Tickets Assigned
          </h4>
          {/* Total count badge */}
          {pagination && (
            <Badge variant="secondary" className="text-xs">
              {pagination.total}
            </Badge>
          )}
        </div>

        {/* ── Inline error banner when a page navigation fails ─────────── */}
        {userAssignedTicketsError && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p className="text-sm text-destructive">{userAssignedTicketsError}</p>
          </div>
        )}

        {/* ── Card list ─────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {userAssignedTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
            >
              {/* Top row: ticket title + status badge */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  {/* Ticket title (truncated when too long) */}
                  <p className="font-semibold text-sm leading-none truncate">{ticket.title}</p>
                  {/* Ticket type shown as secondary label */}
                  <p className="text-xs text-muted-foreground">
                    {TICKET_TYPE_LABELS[ticket.type] ?? ticket.type}
                  </p>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={ticket.status} />
                </div>
              </div>

              {/* Description preview (capped at 2 lines) */}
              {ticket.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{ticket.description}</p>
              )}

              {/* Footer row: priority + requester name + dates */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <PriorityBadge priority={ticket.priority} />

                {/* Who submitted the ticket (requester) — always present */}
                <span className="flex items-center gap-1">
                  <User className="size-3" />
                  {getRequesterName(ticket)}
                </span>

                {/* Resolved date shown only after the ticket is closed */}
                {ticket.status === "resolved" && ticket.completed_at && (
                  <span className="flex items-center gap-1 border-l border-border pl-3">
                    <CheckCircle2 className="size-3" />
                    {formatTicketDate(ticket.completed_at)}
                  </span>
                )}

                {/* Submission date — always visible */}
                <span className="ml-auto">{formatTicketDate(ticket.created_at)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Pagination controls — only when multiple pages exist ───────── */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {/* Range label e.g. "1–10 of 15" */}
            <span>
              {pagination.from}–{pagination.to} of {pagination.total}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={pagination.current_page <= 1 || userAssignedTicketsLoading}
                onClick={() => goToPage(pagination.current_page - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="px-1">
                {pagination.current_page} / {pagination.last_page}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                disabled={
                  pagination.current_page >= pagination.last_page || userAssignedTicketsLoading
                }
                onClick={() => goToPage(pagination.current_page + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
