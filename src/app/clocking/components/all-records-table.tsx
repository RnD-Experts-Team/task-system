// src/app/clocking/components/all-records-table.tsx
// Table showing ALL employees' clocking records with edit/correction actions.
// Used in the "All Records" tab of the Clocking Manager page.

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  Pencil,
  Coffee,
  MoreHorizontal,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { ClockRecordApiItem, BreakRecord } from "../data"
import { EditSessionDialog } from "./edit-session-dialog"
import { EditBreakDialog } from "./edit-break-dialog"

// ─── Time helpers ─────────────────────────────────────────────────

function formatTime(utc: string | null): string {
  if (!utc) return "—"
  return new Date(utc).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
}

function formatDate(utc: string): string {
  return new Date(utc).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function getDayOfWeek(sessionDate: string): string {
  return new Date(sessionDate + "T12:00:00Z").toLocaleDateString(undefined, {
    weekday: "short",
    timeZone: "UTC",
  })
}

function calcBreakSeconds(breaks: BreakRecord[]): number {
  return breaks.reduce((acc, br) => {
    if (!br.break_end_utc) return acc
    return acc + (new Date(br.break_end_utc).getTime() - new Date(br.break_start_utc).getTime()) / 1000
  }, 0)
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

function calcWorkSeconds(session: ClockRecordApiItem): number {
  const end = session.clock_out_utc ? new Date(session.clock_out_utc).getTime() : Date.now()
  const start = new Date(session.clock_in_utc).getTime()
  const breakMs = calcBreakSeconds(session.break_records) * 1000
  return Math.max(0, (end - start - breakMs) / 1000)
}

// ─── Status badge ──────────────────────────────────────────────────

function StatusBadge({ status }: { status: ClockRecordApiItem["status"] }) {
  const config = {
    active:    { label: "Active",    Icon: Clock,         cls: "text-primary" },
    on_break:  { label: "On Break",  Icon: Coffee,        cls: "text-orange-400" },
    completed: { label: "Completed", Icon: CheckCircle,   cls: "text-muted-foreground" },
  }[status] ?? { label: status, Icon: AlertTriangle, cls: "text-destructive" }

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide", config.cls)}>
      <config.Icon className="size-3.5" />
      {config.label}
    </span>
  )
}

// ─── Props ─────────────────────────────────────────────────────────

interface AllRecordsTableProps {
  records: ClockRecordApiItem[]
  /** Called after a session is successfully edited so the parent can refresh */
  onSessionUpdated: (updated: ClockRecordApiItem) => void
  /** Called after a break is edited so the parent can refresh */
  onBreakUpdated: (sessionId: number, updated: BreakRecord) => void
}

// ─── Component ─────────────────────────────────────────────────────

export function AllRecordsTable({ records, onSessionUpdated, onBreakUpdated }: AllRecordsTableProps) {
  // Controls which session's breaks are expanded inline
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(new Set())

  // Edit session dialog state
  const [editSession, setEditSession] = useState<ClockRecordApiItem | null>(null)
  const [editSessionOpen, setEditSessionOpen] = useState(false)

  // Edit break dialog state
  const [editBreak, setEditBreak] = useState<BreakRecord | null>(null)
  const [editBreakOpen, setEditBreakOpen] = useState(false)

  // Toggle break rows for a given session
  function toggleBreaks(sessionId: number) {
    setExpandedSessions((prev) => {
      const next = new Set(prev)
      if (next.has(sessionId)) next.delete(sessionId)
      else next.add(sessionId)
      return next
    })
  }

  // Open edit dialogs
  function openEditSession(session: ClockRecordApiItem) {
    setEditSession(session)
    setEditSessionOpen(true)
  }

  function openEditBreak(br: BreakRecord) {
    setEditBreak(br)
    setEditBreakOpen(true)
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border/10 bg-card/40 py-16">
        <p className="text-sm text-muted-foreground">No records found.</p>
      </div>
    )
  }

  return (
    <>
      {/* ── Desktop table ─────────────────────────────────────── */}
      <div className="hidden overflow-hidden rounded-2xl border border-border/10 bg-card/40 md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-border/10">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Employee</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Date</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Clock In</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Clock Out</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Work</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Break</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest">Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((session) => {
              const isExpanded = expandedSessions.has(session.id)
              const breakSecs = calcBreakSeconds(session.break_records)
              const workSecs = calcWorkSeconds(session)

              return (
                <>
                  {/* Main session row */}
                  <TableRow key={session.id} className="border-border/10 hover:bg-muted/20">
                    {/* Employee */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 rounded-lg">
                          <AvatarFallback className="rounded-lg bg-primary/10 text-xs font-bold text-primary">
                            {(session.user?.name ?? "?")
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold leading-tight">
                            {session.user?.name ?? `User #${session.user_id}`}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {session.user?.email ?? ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div className="size-1.5 rounded-full bg-primary" />
                        <span className="text-sm">{formatDate(session.clock_in_utc)}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {getDayOfWeek(session.session_date)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Times */}
                    <TableCell className="font-mono text-sm">{formatTime(session.clock_in_utc)}</TableCell>
                    <TableCell className="font-mono text-sm">{formatTime(session.clock_out_utc)}</TableCell>

                    {/* Durations */}
                    <TableCell className="text-sm font-medium">{formatDuration(workSecs)}</TableCell>
                    <TableCell>
                      {session.break_records.length > 0 ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto gap-1 p-0 text-[11px] font-bold text-orange-400 hover:text-orange-300"
                          onClick={() => toggleBreaks(session.id)}
                        >
                          {formatDuration(breakSecs)}
                          <ChevronDown className={cn("size-3 transition-transform", isExpanded && "rotate-180")} />
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell><StatusBadge status={session.status} /></TableCell>

                    {/* Actions */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditSession(session)}>
                            <Pencil className="mr-2 size-3.5" />
                            Edit Session
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  {/* Expanded break rows */}
                  {isExpanded && session.break_records.map((br) => (
                    <TableRow key={`break-${br.id}`} className="bg-orange-400/5 border-orange-400/10">
                      <TableCell />
                      <TableCell colSpan={2}>
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-orange-400">
                          <Coffee className="size-3" />
                          Break #{br.id}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-[11px]">
                        {formatTime(br.break_start_utc)} – {formatTime(br.break_end_utc)}
                      </TableCell>
                      <TableCell colSpan={2}>
                        {br.description && (
                          <span className="text-[11px] text-muted-foreground">{br.description}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={br.status === "active" ? "active" : "completed"} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          onClick={() => openEditBreak(br)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* ── Mobile cards ──────────────────────────────────────── */}
      <div className="space-y-3 md:hidden">
        {records.map((session) => {
          const isExpanded = expandedSessions.has(session.id)
          const breakSecs = calcBreakSeconds(session.break_records)
          const workSecs = calcWorkSeconds(session)

          return (
            <div key={session.id} className="rounded-2xl border border-border/10 bg-card/40 p-4">
              {/* Employee + status */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-9 rounded-xl">
                    <AvatarFallback className="rounded-xl bg-primary/10 text-xs font-bold text-primary">
                      {(session.user?.name ?? "?")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{session.user?.name ?? `User #${session.user_id}`}</p>
                    <p className="text-[11px] text-muted-foreground">{session.user?.email ?? ""}</p>
                  </div>
                </div>
                <StatusBadge status={session.status} />
              </div>

              {/* Date + times */}
              <div className="mb-3 grid grid-cols-3 gap-2 rounded-lg bg-muted/20 p-3">
                <div>
                  <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Date</p>
                  <p className="text-xs font-medium">{formatDate(session.clock_in_utc)}</p>
                </div>
                <div>
                  <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">In</p>
                  <p className="font-mono text-xs font-medium">{formatTime(session.clock_in_utc)}</p>
                </div>
                <div>
                  <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Out</p>
                  <p className="font-mono text-xs font-medium">{formatTime(session.clock_out_utc)}</p>
                </div>
              </div>

              {/* Work + break durations */}
              <div className="mb-3 flex items-center gap-4">
                <span className="text-[11px] text-muted-foreground">
                  Work: <span className="font-bold text-foreground">{formatDuration(workSecs)}</span>
                </span>
                {session.break_records.length > 0 && (
                  <span className="text-[11px] text-muted-foreground">
                    Break: <span className="font-bold text-orange-400">{formatDuration(breakSecs)}</span>
                  </span>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between border-t border-border/10 pt-3">
                {session.break_records.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto gap-1 p-0 text-[11px] text-orange-400"
                    onClick={() => toggleBreaks(session.id)}
                  >
                    <Coffee className="size-3" />
                    {isExpanded ? "Hide" : "Show"} Breaks ({session.break_records.length})
                    <ChevronDown className={cn("size-3 transition-transform", isExpanded && "rotate-180")} />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto gap-1.5 text-xs"
                  onClick={() => openEditSession(session)}
                >
                  <Pencil className="size-3" />
                  Edit
                </Button>
              </div>

              {/* Expanded breaks on mobile */}
              {isExpanded && (
                <div className="mt-3 space-y-2 border-t border-orange-400/10 pt-3">
                  {session.break_records.map((br) => (
                    <div key={br.id} className="flex items-center justify-between rounded-lg bg-orange-400/5 px-3 py-2">
                      <div>
                        <p className="text-[11px] font-bold text-orange-400">Break #{br.id}</p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {formatTime(br.break_start_utc)} – {formatTime(br.break_end_utc)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => openEditBreak(br)}
                      >
                        <Pencil className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Edit dialogs ──────────────────────────────────────── */}
      <EditSessionDialog
        session={editSession}
        open={editSessionOpen}
        onOpenChange={setEditSessionOpen}
        onSaved={onSessionUpdated}
      />

      <EditBreakDialog
        breakRecord={editBreak}
        open={editBreakOpen}
        onOpenChange={setEditBreakOpen}
        onSaved={(updated) => {
          if (editBreak) onBreakUpdated(editBreak.clock_session_id, updated)
        }}
      />
    </>
  )
}
