// src/app/work-sessions/pages/admin/sessions/page.tsx
// All Work Sessions — admin list of every user's daily sessions with date /
// status / user filters, pagination, a read-only detail sheet and a Reopen
// action for confirmed days. Subscribes to the "work-sessions.admin" Reverb
// channel: rows on the current page are patched in place, unknown rows
// trigger a debounced refetch, and confirm / start events raise a toast.

import { useCallback, useMemo, useState } from "react"
import { endOfMonth, format, startOfMonth } from "date-fns"
import { toast } from "sonner"
import {
  AlertCircle,
  CalendarCheck,
  ChevronDown,
  Filter,
  Loader2,
  RefreshCw,
  RotateCcw,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Pagination } from "@/components/pagination"
import { PaginationInfo } from "@/components/pagination-info"
import { usePermissions } from "@/hooks/usePermissions"
import { cn } from "@/lib/utils"
import { EmptyState } from "../../../components/empty-state"
import { SessionDetailSheet } from "../../../components/session-detail-sheet"
import { SessionFilters, type SessionFilterValues } from "../../../components/session-filters"
import { SessionTable } from "../../../components/session-table"
import { SessionTableSkeleton } from "../../../components/skeletons"
import { UserMultiSelect } from "../../../components/user-multi-select"
import { useAdminSession } from "../../../hooks/useAdminSession"
import { useAdminSessions } from "../../../hooks/useAdminSessions"
import { useAdminUsers } from "../../../hooks/useAdminUsers"
import { useReopenSession } from "../../../hooks/useReopenSession"
import { useWorkSessionsAdminChannel } from "../../../hooks/useWorkSessionsAdminChannel"
import { useAdminWorkSessionStore } from "../../../store/adminWorkSessionStore"
import type { SessionListParams, WorkSessionUpdatedPayload } from "../../../types"
import { formatWorkDate } from "../../../utils/format"

const PER_PAGE = 15

// Default range = the current calendar month
function currentMonthRange(): Pick<SessionFilterValues, "startDate" | "endDate"> {
  const now = new Date()
  return {
    startDate: format(startOfMonth(now), "yyyy-MM-dd"),
    endDate: format(endOfMonth(now), "yyyy-MM-dd"),
  }
}

export default function AdminWorkSessionsPage() {
  const { hasRole, hasPermission } = usePermissions()
  const canManage = hasRole("admin") || hasPermission("manage work sessions")

  // ── Filters + pagination ───────────────────────────────────────
  const [filters, setFilters] = useState<SessionFilterValues>({ ...currentMonthRange(), status: "all" })
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [showUsers, setShowUsers] = useState(false)
  const [page, setPage] = useState(1)

  const params = useMemo<SessionListParams>(
    () => ({
      page,
      per_page: PER_PAGE,
      start_date: filters.startDate || undefined,
      end_date: filters.endDate || undefined,
      status: filters.status,
      user_ids: selectedUserIds,
    }),
    [page, filters, selectedUserIds]
  )

  const { sessions, pagination, loading, error, refetch, clearError } = useAdminSessions(params)
  const { users, loading: usersLoading } = useAdminUsers()
  const applyRealtime = useAdminWorkSessionStore((s) => s.applyRealtime)

  // Any filter change resets to the first page
  function handleFilterChange(patch: Partial<SessionFilterValues>) {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }

  function handleUsersChange(ids: number[]) {
    setSelectedUserIds(ids)
    setPage(1)
  }

  // ── Realtime ───────────────────────────────────────────────────
  const handleRealtime = useCallback(
    (payload: WorkSessionUpdatedPayload) => {
      applyRealtime(payload)
      if (payload.action === "confirmed") {
        toast.success(`${payload.user_name} confirmed their day`, {
          description: formatWorkDate(payload.work_date),
        })
      } else if (payload.action === "started") {
        toast.info(`${payload.user_name} started their day`, {
          description: formatWorkDate(payload.work_date),
        })
      }
    },
    [applyRealtime]
  )
  const { status: liveStatus } = useWorkSessionsAdminChannel(handleRealtime)

  // ── Detail sheet + reopen ──────────────────────────────────────
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const { session, loading: sessionLoading, error: sessionError } = useAdminSession(selectedId)
  const { reopen, reopening, error: reopenError, clearError: clearReopenError } = useReopenSession()
  const [reopenOpen, setReopenOpen] = useState(false)

  function openSession(id: number) {
    setSelectedId(id)
    setSheetOpen(true)
  }

  function handleSheetOpenChange(open: boolean) {
    setSheetOpen(open)
    if (!open) setSelectedId(null)
  }

  async function handleReopen() {
    if (!session) return
    const updated = await reopen(session.id)
    if (updated) setReopenOpen(false)
  }

  const showReopen = !!session && session.status === "confirmed" && canManage
  const total = pagination?.total ?? 0
  const lastPage = pagination?.last_page ?? 1

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">All Work Sessions</h2>
            {/* Live indicator — green once the Reverb channel subscription is acknowledged */}
            <Badge
              variant="outline"
              className={cn(
                "gap-1.5",
                liveStatus === "live"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "text-muted-foreground"
              )}
              title={
                liveStatus === "offline"
                  ? "Real-time updates are unavailable. Use Refresh to load the latest rows."
                  : undefined
              }
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  liveStatus === "live" ? "animate-pulse bg-emerald-500" : "bg-muted-foreground/50"
                )}
              />
              {liveStatus === "live" ? "Live" : liveStatus === "connecting" ? "Connecting…" : "Offline"}
            </Badge>
          </div>
          <p className="max-w-lg text-sm text-muted-foreground">
            Every employee's daily plan and end-of-day outcomes. Rows update in real time as
            people start and confirm their days.
          </p>
        </div>
        <Button variant="outline" className="gap-2 self-start" disabled={loading} onClick={refetch}>
          {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          Refresh
        </Button>
      </div>

      {/* ── Filters ── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Filter className="size-4 text-primary" />
            </div>
            <CardTitle className="text-base">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <SessionFilters
            startDate={filters.startDate}
            endDate={filters.endDate}
            status={filters.status}
            onChange={handleFilterChange}
            extra={
              <Button
                variant={selectedUserIds.length > 0 ? "secondary" : "outline"}
                className="h-9 gap-2 self-start sm:self-auto"
                onClick={() => setShowUsers((v) => !v)}
                aria-expanded={showUsers}
              >
                <Users />
                Users
                {selectedUserIds.length > 0 && (
                  <Badge className="h-4 px-1.5 text-[9px] tabular-nums">{selectedUserIds.length}</Badge>
                )}
                <ChevronDown className={cn("transition-transform", showUsers && "rotate-180")} />
              </Button>
            }
          />

          {showUsers && (
            <div className="rounded-lg border border-dashed p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  Filter by user{selectedUserIds.length === 0 && " — showing everyone"}
                </p>
                {selectedUserIds.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-muted-foreground"
                    onClick={() => handleUsersChange([])}
                  >
                    Clear users
                  </Button>
                )}
              </div>
              <UserMultiSelect
                users={users}
                selected={selectedUserIds}
                onChange={handleUsersChange}
                loading={usersLoading}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearError()
              refetch()
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {/* ── Table ── */}
      {loading ? (
        <SessionTableSkeleton />
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No sessions found"
          description="Nobody has a work session matching these filters. Try widening the date range."
        />
      ) : (
        <SessionTable sessions={sessions} showUser onRowClick={(s) => openSession(s.id)} />
      )}

      {/* ── Pagination ── */}
      {!loading && total > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <PaginationInfo
            startItem={pagination?.from ?? 0}
            endItem={pagination?.to ?? 0}
            totalItems={total}
            label="sessions"
          />
          {lastPage > 1 && <Pagination currentPage={page} totalPages={lastPage} onPageChange={setPage} />}
        </div>
      )}

      {/* ── Detail sheet ── */}
      <SessionDetailSheet
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        session={session}
        loading={sessionLoading}
        error={sessionError}
        headerActions={
          showReopen ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={reopening}
              onClick={() => {
                clearReopenError()
                setReopenOpen(true)
              }}
            >
              <RotateCcw />
              Reopen
            </Button>
          ) : null
        }
      />

      {/* ── Reopen confirmation ── */}
      <AlertDialog open={reopenOpen} onOpenChange={(open) => !reopening && setReopenOpen(open)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reopen this session?</AlertDialogTitle>
            <AlertDialogDescription>
              {session
                ? `${session.user?.name ?? "The employee"} will be able to edit their plan for ${formatWorkDate(
                    session.work_date
                  )} again and must confirm the day a second time. Outcomes already recorded are kept.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {reopenError && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{reopenError}</span>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reopening}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={reopening}
              onClick={(e) => {
                // Keep the dialog open until the request settles
                e.preventDefault()
                handleReopen()
              }}
            >
              {reopening ? "Reopening…" : "Reopen session"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
