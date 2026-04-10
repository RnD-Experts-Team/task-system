import TeamCarousel from "./components/TeamCarousel"
import StatCard from "./components/StatCard"
import ProjectStatusChart from "./components/ProjectStatusChart"
import TaskVelocityChart from "./components/TaskVelocityChart"
import DeadlineItem, { buildDeadlineRows } from "./components/DeadlineItem"
import RightOverviewPanel from "./components/RightOverviewPanel"
import EmptyState from "./components/EmptyState"
import {
  StatCardRowSkeleton,
  ProjectStatusChartSkeleton,
  TaskVelocityChartSkeleton,
  HelpRequestCardSkeleton,
  DeadlineCardSkeleton,
  RightOverviewPanelSkeleton,
  DeveloperPanelSkeleton,
} from "./components/DashboardSkeleton"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarDays, FolderKanban, Users, ListTodo, AlertTriangle, Ticket, Clock, Trophy } from "lucide-react"

import { useDashboard } from "@/hooks/useDashboard"
import type { AnalyticsPeriod } from "@/types"

// ─── Period filter labels ────────────────────────────────────────
const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "last_week", label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "month_to_date", label: "Month to Date" },
]

/** Analytics period filter — wired to the dashboard store */
function PeriodFilter({ value, onChange }: { value: AnalyticsPeriod; onChange: (v: AnalyticsPeriod) => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as AnalyticsPeriod)}>
      <SelectTrigger className="h-8 w-40 text-xs rounded-full border-border/40 bg-muted/30 gap-1.5 focus:ring-primary/20">
        <CalendarDays className="size-3 shrink-0 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {PERIOD_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// ─── Main dashboard page ─────────────────────────────────────────

export default function DashboardPage() {
  const {
    canViewAnalytics,
    analytics,
    analyticsPeriod,
    analyticsLoading,
    setAnalyticsPeriod,
    employee,
    employeeLoading,
  } = useDashboard()

  // Derive display rows from API data
  const deadlineRows = buildDeadlineRows(analytics?.upcoming_deadlines)

  // ─── Developer view (no analytics permission) ──────────────────
  if (!canViewAnalytics) {
    return (
      <div className="flex-1 bg-background/50 flex items-start justify-center p-6 md:p-8">
        <main className="w-full max-w-7xl">
          <div className="mb-6">
            <h1 className="font-heading text-2xl font-extrabold tracking-tight">Developer Overview</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">A lightweight view focused on developer needs.</p>
          </div>

          {/* Show skeleton while employee data loads for the first time */}
          {employeeLoading && !employee ? (
            <DeveloperPanelSkeleton />
          ) : (
            <div className="space-y-4">
              <RightOverviewPanel variant="developer" employee={employee} />
            </div>
          )}
        </main>
      </div>
    )
  }

  // ─── Admin / analytics view ────────────────────────────────────
  const overview = analytics?.overview

  return (
    <div className="flex flex-col-reverse md:flex-row flex-1 min-h-0 overflow-hidden">
      {/* Left: team analytics */}
      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden flex flex-col gap-8 p-6 md:p-8 pb-16">
        {/* Header with period filter */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight">Hi, there!</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">Here's what's happening across your workspace today.</p>
          </div>
          <PeriodFilter value={analyticsPeriod} onChange={setAnalyticsPeriod} />
        </div>

        {/* Team carousel fetches users directly and handles its own UI states */}
        <TeamCarousel />

        {/* KPI stat cards — skeleton until analytics overview arrives */}
        {analyticsLoading && !analytics ? (
          <StatCardRowSkeleton />
        ) : (
          <section aria-label="Performance statistics" className="flex flex-col items-center px-4 w-full">
            {/* Main Tasks Card */}
            <Card className="glass-glow border w-full  mb-6">
              <CardHeader>
                <CardTitle className="font-heading text-lg font-bold flex items-center gap-2">
                  <ListTodo className="size-5 text-primary" />
                  Task Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-black tabular-nums text-primary">{overview ? overview.total_tasks.toLocaleString() : "--"}</p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2">Total Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-black tabular-nums text-emerald-600">{overview ? overview.completed_tasks.toLocaleString() : "--"}</p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl sm:text-3xl font-black tabular-nums text-sky-600">{overview ? `${overview.average_task_completion_rate}%` : "--"}</p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2">Completion Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Secondary Stats Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 w-full ">
              <StatCard
                label="Active Projects"
                value={overview ? String(overview.active_projects) : "--"}
                icon={<FolderKanban className="size-4 text-primary" />}
              />
              <StatCard
                label="Total Employees"
                value={overview ? String(overview.total_employees) : "--"}
                icon={<Users className="size-4 text-primary" />}
              />
              <StatCard
                label="Pending Help"
                value={overview ? String(overview.pending_help_requests) : "--"}
                icon={<AlertTriangle className="size-4 text-primary" />}
              />
              <StatCard
                label="Open Tickets"
                value={overview ? String(overview.open_tickets) : "--"}
                icon={<Ticket className="size-4 text-primary" />}
              />
            </div>
          </section>
        )}

        {/* Charts — skeleton until data arrives, then real charts */}
        <section aria-label="Analytics" className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {analyticsLoading && !analytics ? (
            <>
              <ProjectStatusChartSkeleton />
              <TaskVelocityChartSkeleton />
            </>
          ) : (
            <>
              <ProjectStatusChart data={analytics?.project_status} />
              <TaskVelocityChart data={analytics?.task_distribution} />
            </>
          )}
        </section>

        {/* Top Performers */}
        <section aria-label="Top performers">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="size-4 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-muted-foreground">Top Performers</h2>
          </div>
          {analyticsLoading && !analytics ? (
            <div className="h-24 rounded-xl glass-panel border border-border/10 animate-pulse" />
          ) : analytics?.top_performers && analytics.top_performers.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {analytics.top_performers.map((p, i) => (
                <div key={p.user_id} className="glass-glow border border-border/20 rounded-xl p-4 flex items-center gap-3 min-w-45 flex-1">
                  <div className="relative shrink-0">
                    <Avatar className="size-10 ring-2 ring-primary/20">
                      {p.avatar_url && <AvatarImage src={p.avatar_url} alt={p.user_name} />}
                      <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                        {p.user_name.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {i === 0 && (
                      <span className="absolute -top-1 -right-1 size-4 flex items-center justify-center rounded-full bg-amber-400 text-[8px] font-black text-white">#1</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{p.user_name}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">{p.completed_tasks} tasks done</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No top performers data for this period." minHeight={100} />
          )}
        </section>

        {/* Help requests & deadlines — skeleton until data arrives */}
        <section aria-label="Support and deadlines" className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_auto] items-start">
          {analyticsLoading && !analytics ? (
            <>
              <HelpRequestCardSkeleton />
              <DeadlineCardSkeleton />
            </>
          ) : (
            <>
              {/* Help requests / tickets tabs */}
              <Card className="glass-glow border overflow-hidden min-w-0">
                <Tabs defaultValue="help-requests">
                  <CardHeader className="border-b border-border/40 pb-0 pt-0 px-0">
                    <TabsList variant="line" className="w-full rounded-none border-b-0 h-auto gap-0 p-0">
                      <TabsTrigger value="help-requests" className="flex-1 rounded-none py-4 text-sm font-bold data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">
                        Help Requests {analytics?.help_requests_stats ? `(${analytics.help_requests_stats.total})` : ""}
                      </TabsTrigger>
                      <TabsTrigger value="tickets" className="flex-1 rounded-none py-4 text-sm font-bold data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">
                        Tickets {analytics?.tickets_stats ? `(${analytics.tickets_stats.total})` : ""}
                      </TabsTrigger>
                    </TabsList>
                  </CardHeader>

                  {/* ── Help Requests tab ── */}
                  <TabsContent value="help-requests" className="mt-0">
                    {analytics?.help_requests_stats ? (
                      <div className="p-4 space-y-4">
                        {/* Summary stats */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-lg bg-muted/30 p-3 text-center">
                            <p className="text-xl font-black tabular-nums">{analytics.help_requests_stats.total}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Total</p>
                          </div>
                          <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-3 text-center">
                            <p className="text-xl font-black text-amber-600 tabular-nums">{analytics.help_requests_stats.pending}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Pending</p>
                          </div>
                          <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3 text-center">
                            <p className="text-xl font-black text-emerald-600 tabular-nums">{analytics.help_requests_stats.completed}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Resolved</p>
                          </div>
                        </div>
                        {/* Avg resolution time */}
                        <div className="flex items-center justify-between rounded-lg bg-muted/20 border border-border/10 px-4 py-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="size-3.5 shrink-0" />
                            Avg. Resolution Time
                          </div>
                          <span className="text-sm font-black tabular-nums">
                            {analytics.help_requests_stats.average_resolution_time != null
                              ? `${analytics.help_requests_stats.average_resolution_time}h`
                              : "—"}
                          </span>
                        </div>
                        {/* Top helpers */}
                        {analytics.help_requests_stats.top_helpers.length > 0 ? (
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3">Top Helpers</p>
                            <div className="space-y-2">
                              {analytics.help_requests_stats.top_helpers.map((h) => (
                                <div key={h.user_id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                                  <Avatar className="size-8 shrink-0">
                                    {h.avatar_url && <AvatarImage src={h.avatar_url} alt={h.user_name} />}
                                    <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                                      {h.user_name.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <p className="text-sm font-semibold flex-1 truncate">{h.user_name}</p>
                                  <Badge variant="secondary" className="tabular-nums">{h.help_count}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-2">No top helpers yet.</p>
                        )}
                      </div>
                    ) : (
                      <div className="p-4"><EmptyState message="No help requests for this period." minHeight={200} /></div>
                    )}
                  </TabsContent>

                  {/* ── Tickets tab ── */}
                  <TabsContent value="tickets" className="mt-0">
                    {analytics?.tickets_stats ? (
                      <div className="p-4 space-y-4">
                        {/* Status summary */}
                        <div className="grid grid-cols-4 gap-3">
                          <div className="rounded-lg bg-muted/30 p-3 text-center">
                            <p className="text-xl font-black tabular-nums">{analytics.tickets_stats.total}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Total</p>
                          </div>
                          <div className="rounded-lg bg-amber-500/5 border border-amber-500/10 p-3 text-center">
                            <p className="text-xl font-black text-amber-600 tabular-nums">{analytics.tickets_stats.open}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Open</p>
                          </div>
                          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3 text-center">
                            <p className="text-xl font-black text-primary tabular-nums">{analytics.tickets_stats.in_progress}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Active</p>
                          </div>
                          <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-3 text-center">
                            <p className="text-xl font-black text-emerald-600 tabular-nums">{analytics.tickets_stats.resolved}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">Resolved</p>
                          </div>
                        </div>
                        {/* By type */}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3">By Type</p>
                          <div className="space-y-2.5">
                            {Object.entries(analytics.tickets_stats.by_type).map(([type, count]) => {
                              const total = analytics.tickets_stats.total || 1
                              const pct = Math.round((count / total) * 100)
                              return (
                                <div key={type} className="flex items-center gap-3">
                                  <p className="text-xs text-muted-foreground capitalize w-36 shrink-0">
                                    {type.replace(/_/g, " ")}
                                  </p>
                                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-xs font-black tabular-nums w-4 text-right">{count}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4"><EmptyState message="No ticket data for this period." minHeight={200} /></div>
                    )}
                  </TabsContent>
                </Tabs>
              </Card>

              {/* Critical deadlines */}
              <Card className="glass-glow border w-full lg:w-80 min-w-0">
                <CardHeader>
                  <CardTitle className="font-heading text-base font-bold">Critical Deadlines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {deadlineRows.length > 0 ? (
                    deadlineRows.map((item) => <DeadlineItem key={item.id} item={item} />)
                  ) : (
                    <EmptyState message="No upcoming deadlines." minHeight={160} />
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </section>
      </main>

      {/* Right panel — employee overview sidebar (skeleton until employee data arrives) */}
      {employeeLoading && !employee ? (
        <RightOverviewPanelSkeleton />
      ) : (
        <RightOverviewPanel employee={employee} />
      )}
    </div>
  )
}
