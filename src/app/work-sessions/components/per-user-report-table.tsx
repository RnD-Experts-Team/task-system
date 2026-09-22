// src/app/work-sessions/components/per-user-report-table.tsx
// Per-user breakdown for the overview report, sorted by completion % (desc).

import { useMemo } from "react"
import { Trophy, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { PerUserReportRow } from "../types"
import { formatWorkDate, minutesToHuman } from "../utils/format"
import { CompletionBadge } from "./completion-badge"
import { EmptyState } from "./empty-state"

// Two initials from a full name ("John Doe" → "JD")
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Completion desc; users without items (null) sink to the bottom
function byCompletionDesc(a: PerUserReportRow, b: PerUserReportRow) {
  if (a.completion_pct === null && b.completion_pct === null) return 0
  if (a.completion_pct === null) return 1
  if (b.completion_pct === null) return -1
  return b.completion_pct - a.completion_pct
}

export function PerUserReportTable({ rows }: { rows: PerUserReportRow[] }) {
  const sorted = useMemo(() => [...rows].sort(byCompletionDesc), [rows])

  if (sorted.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No user activity"
        description="Nobody logged a work session in the selected period."
      />
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead className="min-w-[180px]">User</TableHead>
            <TableHead className="text-right">Sessions</TableHead>
            <TableHead className="text-right">Items</TableHead>
            <TableHead className="text-right text-emerald-700 dark:text-emerald-400">Done</TableHead>
            <TableHead className="text-right text-amber-700 dark:text-amber-400">Partial</TableHead>
            <TableHead className="text-right text-red-700 dark:text-red-400">Not done</TableHead>
            <TableHead className="hidden text-right md:table-cell">Est. hours</TableHead>
            <TableHead>Completion</TableHead>
            <TableHead className="hidden lg:table-cell">Last date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row, i) => (
            <TableRow key={row.user_id}>
              <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Avatar className="size-7">
                    <AvatarImage src={row.avatar_url ?? undefined} alt={row.user_name} />
                    <AvatarFallback className="text-[9px]">{getInitials(row.user_name)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm font-medium">{row.user_name}</span>
                  {/* Trophy only for the top-ranked user with a real completion */}
                  {i === 0 && row.completion_pct !== null && (
                    <Trophy className="size-3.5 shrink-0 text-amber-500" />
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right tabular-nums">{row.sessions_count}</TableCell>
              <TableCell className="text-right tabular-nums">{row.items_total}</TableCell>
              <TableCell className="text-right tabular-nums">{row.done}</TableCell>
              <TableCell className="text-right tabular-nums">{row.partial}</TableCell>
              <TableCell className="text-right tabular-nums">{row.not_done}</TableCell>
              <TableCell className="hidden text-right tabular-nums text-muted-foreground md:table-cell">
                {minutesToHuman(row.estimated_minutes_total)}
              </TableCell>
              <TableCell>
                <CompletionBadge pct={row.completion_pct} />
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {row.last_work_date ? formatWorkDate(row.last_work_date) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
