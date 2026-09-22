import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router"
import {
  AlertCircle,
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Globe,
  ListChecks,
  Loader2,
  MinusCircle,
  Plus,
  StickyNote,
  Sunrise,
  Timer,
  XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { ConfirmedBanner } from "../../components/confirmed-banner"
import { EmptyState } from "../../components/empty-state"
import { EndOfDayReview } from "../../components/end-of-day-review"
import { ItemFormSheet, type ItemFormValues } from "../../components/item-form-sheet"
import { SessionStatusBadge } from "../../components/session-status-badge"
import { MyDaySkeleton } from "../../components/skeletons"
import { SortableItemList } from "../../components/sortable-item-list"
import { StartDayDialog } from "../../components/start-day-dialog"
import { useTodaySession } from "../../hooks/useTodaySession"
import type {
  ConfirmSessionPayload,
  ItemOutcome,
  StartSessionPayload,
  TodayPayload,
  WorkSession,
  WorkSessionItem,
} from "../../types"
import { formatWorkDate, minutesToHuman, sumEstimatedMinutes } from "../../utils/format"

type Mode = "planning" | "review"
type SaveState = "idle" | "dirty" | "saving" | "saved" | "error"

// Debounce delay for the summary textarea before PUT /work-sessions/{id}
const SUMMARY_DEBOUNCE_MS = 800

// ─── Page ─────────────────────────────────────────────────────────

export default function MyDayPage() {
  const todaySession = useTodaySession()
  const { today, session, loading, error, submitting, submitError, refetch, startSession, clearSubmitError } =
    todaySession

  const [startOpen, setStartOpen] = useState(false)

  async function handleStart(payload: StartSessionPayload) {
    const created = await startSession(payload)
    if (created) setStartOpen(false)
  }

  // ── Loading ──────────────────────────────────────────────────────
  if (loading && !today) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <PageHeader />
        <MyDaySkeleton />
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────
  if (error && !today) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <PageHeader />
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
          <AlertCircle className="size-6 text-destructive" />
          <p className="font-medium text-destructive">{error}</p>
          <Button variant="outline" size="sm" onClick={refetch}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  if (!today) return null

  // ── No session yet: hero + StartDayDialog ────────────────────────
  if (!session) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <PageHeader today={today.today} timezone={today.company_timezone} />

        <Card className="overflow-hidden">
          <CardContent className="relative">
            <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative flex flex-col items-start gap-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Sunrise className="size-6 text-primary" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-semibold tracking-tight">
                    Ready to start {formatWorkDate(today.today)}?
                  </h3>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Plan the items you intend to work on, keep them updated through the day, and confirm your
                    outcomes before you sign off.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {today.carry_over_candidates.length > 0 && (
                      <Badge variant="secondary">
                        {today.carry_over_candidates.length} item
                        {today.carry_over_candidates.length === 1 ? "" : "s"} to carry over
                      </Badge>
                    )}
                    {today.previous_open_sessions.length > 0 && (
                      <Badge
                        variant="outline"
                        className="gap-1 border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      >
                        <AlertTriangle />
                        {today.previous_open_sessions.length} unconfirmed day
                        {today.previous_open_sessions.length === 1 ? "" : "s"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                size="lg"
                className="w-full transition-all hover:shadow-md hover:shadow-primary/25 sm:w-auto"
                onClick={() => {
                  clearSubmitError()
                  setStartOpen(true)
                }}
              >
                <Sunrise />
                Start my day
              </Button>
            </div>
          </CardContent>
        </Card>

        {today.previous_open_sessions.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Unconfirmed days can be reviewed and confirmed from{" "}
            <Link to="/work-sessions/history" className="font-medium text-foreground underline-offset-2 hover:underline">
              History
            </Link>
            .
          </p>
        )}

        <StartDayDialog
          open={startOpen}
          onOpenChange={setStartOpen}
          today={today}
          submitting={submitting}
          submitError={submitError}
          onStart={(payload) => void handleStart(payload)}
        />
      </div>
    )
  }

  // ── Open / confirmed session — keyed so per-session UI state resets ──
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader today={today.today} timezone={today.company_timezone} />
      <SessionView key={session.id} session={session} today={today} actions={todaySession} />
    </div>
  )
}

// ─── Session view (open or confirmed) ─────────────────────────────

type SessionActions = Pick<
  ReturnType<typeof useTodaySession>,
  | "submitting"
  | "submitError"
  | "addItem"
  | "updateItem"
  | "deleteItem"
  | "reorderItems"
  | "setOutcome"
  | "updateSummary"
  | "confirmSession"
  | "clearSubmitError"
>

function SessionView({ session, today, actions }: { session: WorkSession; today: TodayPayload; actions: SessionActions }) {
  const {
    submitting,
    submitError,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
    setOutcome,
    updateSummary,
    confirmSession,
    clearSubmitError,
  } = actions

  // ── UI state ─────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>("planning")
  const [itemSheetOpen, setItemSheetOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WorkSessionItem | null>(null)

  // ── Summary draft (debounced autosave) — seeded once per session via `key` ──
  const [summaryDraft, setSummaryDraft] = useState(session.summary_note ?? "")
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const summaryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Clear any pending timer on unmount
  useEffect(() => {
    return () => {
      if (summaryTimer.current) clearTimeout(summaryTimer.current)
    }
  }, [])

  function handleSummaryChange(value: string) {
    setSummaryDraft(value)
    setSaveState("dirty")
    if (summaryTimer.current) clearTimeout(summaryTimer.current)
    summaryTimer.current = setTimeout(async () => {
      setSaveState("saving")
      const ok = await updateSummary(value.trim() ? value : null)
      setSaveState(ok ? "saved" : "error")
    }, SUMMARY_DEBOUNCE_MS)
  }

  // ── Derived data ─────────────────────────────────────────────────
  const items = useMemo(() => session.items ?? [], [session.items])
  const counts = useMemo(() => {
    const c = { done: 0, partial: 0, not_done: 0, pending: 0 }
    for (const i of items) c[i.outcome] += 1
    return c
  }, [items])
  const totalEstimate = sumEstimatedMinutes(items)
  const isConfirmed = session.status === "confirmed"
  const dateMismatch = session.work_date !== today.today
  // Review mode can only exist while the session is open
  const effectiveMode: Mode = isConfirmed ? "planning" : mode

  // ── Handlers ─────────────────────────────────────────────────────
  function openCreate() {
    clearSubmitError()
    setEditingItem(null)
    setItemSheetOpen(true)
  }

  function openEdit(item: WorkSessionItem) {
    clearSubmitError()
    setEditingItem(item)
    setItemSheetOpen(true)
  }

  function closeItemSheet() {
    setItemSheetOpen(false)
    setEditingItem(null)
    clearSubmitError()
  }

  async function handleItemSubmit(values: ItemFormValues) {
    const result = editingItem ? await updateItem(editingItem.id, values) : await addItem(values)
    if (result) closeItemSheet()
  }

  function handleOutcomeChange(item: WorkSessionItem, outcome: ItemOutcome) {
    if (outcome !== item.outcome) void setOutcome(item.id, outcome)
  }

  async function handleConfirm(payload: ConfirmSessionPayload) {
    // Drop any pending summary autosave — the review's summary is authoritative
    if (summaryTimer.current) clearTimeout(summaryTimer.current)
    const confirmed = await confirmSession(payload)
    if (confirmed) setMode("planning")
  }

  return (
    <>
      {/* Confirmed banner */}
      {isConfirmed && <ConfirmedBanner session={session} />}

      {/* Date mismatch guard — should not happen, but be explicit */}
      {dateMismatch && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300">
          <AlertTriangle className="size-4 shrink-0" />
          This session is dated {formatWorkDate(session.work_date)}, not today ({formatWorkDate(today.today)}).
        </div>
      )}

      {/* Session header card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <CalendarDays className="size-4 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{formatWorkDate(session.work_date)}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="inline-flex items-center gap-1">
                    <Globe className="size-3" />
                    {today.company_timezone}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Timer className="size-3" />
                    {totalEstimate > 0 ? `${minutesToHuman(totalEstimate)} planned` : "No estimates yet"}
                  </span>
                </CardDescription>
              </div>
            </div>
            <SessionStatusBadge status={session.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatTile icon={ListChecks} label="Items" value={items.length} />
            <StatTile
              icon={CheckCircle2}
              label="Done"
              value={counts.done}
              className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            />
            <StatTile
              icon={MinusCircle}
              label="Partial"
              value={counts.partial}
              className="bg-amber-500/15 text-amber-600 dark:text-amber-400"
            />
            <StatTile
              icon={XCircle}
              label="Not done"
              value={counts.not_done}
              className="bg-red-500/15 text-red-600 dark:text-red-400"
            />
            <StatTile icon={Timer} label="Pending" value={counts.pending} className="bg-muted text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      {effectiveMode === "review" ? (
        /* ── Review mode ── */
        <Card>
          <CardContent>
            <EndOfDayReview
              items={items}
              initialSummary={summaryDraft}
              submitting={submitting}
              onConfirm={(payload) => void handleConfirm(payload)}
              onCancel={() => setMode("planning")}
            />
          </CardContent>
        </Card>
      ) : (
        /* ── Planning / read-only mode ── */
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <ListChecks className="size-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Today's plan</CardTitle>
                    <CardDescription>
                      {isConfirmed ? "Final outcomes for the day." : "Drag to reorder. Update outcomes as you go."}
                    </CardDescription>
                  </div>
                </div>
                {!isConfirmed && (
                  <Button onClick={openCreate} disabled={submitting}>
                    <Plus />
                    Add item
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {submitError && !itemSheetOpen && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span className="flex-1">{submitError}</span>
                  <Button variant="ghost" size="xs" onClick={clearSubmitError}>
                    Dismiss
                  </Button>
                </div>
              )}

              {items.length === 0 ? (
                <EmptyState
                  icon={ListChecks}
                  title="Nothing planned yet"
                  description={
                    isConfirmed
                      ? "This day was confirmed without any items."
                      : "Add the first thing you intend to work on today."
                  }
                  action={
                    !isConfirmed ? (
                      <Button variant="outline" size="sm" onClick={openCreate}>
                        <Plus />
                        Add item
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <SortableItemList
                  items={items}
                  readOnly={isConfirmed}
                  disabled={submitting}
                  onReorder={(ids) => void reorderItems(ids)}
                  onEdit={openEdit}
                  onDelete={(item) => deleteItem(item.id)}
                  onOutcomeChange={handleOutcomeChange}
                />
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <StickyNote className="size-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Day summary</CardTitle>
                    <CardDescription>
                      {isConfirmed ? "Your closing note for the day." : "Notes are saved automatically."}
                    </CardDescription>
                  </div>
                </div>
                {!isConfirmed && <SaveHint state={saveState} />}
              </div>
            </CardHeader>
            <CardContent>
              {isConfirmed ? (
                session.summary_note ? (
                  <p className="whitespace-pre-wrap rounded-lg border bg-card/40 p-3 text-sm">{session.summary_note}</p>
                ) : (
                  <p className="text-xs italic text-muted-foreground">No summary was written.</p>
                )
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="summary" className="sr-only">
                    Summary
                  </Label>
                  <Textarea
                    id="summary"
                    value={summaryDraft}
                    onChange={(e) => handleSummaryChange(e.target.value)}
                    placeholder="Blockers, wins, what to pick up tomorrow…"
                    rows={4}
                    maxLength={5000}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Primary CTA */}
          {!isConfirmed && (
            <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                {counts.pending > 0
                  ? `${counts.pending} item${counts.pending === 1 ? "" : "s"} still pending — you'll set every outcome in the review.`
                  : "All outcomes set — confirm to lock the day."}
              </p>
              <Button
                size="lg"
                className="transition-all hover:shadow-md hover:shadow-primary/25"
                onClick={() => setMode("review")}
                disabled={submitting || items.length === 0}
              >
                <ClipboardCheck />
                End of day review
              </Button>
            </div>
          )}
        </>
      )}

      {/* Add / edit item sheet */}
      <ItemFormSheet
        open={itemSheetOpen}
        onOpenChange={(open) => (open ? setItemSheetOpen(true) : closeItemSheet())}
        mode={editingItem ? "edit" : "create"}
        item={editingItem}
        submitting={submitting}
        submitError={submitError}
        onSubmit={(values) => void handleItemSubmit(values)}
        onCancel={closeItemSheet}
      />
    </>
  )
}

// ─── Small pieces ─────────────────────────────────────────────────

/** Small stat tile used in the session header card */
function StatTile({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Check
  label: string
  value: string | number
  className?: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card/40 p-3">
      <div className={cn("rounded-lg p-2", className ?? "bg-primary/10 text-primary")}>
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-base font-bold leading-tight tabular-nums">{value}</p>
      </div>
    </div>
  )
}

function PageHeader({ today, timezone }: { today?: string; timezone?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <h2 className="text-3xl font-bold tracking-tight">My Day</h2>
        {today && (
          <Badge variant="secondary" className="hidden uppercase tracking-wider sm:inline-flex">
            {formatWorkDate(today)}
          </Badge>
        )}
      </div>
      <p className="max-w-md text-sm text-muted-foreground">
        Plan your day in the morning, track outcomes as you go, and confirm before you sign off.
        {timezone ? ` Days follow the ${timezone} calendar.` : ""}
      </p>
    </div>
  )
}

/** Autosave indicator for the summary textarea */
function SaveHint({ state }: { state: SaveState }) {
  if (state === "idle") return null
  const meta: Record<Exclude<SaveState, "idle">, { icon: typeof Check; label: string; className: string }> = {
    dirty: { icon: Timer, label: "Unsaved", className: "text-muted-foreground" },
    saving: { icon: Loader2, label: "Saving…", className: "text-muted-foreground" },
    saved: { icon: Check, label: "Saved", className: "text-emerald-600 dark:text-emerald-400" },
    error: { icon: AlertCircle, label: "Not saved", className: "text-destructive" },
  }
  const { icon: Icon, label, className } = meta[state]
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", className)}>
      <Icon className={cn("size-3.5", state === "saving" && "animate-spin")} />
      {label}
    </span>
  )
}
