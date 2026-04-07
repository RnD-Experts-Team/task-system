import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Users, Coffee } from "lucide-react"
import { EmployeeCard } from "../components/employee-card"
import { CorrectionCard } from "../components/correction-card"
import { ActivityFeed } from "../components/activity-feed"
import { SystemInsights } from "../components/system-insights"
import { Pagination } from "@/components/pagination"
import { usePagination } from "@/hooks/use-pagination"
import {
  employees,
  activityEvents,
  correctionRequests as initialCorrections,
  type CorrectionRequest,
} from "../data"

export default function ClockingSessionsPage() {
  const [corrections, setCorrections] = useState<CorrectionRequest[]>(initialCorrections)

  const activeCount = employees.filter((e) => e.status === "working").length
  const onBreakCount = employees.filter((e) => e.status === "on-break").length
  const pendingCorrections = corrections.filter((c) => c.status === "pending")

  const { page: correctionsPage, totalPages: correctionsTotalPages, paged: pagedCorrections, setPage: setCorrectionsPage } = usePagination(pendingCorrections, { itemsPerPage: 5 })

  const handleApprove = useCallback((id: string) => {
    setCorrections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "approved" as const } : c))
    )
  }, [])

  const handleReject = useCallback((id: string) => {
    setCorrections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "rejected" as const } : c))
    )
  }, [])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <div className="h-8 w-1 rounded-full bg-primary" />
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Clocking Manager
              </h1>
            </div>
            <div className="ml-4 flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Real-time Activity Tracking
              </span>
            </div>
          </div>
          <Button variant="outline" className="gap-2 self-start">
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        </header>

        {/* Tabs */}
        <Tabs defaultValue="dashboard">
          <TabsList variant="line" className="mb-6">
            <TabsTrigger value="dashboard">Live Dashboard</TabsTrigger>
            <TabsTrigger value="corrections" className="gap-2">
              Corrections
              {pendingCorrections.length > 0 && (
                <Badge className="h-4 px-1.5 text-[9px]">{pendingCorrections.length}</Badge>
              )}
            </TabsTrigger>
            {/* <TabsTrigger value="active" className="gap-2">
              Active Sessions
              <Badge variant="outline" className="h-4 px-1.5 text-[9px]">
                {activeCount + onBreakCount}
              </Badge>
            </TabsTrigger> */}
          </TabsList>

          {/* ─── Live Dashboard Tab ──────────────────────────── */}
          <TabsContent value="dashboard">
            {/* Stats Overview */}
            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Active Now" value={String(activeCount)} sub="Employees working" />
              <StatCard
                label="On Break"
                value={String(onBreakCount)}
                sub="Scheduled intervals"
                accent
              />
              <div className="rounded-2xl border border-border/10 bg-card/40 p-5 sm:col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Daily Efficiency
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl font-black">94.2%</span>
                    <span className="text-xs font-bold text-primary">+2.4%</span>
                  </div>
                </div>
                <div className="flex h-14 items-end gap-1">
                  {[32, 48, 40, 56, 64].map((h, i) => (
                    <div
                      key={i}
                      className="w-2 rounded-t bg-primary"
                      style={{ height: `${h}px`, opacity: 0.2 + i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Active Personnel */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
                Active Personnel
              </h3>
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-primary" /> Working
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-orange-400" /> On Break
                </span>
              </div>
            </div>
            <section className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {employees.map((emp) => (
                <EmployeeCard key={emp.id} employee={emp} />
              ))}
            </section>

            {/* Activity + Insights */}
            <section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h3 className="mb-6 text-lg font-bold">Activity Flow</h3>
                <ActivityFeed events={activityEvents} />
              </div>
              <div>
                <SystemInsights />
              </div>
            </section>
          </TabsContent>

          {/* ─── Corrections Tab ─────────────────────────────── */}
          <TabsContent value="corrections">
            <div className="mb-6">
              <h3 className="text-lg font-bold">Pending Correction Requests</h3>
              <p className="text-sm text-muted-foreground">
                Review and approve or reject employee clock-time correction requests.
              </p>
            </div>
            {pendingCorrections.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-border/10 bg-card/40 py-16">
                <p className="text-sm text-muted-foreground">No pending correction requests.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {pagedCorrections.map((correction) => (
                    <CorrectionCard
                      key={correction.id}
                      correction={correction}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))}
                </div>
                {correctionsTotalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination
                      currentPage={correctionsPage}
                      totalPages={correctionsTotalPages}
                      onPageChange={setCorrectionsPage}
                    />
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* ─── Active Sessions Tab ─────────────────────────── */}
          <TabsContent value="active">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1">
                <Users className="size-3 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {activeCount} Working
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/5 px-3 py-1">
                <Coffee className="size-3 text-orange-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">
                  {onBreakCount} On Break
                </span>
              </div>
            </div>
            <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {employees.map((emp) => (
                <EmployeeCard key={emp.id} employee={emp} />
              ))}
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string
  sub: string
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-2xl border border-border/10 bg-card/40 p-5 ${accent ? "border-l-2 border-l-orange-400" : ""}`}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="mt-3">
        <span className={`text-3xl font-black ${accent ? "text-orange-400" : "text-primary"}`}>
          {value}
        </span>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
      </div>
    </div>
  )
}
