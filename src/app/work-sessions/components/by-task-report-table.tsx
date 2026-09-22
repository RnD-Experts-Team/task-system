// src/app/work-sessions/components/by-task-report-table.tsx
// "By task" report: one row per linked task (or normalized title) with the
// users who worked on it, outcome counts, completion and date span.

import { useMemo } from "react"
import { ListChecks, RotateCcw } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { ByTaskReport, ByTaskRow } from "../types"
import { formatWorkDate, minutesToHuman } from "../utils/format"
import { CompletionBadge } from "./completion-badge"
import { EmptyState } from "./empty-state"

const MAX_AVATARS = 3

// Two initials from a full name ("John Doe" → "JD")
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Stable key per row regardless of grouping mode
function rowKey(row: ByTaskRow, index: number) {
  return row.task_id !== null ? `task-${row.task_id}` : `title-${row.title ?? index}`
}

/** Stacked avatar fallbacks + "+n" overflow, full names on hover */
function UserStack({ users }: { users: ByTaskRow["users"] }) {
  if (users.length === 0) return <span className="text-muted-foreground">—</span>
  const shown = users.slice(0, MAX_AVATARS)
  const extra = users.length - shown.length
  const names = users.map((u) => u.user_name).join(", ")

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {shown.map((u) => (
              <Avatar key={u.user_id} className="size-6 ring-2 ring-background">
                <AvatarFallback className="text-[9px]">{getInitials(u.user_name)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          {extra > 0 && <span className="ml-1.5 text-xs text-muted-foreground">+{extra}</span>}
          <span className="ml-2 hidden max-w-[160px] truncate text-xs text-muted-foreground xl:inline">
            {names}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{names}</TooltipContent>
    </Tooltip>
  )
}

export function ByTaskReportTable({ report }: { report: ByTaskReport }) {
  const byTask = report.group_by === "task"
  // Occurrences desc so the most-repeated work floats to the top
  const rows = useMemo(() => [...report.rows].sort((a, b) => b.occurrences - a.occurrences), [report.rows])

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={ListChecks}
        title="Nothing to group"
        description={
          byTask
            ? "No items were linked to a project task in the selected period."
            : "No items were recorded in the selected period."
        }
      />
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[220px]">{byTask ? "Task" : "Title"}</TableHead>
            <TableHead className="text-right">Occurrences</TableHead>
            <TableHead className="min-w-[120px]">Users</TableHead>
            <TableHead className="text-right text-emerald-700 dark:text-emerald-400">Done</TableHead>
            <TableHead className="text-right text-amber-700 dark:text-amber-400">Partial</TableHead>
            <TableHead className="text-right text-red-700 dark:text-red-400">Not done</TableHead>
            <TableHead>Completion</TableHead>
            <TableHead className="hidden text-right md:table-cell">Est.</TableHead>
            <TableHead className="hidden text-right md:table-cell">Carried</TableHead>
            <TableHead className="hidden lg:table-cell">First</TableHead>
            <TableHead className="hidden lg:table-cell">Last</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={rowKey(row, i)}>
              <TableCell>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-sm font-medium" title={row.task_name ?? row.title ?? undefined}>
                    {row.task_name ?? row.title ?? "Untitled"}
                  </span>
                  {row.project_name && (
                    <span className="truncate text-xs text-muted-foreground">{row.project_name}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span className="tabular-nums">{row.occurrences}</span>
                <span className="ml-1 text-xs text-muted-foreground">
                  / {row.sessions_count} {row.sessions_count === 1 ? "day" : "days"}
                </span>
              </TableCell>
              <TableCell>
                <UserStack users={row.users} />
              </TableCell>
              <TableCell className="text-right tabular-nums">{row.done}</TableCell>
              <TableCell className="text-right tabular-nums">{row.partial}</TableCell>
              <TableCell className="text-right tabular-nums">{row.not_done}</TableCell>
              <TableCell>
                <CompletionBadge pct={row.completion_pct} />
              </TableCell>
              <TableCell className="hidden text-right tabular-nums text-muted-foreground md:table-cell">
                {minutesToHuman(row.estimated_minutes_total)}
              </TableCell>
              <TableCell className="hidden text-right md:table-cell">
                {row.carried_over_count > 0 ? (
                  <Badge variant="secondary" className="gap-1 tabular-nums">
                    <RotateCcw />
                    {row.carried_over_count}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {row.first_date ? formatWorkDate(row.first_date) : "—"}
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {row.last_date ? formatWorkDate(row.last_date) : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
