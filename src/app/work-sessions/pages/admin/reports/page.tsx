// src/app/work-sessions/pages/admin/reports/page.tsx
// Work Session Reports — date range + user filter → "Overview" (KPI tiles,
// daily chart, per-user table) and "By task" (grouped by linked task or
// normalized title) tabs, plus a monthly PDF/ZIP export.

import { useMemo, useState } from "react"
import { endOfMonth, format, isAfter, parse, startOfMonth } from "date-fns"
import {
  AlertCircle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileArchive,
  Filter,
  ListChecks,
  Loader2,
  Play,
  Users,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DateInput } from "@/components/ui/date-input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { usePermissions } from "@/hooks/usePermissions"
import { cn } from "@/lib/utils"
import { ByTaskReportTable } from "../../../components/by-task-report-table"
import { DailyCompletionChart } from "../../../components/daily-completion-chart"
import { EmptyState } from "../../../components/empty-state"
import { ExportMonthlyDialog } from "../../../components/export-monthly-dialog"
import { KpiTile } from "../../../components/kpi-tile"
import { PerUserReportTable } from "../../../components/per-user-report-table"
import { CardGridSkeleton } from "../../../components/skeletons"
import { UserMultiSelect } from "../../../components/user-multi-select"
import { useAdminUsers } from "../../../hooks/useAdminUsers"
import { useByTaskReport } from "../../../hooks/useByTaskReport"
import { useOverviewReport } from "../../../hooks/useOverviewReport"
import type { ByTaskGroupBy, ReportParams, YearMonth } from "../../../types"
import { completionTone, minutesToHuman } from "../../../utils/format"

// Month of a "yyyy-MM-dd" string (falls back to the current month)
function monthOf(date: string): YearMonth {
  const parsed = parse(date, "yyyy-MM-dd", new Date())
  const d = Number.isNaN(parsed.getTime()) ? new Date() : parsed
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

/** Inline error banner with dismiss */
function ErrorBanner({ title, message, onDismiss }: { title: string; message: string; onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="flex-1">
        <p className="text-sm font-medium text-destructive">{title}</p>
        <p className="mt-0.5 text-sm text-destructive/80">{message}</p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-destructive/60 hover:text-destructive"
        aria-label="Dismiss error"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export default function WorkSessionReportsPage() {
  const { hasRole, hasPermission } = usePermissions()
  const canExport = hasRole("admin") || hasPermission("export work session reports")

  // ── Filter form ────────────────────────────────────────────────
  const now = useMemo(() => new Date(), [])
  const [startDate, setStartDate] = useState(format(startOfMonth(now), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(endOfMonth(now), "yyyy-MM-dd"))
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [showUsers, setShowUsers] = useState(false)
  const [includeOpen, setIncludeOpen] = useState(false)
  const [groupBy, setGroupBy] = useState<ByTaskGroupBy>("task")
  const [activeTab, setActiveTab] = useState("overview")
  const [exportOpen, setExportOpen] = useState(false)

  // Params used by the last successful "Run report" — group-by changes re-run
  // the by-task report against these, not the (possibly edited) form values.
  const [lastParams, setLastParams] = useState<ReportParams | null>(null)

  const { users, loading: usersLoading } = useAdminUsers()
  const overview = useOverviewReport()
  const byTask = useByTaskReport()

  const rangeInvalid =
    !startDate ||
    !endDate ||
    isAfter(parse(startDate, "yyyy-MM-dd", new Date()), parse(endDate, "yyyy-MM-dd", new Date()))
  const running = overview.loading || byTask.loading

  async function handleRun() {
    if (rangeInvalid) return
    const params: ReportParams = {
      start_date: startDate,
      end_date: endDate,
      user_ids: selectedUserIds,
      include_open: includeOpen,
    }
    setLastParams(params)
    await Promise.all([overview.run(params), byTask.run({ ...params, group_by: groupBy })])
  }

  function handleGroupByChange(value: string) {
    // ToggleGroup emits "" when the active item is clicked again — ignore it
    if (value !== "task" && value !== "title") return
    setGroupBy(value)
    if (lastParams) byTask.run({ ...lastParams, group_by: value })
  }

  const totals = overview.data?.totals ?? null
  const completionPct = totals?.completion_pct ?? null
  const completionToneValue = completionTone(completionPct)
  const hasRun = lastParams !== null

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">Work Session Reports</h2>
            {overview.data && (
              <Badge variant="secondary" className="uppercase tracking-wider">
                {overview.data.totals.sessions} {overview.data.totals.sessions === 1 ? "session" : "sessions"}
              </Badge>
            )}
          </div>
          <p className="max-w-lg text-sm text-muted-foreground">
            Completion rates across the team for any period, broken down per day, per user and per task.
          </p>
        </div>
        {canExport && (
          <Button
            variant="outline"
            className="gap-2 self-start"
            onClick={() => setExportOpen(true)}
            disabled={usersLoading}
          >
            <FileArchive />
            Export monthly PDF
          </Button>
        )}
      </div>

      {/* ── Filters ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Filter className="size-4 text-primary" />
            </div>
            <CardTitle className="text-base">Report filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="rep-start" className="text-xs">
                Start date
              </Label>
              <DateInput
                id="rep-start"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rep-end" className="text-xs">
                End date
              </Label>
              <DateInput
                id="rep-end"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 text-sm"
              />
            </div>

            {/* Include open (unconfirmed) sessions */}
            <label
              htmlFor="rep-include-open"
              className="flex h-10 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm"
            >
              <Switch id="rep-include-open" checked={includeOpen} onCheckedChange={setIncludeOpen} />
              <span className="whitespace-nowrap">Include open days</span>
            </label>

            <Button
              variant={selectedUserIds.length > 0 ? "secondary" : "outline"}
              className="h-10 gap-2"
              onClick={() => setShowUsers((v) => !v)}
              aria-expanded={showUsers}
            >
              <Users />
              Users
              {selectedUserIds.length > 0 ? (
                <Badge className="h-4 px-1.5 text-[9px] tabular-nums">{selectedUserIds.length}</Badge>
              ) : (
                <span className="text-xs text-muted-foreground">all</span>
              )}
              <ChevronDown className={cn("transition-transform", showUsers && "rotate-180")} />
            </Button>
          </div>

          {showUsers && (
            <div className="rounded-lg border border-dashed p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Limit the report to specific users{selectedUserIds.length === 0 && " — currently everyone"}
                </p>
                {selectedUserIds.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-muted-foreground"
                    onClick={() => setSelectedUserIds([])}
                  >
                    Clear users
                  </Button>
                )}
              </div>
              <UserMultiSelect
                users={users}
                selected={selectedUserIds}
                onChange={setSelectedUserIds}
                loading={usersLoading}
              />
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              {rangeInvalid
                ? "Pick a valid start and end date."
                : includeOpen
                  ? "Open (unconfirmed) days are included — pending items count against completion."
                  : "Only confirmed days are counted."}
            </p>
            <Button onClick={handleRun} disabled={running || rangeInvalid} className="gap-2 sm:shrink-0">
              {running ? <Loader2 className="animate-spin" /> : <Play />}
              {running ? "Running…" : "Run report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Results ── */}
      {!hasRun ? (
        <EmptyState
          icon={BarChart3}
          title="No report yet"
          description="Choose a period (and optionally users), then run the report to see completion figures."
        />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList variant="line" className="mb-4">
            <TabsTrigger value="overview" className="gap-1.5">
              <BarChart3 />
              Overview
            </TabsTrigger>
            <TabsTrigger value="by-task" className="gap-1.5">
              <ListChecks />
              By task
              {byTask.data && (
                <Badge variant="secondary" className="h-4 px-1.5 text-[9px] tabular-nums">
                  {byTask.data.rows.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ─── Overview ─── */}
          <TabsContent value="overview" className="flex flex-col gap-4">
            {overview.error && (
              <ErrorBanner title="Overview failed" message={overview.error} onDismiss={overview.clearError} />
            )}

            {overview.loading && (
              <>
                <CardGridSkeleton />
                <Card>
                  <CardContent className="p-4">
                    <Skeleton className="h-64 w-full" />
                  </CardContent>
                </Card>
              </>
            )}

            {!overview.loading && overview.data && totals && (
              <>
                {/* KPI tiles */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <KpiTile
                    label="Sessions"
                    value={totals.sessions}
                    hint={`${totals.confirmed_sessions} confirmed · ${totals.users} ${totals.users === 1 ? "user" : "users"}`}
                    icon={CalendarDays}
                  />
                  <KpiTile
                    label="Items"
                    value={totals.items_total}
                    hint={
                      <span className="tabular-nums">
                        <span className="text-emerald-700 dark:text-emerald-400">{totals.done} done</span>
                        {" · "}
                        <span className="text-amber-700 dark:text-amber-400">{totals.partial} partial</span>
                        {" · "}
                        <span className="text-red-700 dark:text-red-400">{totals.not_done} not done</span>
                        {totals.pending > 0 && ` · ${totals.pending} pending`}
                      </span>
                    }
                    icon={ListChecks}
                  />
                  <KpiTile
                    label="Completion"
                    value={completionPct === null ? "—" : `${Math.round(completionPct)}%`}
                    hint="(done + ½ partial) ÷ items"
                    icon={CheckCircle2}
                    tone={completionToneValue === "none" ? "default" : completionToneValue}
                  />
                  <KpiTile
                    label="Estimated effort"
                    value={minutesToHuman(totals.estimated_minutes_total)}
                    hint="Sum of item estimates"
                    icon={Clock}
                  />
                </div>

                {/* Daily chart */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <BarChart3 className="size-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">Daily completion</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Outcomes per day with the completion rate overlaid
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <DailyCompletionChart daily={overview.data.daily} />
                  </CardContent>
                </Card>

                {/* Per-user table */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <Users className="size-4 text-primary" />
                      </div>
                      <CardTitle className="text-base">Per user</CardTitle>
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {overview.data.per_user.length} {overview.data.per_user.length === 1 ? "user" : "users"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <PerUserReportTable rows={overview.data.per_user} />
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ─── By task ─── */}
          <TabsContent value="by-task" className="flex flex-col gap-4">
            {byTask.error && (
              <ErrorBanner title="By-task report failed" message={byTask.error} onDismiss={byTask.clearError} />
            )}

            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <ListChecks className="size-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Work by task</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {groupBy === "task"
                          ? "Items linked to a project task, grouped by task"
                          : "All items grouped by their (normalized) title"}
                      </p>
                    </div>
                  </div>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={groupBy}
                    onValueChange={handleGroupByChange}
                    disabled={byTask.loading}
                    aria-label="Group by"
                  >
                    <ToggleGroupItem value="task">Task</ToggleGroupItem>
                    <ToggleGroupItem value="title">Title</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {byTask.loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                ) : byTask.data ? (
                  <ByTaskReportTable report={byTask.data} />
                ) : (
                  <EmptyState icon={ListChecks} title="Nothing to show" description="Run the report to populate this view." />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* ── Export dialog ── */}
      {canExport && (
        <ExportMonthlyDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          users={users}
          selectedUserIds={selectedUserIds}
          initialMonth={monthOf(endDate)}
        />
      )}
    </div>
  )
}
