// src/app/work-sessions/pages/admin/ratings/page.tsx
// Monthly Ratings — "Monthly ratings" tab: pick a month and score every user
// inline (with their session stats for context). "Average" tab: pick users
// and a month range to compare average scores, with a PDF export for the
// end month of the range.

import { useMemo, useState } from "react"
import { subMonths } from "date-fns"
import {
  AlertCircle,
  BarChart3,
  Calculator,
  CalendarRange,
  FileArchive,
  Loader2,
  RefreshCw,
  Star,
  Users,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePermissions } from "@/hooks/usePermissions"
import { EmptyState } from "../../../components/empty-state"
import { ExportMonthlyDialog } from "../../../components/export-monthly-dialog"
import { MonthPicker } from "../../../components/month-picker"
import { RatingAverageResults } from "../../../components/rating-average-results"
import { RatingsTable } from "../../../components/ratings-table"
import { UserMultiSelect } from "../../../components/user-multi-select"
import { useAdminUsers } from "../../../hooks/useAdminUsers"
import { useMonthlyRatings } from "../../../hooks/useMonthlyRatings"
import { useRatingAverage } from "../../../hooks/useRatingAverage"
import type { YearMonth } from "../../../types"
import { monthLabel } from "../../../utils/format"

// { year, month } of a Date (month 1-based like the API)
function toYearMonth(d: Date): YearMonth {
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

// Months since year 0 — makes range comparisons a plain subtraction
function monthIndex(ym: YearMonth): number {
  return ym.year * 12 + ym.month
}

// Laravel serializes decimal(5,2) as a string — normalize
function toNumber(score: string | number): number | null {
  const n = typeof score === "number" ? score : Number(score)
  return Number.isFinite(n) ? n : null
}

/** Placeholder rows while the month's ratings load */
function RatingsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="hidden h-8 w-48 md:block" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

export default function MonthlyRatingsPage() {
  const { hasRole, hasPermission } = usePermissions()
  const canExport = hasRole("admin") || hasPermission("export work session reports")

  const now = useMemo(() => new Date(), [])
  const [activeTab, setActiveTab] = useState("monthly")

  // ── Monthly ratings tab ────────────────────────────────────────
  const [month, setMonth] = useState<YearMonth>(() => toYearMonth(now))
  const ratings = useMonthlyRatings(month)

  const ratedRows = useMemo(() => ratings.rows.filter((r) => r.rating !== null), [ratings.rows])
  const monthAverage = useMemo(() => {
    const scores = ratedRows
      .map((r) => (r.rating ? toNumber(r.rating.score) : null))
      .filter((s): s is number => s !== null)
    if (scores.length === 0) return null
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100
  }, [ratedRows])

  // ── Average tab ────────────────────────────────────────────────
  const { users, loading: usersLoading } = useAdminUsers()
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [fromMonth, setFromMonth] = useState<YearMonth>(() => toYearMonth(subMonths(now, 5)))
  const [toMonth, setToMonth] = useState<YearMonth>(() => toYearMonth(now))
  const average = useRatingAverage()
  const [exportOpen, setExportOpen] = useState(false)

  const rangeInvalid = monthIndex(fromMonth) > monthIndex(toMonth)
  const targetUserIds = selectedUserIds.length > 0 ? selectedUserIds : users.map((u) => u.id)

  async function handleCalculate() {
    if (rangeInvalid || targetUserIds.length === 0) return
    await average.run({ user_ids: targetUserIds, from: fromMonth, to: toMonth })
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight">Monthly Ratings</h2>
          {activeTab === "monthly" && !ratings.loading && ratings.rows.length > 0 && (
            <Badge variant="secondary" className="uppercase tracking-wider tabular-nums">
              {ratedRows.length} / {ratings.rows.length} rated
            </Badge>
          )}
        </div>
        <p className="max-w-lg text-sm text-muted-foreground">
          Score each team member's month against their daily work sessions, then compare averages over time.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line" className="mb-4">
          <TabsTrigger value="monthly" className="gap-1.5">
            <Star />
            Monthly ratings
          </TabsTrigger>
          <TabsTrigger value="average" className="gap-1.5">
            <BarChart3 />
            Average
          </TabsTrigger>
        </TabsList>

        {/* ─── Monthly ratings ─── */}
        <TabsContent value="monthly" className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Star className="size-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{monthLabel(month.year, month.month)}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {ratings.loading
                        ? "Loading…"
                        : ratings.rows.length === 0
                          ? "No users"
                          : `${ratedRows.length} of ${ratings.rows.length} rated${
                              monthAverage !== null ? ` · average ${monthAverage}%` : ""
                            }`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <MonthPicker value={month} onChange={setMonth} disabled={ratings.savingUserId !== null} />
                  <Button
                    variant="outline"
                    className="h-9 gap-2"
                    onClick={ratings.refetch}
                    disabled={ratings.loading || ratings.savingUserId !== null}
                  >
                    {ratings.loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {ratings.error && (
                <div className="mb-4 flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span className="flex-1">{ratings.error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      ratings.clearError()
                      ratings.refetch()
                    }}
                  >
                    Retry
                  </Button>
                </div>
              )}

              {ratings.loading ? (
                <RatingsSkeleton />
              ) : (
                <RatingsTable
                  rows={ratings.rows}
                  yearMonth={month}
                  onSave={ratings.save}
                  onClear={ratings.remove}
                  savingUserId={ratings.savingUserId}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Average ─── */}
        <TabsContent value="average" className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Users className="size-4 text-primary" />
                </div>
                <CardTitle className="text-base">Compare averages</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label className="text-xs">
                  Users{" "}
                  <span className="font-normal text-muted-foreground">
                    {selectedUserIds.length === 0 ? "(none selected — everyone is included)" : ""}
                  </span>
                </Label>
                <UserMultiSelect
                  users={users}
                  selected={selectedUserIds}
                  onChange={setSelectedUserIds}
                  loading={usersLoading}
                />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
                <MonthPicker label="From" value={fromMonth} onChange={setFromMonth} />
                <MonthPicker label="To" value={toMonth} onChange={setToMonth} />
                <div className="flex gap-2 sm:ml-auto">
                  {canExport && (
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={() => setExportOpen(true)}
                      disabled={usersLoading || targetUserIds.length === 0}
                      title={`Export ${monthLabel(toMonth.year, toMonth.month)} as PDF`}
                    >
                      <FileArchive />
                      Export PDF
                    </Button>
                  )}
                  <Button
                    onClick={handleCalculate}
                    disabled={average.loading || rangeInvalid || usersLoading || targetUserIds.length === 0}
                    className="gap-2"
                  >
                    {average.loading ? <Loader2 className="animate-spin" /> : <Calculator />}
                    {average.loading ? "Calculating…" : "Calculate"}
                  </Button>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {rangeInvalid
                  ? "The start month must be before or equal to the end month."
                  : `${monthLabel(fromMonth.year, fromMonth.month)} – ${monthLabel(toMonth.year, toMonth.month)} · ${
                      monthIndex(toMonth) - monthIndex(fromMonth) + 1
                    } ${monthIndex(toMonth) - monthIndex(fromMonth) + 1 === 1 ? "month" : "months"}`}
              </p>
            </CardContent>
          </Card>

          {average.error && (
            <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Calculation failed</p>
                <p className="mt-0.5 text-sm text-destructive/80">{average.error}</p>
              </div>
              <button
                type="button"
                onClick={average.clearError}
                className="text-destructive/60 hover:text-destructive"
                aria-label="Dismiss error"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {average.data ? (
            <RatingAverageResults result={average.data} />
          ) : (
            !average.loading && (
              <EmptyState
                icon={CalendarRange}
                title="No results yet"
                description="Select users and a month range, then calculate to compare average ratings."
              />
            )
          )}
        </TabsContent>
      </Tabs>

      {/* ── Export dialog (end month of the range) ── */}
      {canExport && (
        <ExportMonthlyDialog
          open={exportOpen}
          onOpenChange={setExportOpen}
          users={users}
          selectedUserIds={selectedUserIds}
          initialMonth={toMonth}
        />
      )}
    </div>
  )
}
