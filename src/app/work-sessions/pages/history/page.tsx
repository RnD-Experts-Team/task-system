import { useState } from "react"
import { endOfMonth, format, startOfMonth } from "date-fns"
import { AlertCircle, ClipboardCheck, Eye, History, MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Pagination } from "@/components/pagination"
import { PaginationInfo } from "@/components/pagination-info"
import { EmptyState } from "../../components/empty-state"
import { EndOfDayReview } from "../../components/end-of-day-review"
import { SessionDetailSheet } from "../../components/session-detail-sheet"
import { SessionFilters, type SessionFilterValues } from "../../components/session-filters"
import { SessionTable } from "../../components/session-table"
import { SessionTableSkeleton } from "../../components/skeletons"
import { useMySession } from "../../hooks/useMySession"
import { useMySessions } from "../../hooks/useMySessions"
import type { ConfirmSessionPayload, SessionListParams, WorkSessionWithCounts } from "../../types"
import { formatWorkDate } from "../../utils/format"

const PAGE_SIZE = 15

/** Default filter range = the current calendar month */
function defaultFilters(): SessionFilterValues {
  const now = new Date()
  return {
    startDate: format(startOfMonth(now), "yyyy-MM-dd"),
    endDate: format(endOfMonth(now), "yyyy-MM-dd"),
    status: "all",
  }
}

export default function WorkSessionHistoryPage() {
  // ── Filters + pagination (owned here, forwarded to the hook) ──────
  const [filters, setFilters] = useState<SessionFilterValues>(defaultFilters)
  const [page, setPage] = useState(1)

  function patchFilters(patch: Partial<SessionFilterValues>) {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }

  const params: SessionListParams = {
    page,
    per_page: PAGE_SIZE,
    ...(filters.startDate ? { start_date: filters.startDate } : {}),
    ...(filters.endDate ? { end_date: filters.endDate } : {}),
    ...(filters.status !== "all" ? { status: filters.status } : {}),
  }

  const { sessions, pagination, loading, error, refetch } = useMySessions(params)

  // ── Selected session (detail sheet) ──────────────────────────────
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [reviewing, setReviewing] = useState(false)
  const {
    session: selected,
    loading: selectedLoading,
    error: selectedError,
    submitting,
    submitError,
    confirmSessionById,
    clearSubmitError,
  } = useMySession(selectedId)

  function openSession(session: WorkSessionWithCounts) {
    clearSubmitError()
    setReviewing(false)
    setSelectedId(session.id)
  }

  function closeSheet() {
    setSelectedId(null)
    setReviewing(false)
    clearSubmitError()
  }

  async function handleConfirm(payload: ConfirmSessionPayload) {
    if (!selected) return
    const confirmed = await confirmSessionById(selected.id, payload)
    if (confirmed) {
      setReviewing(false)
      refetch()
    }
  }

  const hasActiveFilter = !!filters.startDate || !!filters.endDate || filters.status !== "all"
  const canReview = !!selected && selected.status === "open"

  return (
    <>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* ── Page header ── */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">History</h2>
            {pagination && (
              <Badge variant="secondary" className="uppercase tracking-wider">
                {pagination.total} {pagination.total === 1 ? "day" : "days"}
              </Badge>
            )}
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            Every day you've planned, with outcomes and completion. Open days can still be reviewed and confirmed.
          </p>
        </div>

        {/* ── Filters ── */}
        <SessionFilters
          startDate={filters.startDate}
          endDate={filters.endDate}
          status={filters.status}
          onChange={patchFilters}
        />

        {/* ── Loading ── */}
        {loading && <SessionTableSkeleton />}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <AlertCircle className="size-6 text-destructive" />
            <p className="font-medium text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch}>
              Try again
            </Button>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && sessions.length === 0 && (
          <EmptyState
            icon={History}
            title="No sessions found"
            description={
              hasActiveFilter
                ? "Try widening the date range or clearing the status filter."
                : "Start your first day from My Day and it will show up here."
            }
            action={
              hasActiveFilter ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => patchFilters({ startDate: "", endDate: "", status: "all" })}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )}

        {/* ── Table + pagination ── */}
        {!loading && !error && sessions.length > 0 && (
          <>
            <SessionTable
              sessions={sessions}
              onRowClick={openSession}
              rowActions={(session) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Session actions">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openSession(session)}>
                      <Eye className="size-3.5" />
                      View details
                    </DropdownMenuItem>
                    {session.status === "open" && (
                      <DropdownMenuItem
                        onClick={() => {
                          openSession(session)
                          setReviewing(true)
                        }}
                      >
                        <ClipboardCheck className="size-3.5" />
                        Review & confirm
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            />

            {pagination && pagination.last_page > 1 && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <PaginationInfo
                  startItem={pagination.from ?? 0}
                  endItem={pagination.to ?? 0}
                  totalItems={pagination.total}
                  label="days"
                />
                <Pagination currentPage={pagination.current_page} totalPages={pagination.last_page} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Detail sheet (read-only) ── */}
      <SessionDetailSheet
        open={selectedId !== null && !reviewing}
        onOpenChange={(open) => {
          if (!open) closeSheet()
        }}
        session={selected}
        loading={selectedLoading}
        error={selectedError}
        footer={
          canReview ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">This day is still open. Set outcomes to lock it.</p>
              <Button
                onClick={() => {
                  clearSubmitError()
                  setReviewing(true)
                }}
              >
                <ClipboardCheck />
                Review & confirm
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* ── Review sheet (open sessions only) ── */}
      <Sheet
        open={selectedId !== null && reviewing}
        onOpenChange={(open) => {
          if (!open && !submitting) setReviewing(false)
        }}
      >
        <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
          <SheetHeader className="border-b pb-4 pr-12">
            <SheetTitle className="text-base">
              {selected ? `Review ${formatWorkDate(selected.work_date)}` : "Review session"}
            </SheetTitle>
            <SheetDescription>Choose a final outcome for every item, then confirm to lock this day.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {submitError && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
            {selected && reviewing && (
              <EndOfDayReview
                key={selected.id}
                compact
                items={selected.items ?? []}
                initialSummary={selected.summary_note}
                submitting={submitting}
                onConfirm={(payload) => void handleConfirm(payload)}
                onCancel={() => setReviewing(false)}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
