// src/app/clocking/records/page.tsx
// Clocking Records page — shows the authenticated user's session history.
//
// Features:
//  1. Fetches records from GET /clocking/records (server-side pagination + date filter)
//  2. Fetches pending corrections from GET /clocking/pending-corrections
//  3. Export button opens a date-range dialog → POST /clocking/export (ZIP download)
//  4. "Correct" button on each row opens the correction dialog →
//     POST /clocking/correction-request → new entry appears in the Corrections tab
//  5. Two tabs: "Records" (main table) and "Corrections" (user's own requests)
//  6. Subscribes to the clocking WebSocket channel to refresh data when sessions update

import { useState, useMemo, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DateInput } from "@/components/ui/date-input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/pagination"
import {
  Share,
  CheckCircle,
  AlertTriangle,
  Clock,
  Loader2,
  AlertCircle,
  HistoryIcon,
  Shield,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { isCancel } from "axios"
import type { ClockRecordApiItem, ClockingRecordStatus, PendingCorrectionApiItem } from "../data"
import { CorrectionRequestDialog } from "../components/correction-request-dialog"
import { ExportDialog } from "../components/export-dialog"
import { clockingService } from "@/services/clockingService"
import { useClockingChannel } from "@/hooks/useClockingChannel"
import { useAuthStore } from "@/app/(auth)/stores/authStore"
import { toast } from "sonner"

// ─── Status display config ────────────────────────────────────────

const statusConfig: Record<
  ClockingRecordStatus,
  { label: string; icon: typeof CheckCircle; className: string }
> = {
  verified:    { label: "Verified",    icon: CheckCircle,  className: "text-primary" },
  discrepancy: { label: "Discrepancy", icon: AlertTriangle, className: "text-destructive" },
  pending:     { label: "Pending",     icon: Clock,         className: "text-muted-foreground" },
}

// Map API session status → UI display status
// Sessions with a pending correction are flagged as "discrepancy"
function resolveRecordStatus(
  session: ClockRecordApiItem,
  correctionSessionIds: Set<number>
): ClockingRecordStatus {
  if (correctionSessionIds.has(session.id)) return "discrepancy"
  if (session.status === "completed") return "verified"
  return "pending" // active or on_break
}

// ─── Status badge ─────────────────────────────────────────────────

function StatusBadge({ status }: { status: ClockingRecordStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide",
        config.className
      )}
    >
      <Icon className="size-3.5" />
      {config.label}
    </span>
  )
}

// ─── Work time indicator dot ──────────────────────────────────────

function WorkTimeDot({ status }: { status: ClockingRecordStatus }) {
  return (
    <div
      className={cn(
        "size-1.5 rounded-full",
        status === "discrepancy" ? "bg-destructive" : "bg-primary"
      )}
    />
  )
}

// ─── Correction type badge used in the Corrections tab ───────────

const correctionTypeLabelMap: Record<string, string> = {
  clock_in:  "Clock In",
  clock_out: "Clock Out",
  break_in:  "Break Start",
  break_out: "Break End",
}

const correctionStatusConfig = {
  pending:  { label: "Pending",  className: "text-muted-foreground" },
  approved: { label: "Approved", className: "text-primary" },
  rejected: { label: "Rejected", className: "text-destructive" },
}

// ─── Time formatting helpers ──────────────────────────────────────

/** Format a UTC ISO string as a local time string, e.g. "09:45 AM" */
function formatTime(utcString: string | null): string {
  if (!utcString) return "—"
  return new Date(utcString).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** Format a UTC ISO string as a local date string, e.g. "Oct 24, 2023" */
function formatDate(utcString: string): string {
  return new Date(utcString).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/** Get short day-of-week name from a session_date (YYYY-MM-DD) */
function getDayOfWeek(sessionDate: string): string {
  return new Date(sessionDate + "T12:00:00Z").toLocaleDateString(undefined, {
    weekday: "long",
    timeZone: "UTC",
  })
}

/** Calculate total break seconds from an array of break records */
function calcBreakSeconds(breaks: ClockRecordApiItem["break_records"]): number {
  return breaks.reduce((acc, br) => {
    if (!br.break_end_utc) return acc
    return acc + (new Date(br.break_end_utc).getTime() - new Date(br.break_start_utc).getTime()) / 1000
  }, 0)
}

/** Format a duration in seconds to "Xh Ym" or "Ym" */
function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

/** Calculate net work seconds (clock duration minus breaks) */
function calcWorkSeconds(session: ClockRecordApiItem): number {
  const endTime = session.clock_out_utc
    ? new Date(session.clock_out_utc).getTime()
    : Date.now()
  const start = new Date(session.clock_in_utc).getTime()
  const totalMs = endTime - start
  const breakMs = calcBreakSeconds(session.break_records) * 1000
  return Math.max(0, (totalMs - breakMs) / 1000)
}

/** Sum total work hours across all sessions for the quick summary */
function calcTotalHours(sessions: ClockRecordApiItem[]): string {
  const totalSeconds = sessions.reduce((acc, s) => acc + calcWorkSeconds(s), 0)
  const hours = (totalSeconds / 3600).toFixed(1)
  return hours
}

// ─── Main page component ──────────────────────────────────────────

export default function ClockingRecordsPage() {
  // ── Filter state (driven by the filter bar at the top) ──────────
  const [statusFilter, setStatusFilter] = useState<ClockingRecordStatus | "all">("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  // ── Server-side pagination state ────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1)
  const PER_PAGE = 15

  // ── Records API state ───────────────────────────────────────────
  const [records, setRecords] = useState<ClockRecordApiItem[]>([])
  const [pagination, setPagination] = useState({
    total: 0, last_page: 1, from: 0, to: 0,
  })
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [recordsError, setRecordsError] = useState<string | null>(null)

  // ── Corrections API state ───────────────────────────────────────
  const [corrections, setCorrections] = useState<PendingCorrectionApiItem[]>([])
  const [loadingCorrections, setLoadingCorrections] = useState(false)

  // ── Dialog state ────────────────────────────────────────────────
  const [correctionRecord, setCorrectionRecord] = useState<ClockRecordApiItem | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

  // ── Tab state (Records | Corrections) ───────────────────────────
  const [activeTab, setActiveTab] = useState<"records" | "corrections">("records")

  // ── Current user (for WebSocket channel subscription) ───────────
  const user = useAuthStore((s) => s.user)

  // ── Derived: session IDs that have a pending correction ─────────
  // Used to flag records as "discrepancy" in the table
  const correctionSessionIds = useMemo(
    () =>
      new Set(
        corrections
          .filter((c) => c.status === "pending" && c.clock_session_id !== null)
          .map((c) => c.clock_session_id as number)
      ),
    [corrections]
  )

  // ── Apply UI status filter client-side ──────────────────────────
  // Records are fetched server-side (date + pagination); status filter is local
  const filteredRecords = useMemo(() => {
    if (statusFilter === "all") return records
    return records.filter(
      (r) => resolveRecordStatus(r, correctionSessionIds) === statusFilter
    )
  }, [records, statusFilter, correctionSessionIds])

  // ── Fetch records from API ───────────────────────────────────────
  const fetchRecords = useCallback(async () => {
    setLoadingRecords(true)
    setRecordsError(null)
    try {
      const { records: data, pagination: pg } = await clockingService.getRecords({
        start_date: startDate || null,
        end_date:   endDate   || null,
        per_page:   PER_PAGE,
        page:       currentPage,
      })
      setRecords(data)
      setPagination({
        total:     pg.total,
        last_page: pg.last_page,
        from:      pg.from ?? 0,
        to:        pg.to   ?? 0,
      })
    } catch (err) {
      if (!isCancel(err)) {
        setRecordsError("Failed to load clocking records. Please try again.")
      }
    } finally {
      setLoadingRecords(false)
    }
  }, [startDate, endDate, currentPage])

  // ── Fetch user's correction requests ───────────────────────────
  const fetchCorrections = useCallback(async () => {
    setLoadingCorrections(true)
    try {
      const data = await clockingService.getPendingCorrections()
      setCorrections(data)
    } catch (err) {
      if (!isCancel(err)) {
        // Non-critical; silently fail (records still visible)
        toast.error("Could not load correction requests.")
      }
    } finally {
      setLoadingCorrections(false)
    }
  }, [])

  // Initial load and re-fetch when filters or page change
  useEffect(() => { fetchRecords() }, [fetchRecords])
  useEffect(() => { fetchCorrections() }, [fetchCorrections])

  // ── WebSocket: refresh records when a session is updated ────────
  // Uses the existing useClockingChannel hook (subscribes to clocking.manager channel).
  // When a correction is approved/rejected the session broadcasts an update.
  useClockingChannel(user?.id ?? null, () => {
    fetchRecords()
    fetchCorrections()
  })

  // ── Handler: open correction dialog for a row ───────────────────
  function handleCorrect(record: ClockRecordApiItem) {
    setCorrectionRecord(record)
    setDialogOpen(true)
  }

  // ── Handler: correction submitted successfully ──────────────────
  // Prepend the new correction to the list and switch to the corrections tab
  function handleCorrectionSubmit(correction: PendingCorrectionApiItem) {
    setCorrections((prev) => [correction, ...prev])
    setActiveTab("corrections")
    toast.success("Correction request submitted. Redirecting to corrections tab.")
  }

  // ── Reset to page 1 when filters change ─────────────────────────
  function handleFilterChange(fn: () => void) {
    fn()
    setCurrentPage(1)
  }

  // ── Summary: total hours for visible records ─────────────────────
  const totalHours = useMemo(() => calcTotalHours(records), [records])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-6 sm:px-6 lg:px-8">

        {/* ── Page Header ─────────────────────────────────────── */}
        <header className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Time Management
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
              Clocking Records
            </h1>
            <p className="max-w-lg text-sm text-muted-foreground">
              Review and manage detailed logs of your working hours, breaks, and session statuses.
            </p>
          </div>
          {/* Export button — opens date-range dialog before downloading ZIP */}
          <Button
            variant="outline"
            className="gap-2 self-start"
            onClick={() => setExportOpen(true)}
          >
            <Share className="size-3.5" />
            Export Records
          </Button>
        </header>

        {/* ── Filter Bar ──────────────────────────────────────── */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-4">

          {/* Date Range */}
          <div className="sm:col-span-2 rounded-xl border border-border/20 bg-card/40 p-4">
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Date Range Selection
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap min-w-0">
              <DateInput
                value={startDate}
                onChange={(e) =>
                  handleFilterChange(() => setStartDate(e.target.value))
                }
                className="w-full sm:flex-1 sm:min-w-60 min-w-0 rounded-lg border-none bg-muted/50 px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              />
              <span className="text-muted-foreground text-xs self-center sm:self-auto">to</span>
              <DateInput
                value={endDate}
                onChange={(e) =>
                  handleFilterChange(() => setEndDate(e.target.value))
                }
                className="w-full sm:flex-1 sm:min-w-60 min-w-0 rounded-lg border-none bg-muted/50 px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Status Filter (client-side) */}
          <div className="rounded-xl border border-border/20 bg-card/40 p-4">
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Status Filter
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between rounded-lg border-none bg-muted/50 px-3 py-2 text-sm text-left focus:ring-1 focus:ring-primary"
                >
                  <span className="text-sm font-bold">
                    {statusFilter === "all"
                      ? "All Statuses"
                      : statusConfig[statusFilter].label}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuItem onClick={() => handleFilterChange(() => setStatusFilter("all"))}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange(() => setStatusFilter("verified"))}>
                  Verified
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange(() => setStatusFilter("discrepancy"))}>
                  Discrepancy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange(() => setStatusFilter("pending"))}>
                  Pending
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Quick summary — total hours for current date range */}
          <div className="rounded-xl border border-border/20 bg-card/40 p-4">
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Quick Summary
            </label>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tighter text-primary">
                {loadingRecords ? "…" : totalHours}
              </span>
              <span className="text-[10px] font-bold uppercase text-muted-foreground">
                Total Hours
              </span>
            </div>
          </div>
        </div>

        {/* ── Tabs: Records | Corrections ──────────────────────── */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="mb-4">
            <TabsTrigger value="records">Records</TabsTrigger>
            <TabsTrigger value="corrections" className="gap-1.5">
              Corrections
              {/* Badge shows count of pending corrections */}
              {corrections.filter((c) => c.status === "pending").length > 0 && (
                <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 h-4">
                  {corrections.filter((c) => c.status === "pending").length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Records Tab ──────────────────────────────────── */}
          <TabsContent value="records">

            {/* Error state */}
            {recordsError && (
              <div className="mb-4 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
                <AlertCircle className="size-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{recordsError}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto gap-1.5 text-destructive hover:bg-destructive/10"
                  onClick={fetchRecords}
                >
                  <RefreshCw className="size-3.5" />
                  Retry
                </Button>
              </div>
            )}

            {/* Records table */}
            <div className="overflow-hidden rounded-2xl border border-border/10 bg-card/40 shadow-xl">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Clock In</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Clock Out</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Work Time</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Break Time</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Breaks</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Loading skeleton rows */}
                    {loadingRecords && records.length === 0 &&
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i} className="animate-pulse">
                          {Array.from({ length: 8 }).map((_, j) => (
                            <TableCell key={j}>
                              <div className="h-4 rounded bg-muted/50" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}

                    {/* Empty state */}
                    {!loadingRecords && filteredRecords.length === 0 && !recordsError && (
                      <TableRow>
                        <TableCell colSpan={8} className="py-12 text-center">
                          <p className="text-sm font-bold text-muted-foreground">
                            No records found
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Try adjusting the date range or status filter.
                          </p>
                        </TableCell>
                      </TableRow>
                    )}

                    {/* Data rows */}
                    {filteredRecords.map((record) => (
                      <RecordRow
                        key={record.id}
                        record={record}
                        correctionSessionIds={correctionSessionIds}
                        onCorrect={handleCorrect}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination footer */}
              <div className="flex flex-col items-center justify-between gap-3 border-t border-border/10 px-4 py-3 sm:flex-row sm:px-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {loadingRecords
                    ? "Loading…"
                    : `Showing ${pagination.from}–${pagination.to} of ${pagination.total} Records`}
                </p>
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.last_page}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>

            {/* Efficiency insights card (static analytics teaser) */}
            <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="group relative overflow-hidden rounded-2xl border border-border/10 bg-card/40 p-6 backdrop-blur-xl">
                <div className="absolute -bottom-8 -right-8 size-48 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />
                <h3 className="mb-3 text-xl font-black italic tracking-tighter">Efficiency Insights</h3>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  Your consistency over the last 30 days is{" "}
                  <span className="font-bold text-primary">94%</span>. Most of your clock-ins occur
                  within a 10-minute window of 09:00 AM.
                </p>
                <div className="flex gap-3">
                  <div className="flex-1 rounded-xl border-l-2 border-primary bg-muted/30 p-3">
                    <span className="block text-[10px] font-bold uppercase text-muted-foreground">Avg Break</span>
                    <span className="text-lg font-black tracking-tight">42 min</span>
                  </div>
                  <div className="flex-1 rounded-xl border-l-2 border-primary bg-muted/30 p-3">
                    <span className="block text-[10px] font-bold uppercase text-muted-foreground">Overtime</span>
                    <span className="text-lg font-black tracking-tight">12h 15m</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── Corrections Tab ───────────────────────────────── */}
          <TabsContent value="corrections">
            <div className="space-y-4">
              {/* Tab header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black tracking-tight">Your Correction Requests</h2>
                  <p className="text-xs text-muted-foreground">
                    All time-correction requests you have submitted.
                  </p>
                </div>
                {/* Reload button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={fetchCorrections}
                  disabled={loadingCorrections}
                >
                  {loadingCorrections
                    ? <Loader2 className="size-3.5 animate-spin" />
                    : <RefreshCw className="size-3.5" />}
                  Refresh
                </Button>
              </div>

              {/* Loading state */}
              {loadingCorrections && corrections.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* Empty state */}
              {!loadingCorrections && corrections.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-border/10 bg-card/40 py-14 text-center">
                  <HistoryIcon className="mb-3 size-8 text-muted-foreground/40" />
                  <p className="text-sm font-bold text-muted-foreground">No correction requests yet</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Click "Correct" on any record row to submit a request.
                  </p>
                </div>
              )}

              {/* Correction cards */}
              {corrections.map((correction) => (
                <CorrectionCard key={correction.id} correction={correction} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Export Dialog ──────────────────────────────────────── */}
      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />

      {/* ── Correction Request Dialog ──────────────────────────── */}
      <CorrectionRequestDialog
        record={correctionRecord}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCorrectionSubmit}
      />
    </div>
  )
}

// ─── RecordRow ────────────────────────────────────────────────────
// A single row in the records table, derived from a real ClockRecordApiItem.

function RecordRow({
  record,
  correctionSessionIds,
  onCorrect,
}: {
  record: ClockRecordApiItem
  correctionSessionIds: Set<number>
  onCorrect: (record: ClockRecordApiItem) => void
}) {
  const status = resolveRecordStatus(record, correctionSessionIds)
  const breakSeconds = calcBreakSeconds(record.break_records)
  const workSeconds  = calcWorkSeconds(record)

  return (
    <TableRow className="group transition-colors hover:bg-muted/20">
      {/* Date + day of week */}
      <TableCell className="py-4">
        <span className="text-sm font-bold">{formatDate(record.session_date)}</span>
        <p className="text-[10px] uppercase tracking-tighter text-muted-foreground">
          {getDayOfWeek(record.session_date)}
        </p>
      </TableCell>

      {/* Clock in / out */}
      <TableCell className="text-sm font-medium">{formatTime(record.clock_in_utc)}</TableCell>
      <TableCell className="text-sm font-medium">{formatTime(record.clock_out_utc)}</TableCell>

      {/* Work time */}
      <TableCell>
        <div className="flex items-center gap-2">
          <WorkTimeDot status={status} />
          <span className="text-sm font-bold tracking-tight">{formatDuration(workSeconds)}</span>
        </div>
      </TableCell>

      {/* Break time */}
      <TableCell className="text-sm text-muted-foreground">
        {formatDuration(breakSeconds)}
      </TableCell>

      {/* Number of breaks */}
      <TableCell>
        <Badge variant="outline" className="text-[10px] font-bold">
          {record.break_records.length}
        </Badge>
      </TableCell>

      {/* Status badge */}
      <TableCell>
        <StatusBadge status={status} />
      </TableCell>

      {/* Correct action — always visible for discrepancy, hover-only for others */}
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onCorrect(record)}
          className={cn(
            "text-[10px] font-black uppercase tracking-widest transition-opacity",
            status === "discrepancy"
              ? "text-primary"
              : "opacity-0 group-hover:opacity-100"
          )}
        >
          Correct
        </Button>
      </TableCell>
    </TableRow>
  )
}

// ─── CorrectionCard ───────────────────────────────────────────────
// Displays a single correction request in the Corrections tab.
// Shows the type, original vs requested time, reason, and current status.

function CorrectionCard({ correction }: { correction: PendingCorrectionApiItem }) {
  const statusCfg =
    correctionStatusConfig[correction.status] ?? correctionStatusConfig.pending
  const typeLabel = correctionTypeLabelMap[correction.correction_type] ?? correction.correction_type

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/10 bg-card/60 backdrop-blur-xl transition-all hover:border-border/30">
      <div className="p-5 sm:p-6">
        {/* Header: type badge + status */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1.5 text-[10px] font-bold">
              <Clock className="size-2.5" />
              {typeLabel}
            </Badge>
          </div>
          {/* Status pill */}
          <span
            className={cn(
              "text-[10px] font-black uppercase tracking-widest self-start sm:self-auto",
              statusCfg.className
            )}
          >
            {statusCfg.label}
          </span>
        </div>

        {/* Time comparison: original → requested */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Original Time
            </p>
            <p className="font-mono text-sm font-medium">
              {new Date(correction.original_time_utc).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-primary/10 bg-primary/5 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              Requested Time
            </p>
            <p className="font-mono text-sm font-medium">
              {new Date(correction.requested_time_utc).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Reason */}
        <div className="mb-4">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Reason
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">{correction.reason}</p>
        </div>

        {/* Admin notes (shown when correction is handled) */}
        {correction.admin_notes && (
          <div className="mb-4 rounded-lg bg-muted/20 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Admin Notes
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {correction.admin_notes}
            </p>
          </div>
        )}

        {/* Footer: reference + submitted date */}
        <div className="flex items-center justify-between border-t border-border/10 pt-4">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Shield className="size-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Ref: #{correction.id}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Submitted {new Date(correction.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  )
}
