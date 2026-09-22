import type { ReactNode } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { WorkSessionWithCounts } from "../types"
import { formatDateTime, formatWorkDate } from "../utils/format"
import { CompletionBadge } from "./completion-badge"
import { SessionStatusBadge } from "./session-status-badge"

type SessionTableProps = {
  sessions: WorkSessionWithCounts[]
  /** Show the user column (admin lists) */
  showUser?: boolean
  /** Row click handler — rows become clickable when provided */
  onRowClick?: (session: WorkSessionWithCounts) => void
  /** Per-row actions rendered in the last column */
  rowActions?: (session: WorkSessionWithCounts) => ReactNode
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

/** Small colored counter used for the done / partial / not-done mini stats */
function MiniCounter({ value, label, className }: { value: number; label: string; className: string }) {
  return (
    <span
      title={label}
      className={cn(
        "inline-flex h-5 min-w-7 items-center justify-center gap-1 rounded-full border px-1.5 text-[0.625rem] font-medium tabular-nums",
        className
      )}
    >
      {value}
    </span>
  )
}

/** Session list table shared by History (employee) and All Sessions (admin) */
export function SessionTable({ sessions, showUser = false, onRowClick, rowActions }: SessionTableProps) {
  const clickable = !!onRowClick

  return (
    <div className="w-full overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[160px]">Date</TableHead>
            {showUser && <TableHead className="min-w-[160px]">User</TableHead>}
            <TableHead>Items</TableHead>
            <TableHead className="hidden md:table-cell">Outcomes</TableHead>
            <TableHead>Completion</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden sm:table-cell">Confirmed</TableHead>
            {rowActions && <TableHead className="w-10 text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow
              key={session.id}
              className={cn("group", clickable && "cursor-pointer")}
              onClick={clickable ? () => onRowClick(session) : undefined}
            >
              {/* Work date */}
              <TableCell className="py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">
                    {formatWorkDate(session.work_date)}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">#{session.id}</span>
                </div>
              </TableCell>

              {/* User (admin lists only) */}
              {showUser && (
                <TableCell className="py-3">
                  {session.user ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="size-7">
                        <AvatarImage src={session.user.avatar_url ?? undefined} alt={session.user.name} />
                        <AvatarFallback className="text-[10px]">{getInitials(session.user.name)}</AvatarFallback>
                      </Avatar>
                      <span className="truncate text-sm">{session.user.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
              )}

              {/* Items count */}
              <TableCell className="py-3 tabular-nums">{session.items_count}</TableCell>

              {/* Mini outcome counters */}
              <TableCell className="hidden py-3 md:table-cell">
                <div className="flex items-center gap-1.5">
                  <MiniCounter
                    value={session.done_count}
                    label="Done"
                    className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                  />
                  <MiniCounter
                    value={session.partial_count}
                    label="Partial"
                    className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                  />
                  <MiniCounter
                    value={session.not_done_count}
                    label="Not done"
                    className="bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30"
                  />
                  {session.pending_count > 0 && (
                    <MiniCounter
                      value={session.pending_count}
                      label="Pending"
                      className="bg-muted text-muted-foreground border-border"
                    />
                  )}
                </div>
              </TableCell>

              {/* Completion % */}
              <TableCell className="py-3">
                <CompletionBadge pct={session.completion_pct} />
              </TableCell>

              {/* Status */}
              <TableCell className="py-3">
                <SessionStatusBadge status={session.status} />
              </TableCell>

              {/* Confirmed at */}
              <TableCell className="hidden py-3 text-muted-foreground sm:table-cell">
                {formatDateTime(session.confirmed_at)}
              </TableCell>

              {/* Actions — stop propagation so menu clicks don't trigger the row */}
              {rowActions && (
                <TableCell className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end">{rowActions(session)}</div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
