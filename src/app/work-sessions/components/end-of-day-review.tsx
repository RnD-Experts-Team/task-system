import { useMemo, useState } from "react"
import { CheckCircle2, ClipboardCheck, Link2, Loader2, Lock, MinusCircle, RotateCcw, XCircle } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import {
  FINAL_OUTCOMES,
  OUTCOME_LABELS,
  type ConfirmSessionPayload,
  type FinalItemOutcome,
  type WorkSessionItem,
} from "../types"
import { PriorityBadge } from "./priority-badge"

type EndOfDayReviewProps = {
  items: WorkSessionItem[]
  initialSummary?: string | null
  submitting?: boolean
  onConfirm: (payload: ConfirmSessionPayload) => void
  onCancel: () => void
  /** Compact layout for use inside a sheet */
  compact?: boolean
}

type ReviewEntry = { outcome: FinalItemOutcome | null; note: string }

// Icon + selected-state classes for each final outcome toggle
const outcomeToggleMeta: Record<FinalItemOutcome, { icon: typeof CheckCircle2; active: string }> = {
  done: {
    icon: CheckCircle2,
    active: "data-[state=on]:bg-emerald-500/15 data-[state=on]:text-emerald-700 dark:data-[state=on]:text-emerald-400 data-[state=on]:border-emerald-500/40",
  },
  partial: {
    icon: MinusCircle,
    active: "data-[state=on]:bg-amber-500/15 data-[state=on]:text-amber-700 dark:data-[state=on]:text-amber-400 data-[state=on]:border-amber-500/40",
  },
  not_done: {
    icon: XCircle,
    active: "data-[state=on]:bg-red-500/15 data-[state=on]:text-red-700 dark:data-[state=on]:text-red-400 data-[state=on]:border-red-500/40",
  },
}

/** Seed the review from the items' current outcomes (pending → not yet reviewed) */
function seedEntries(items: WorkSessionItem[]): Record<number, ReviewEntry> {
  const map: Record<number, ReviewEntry> = {}
  for (const item of items) {
    map[item.id] = {
      outcome: item.outcome === "pending" ? null : item.outcome,
      note: item.outcome_note ?? "",
    }
  }
  return map
}

/** End-of-day review: pick a final outcome + note per item, write a summary, confirm and lock */
export function EndOfDayReview({
  items,
  initialSummary,
  submitting = false,
  onConfirm,
  onCancel,
  compact = false,
}: EndOfDayReviewProps) {
  const [entries, setEntries] = useState<Record<number, ReviewEntry>>(() => seedEntries(items))
  const [summary, setSummary] = useState(initialSummary ?? "")
  const [confirmOpen, setConfirmOpen] = useState(false)

  const reviewedCount = useMemo(
    () => items.filter((i) => entries[i.id]?.outcome != null).length,
    [items, entries]
  )
  const allReviewed = items.length > 0 && reviewedCount === items.length
  const progressPct = items.length === 0 ? 0 : Math.round((reviewedCount / items.length) * 100)

  function setOutcome(itemId: number, outcome: FinalItemOutcome | null) {
    setEntries((prev) => ({ ...prev, [itemId]: { ...(prev[itemId] ?? { note: "" }), outcome } }))
  }

  function setNote(itemId: number, note: string) {
    setEntries((prev) => ({ ...prev, [itemId]: { ...(prev[itemId] ?? { outcome: null }), note } }))
  }

  function buildPayload(): ConfirmSessionPayload {
    return {
      items: items.map((item) => {
        const entry = entries[item.id]
        return {
          id: item.id,
          // allReviewed guarantees every outcome is set before this is called
          outcome: entry.outcome as FinalItemOutcome,
          outcome_note: entry.note.trim() ? entry.note.trim() : null,
        }
      }),
      summary_note: summary.trim() ? summary.trim() : null,
    }
  }

  function handleConfirm() {
    setConfirmOpen(false)
    onConfirm(buildPayload())
  }

  return (
    <div className={cn("space-y-5", compact && "space-y-4")}>
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <ClipboardCheck className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">End of day review</p>
              <p className="text-xs text-muted-foreground">Mark how each planned item went.</p>
            </div>
          </div>
          <Badge variant={allReviewed ? "default" : "secondary"} className="tabular-nums">
            {reviewedCount} of {items.length} reviewed
          </Badge>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all duration-300", allReviewed ? "bg-emerald-500" : "bg-primary")}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          There are no items to review. Add at least one item before confirming your day.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => {
            const entry = entries[item.id] ?? { outcome: null, note: "" }
            return (
              <li
                key={item.id}
                className={cn(
                  "space-y-3 rounded-lg border p-3 transition-colors",
                  entry.outcome === null ? "border-border bg-card/40" : "bg-card/60",
                  entry.outcome === "done" && "border-emerald-500/30",
                  entry.outcome === "partial" && "border-amber-500/30",
                  entry.outcome === "not_done" && "border-red-500/30"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[10px] text-muted-foreground">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-medium leading-tight">{item.title}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <PriorityBadge priority={item.priority} />
                      {item.carried_from_item_id && (
                        <Badge variant="secondary" className="gap-1">
                          <RotateCcw />
                          Carried over
                        </Badge>
                      )}
                      {item.task && (
                        <span className="inline-flex items-center gap-1 text-[0.625rem] text-muted-foreground">
                          <Link2 className="size-2.5" />
                          <span className="truncate">{item.task.name}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Outcome toggle */}
                <ToggleGroup
                  type="single"
                  variant="outline"
                  value={entry.outcome ?? ""}
                  onValueChange={(v) => setOutcome(item.id, (v || null) as FinalItemOutcome | null)}
                  disabled={submitting}
                  className="w-full"
                  aria-label={`Outcome for ${item.title}`}
                >
                  {FINAL_OUTCOMES.map((o) => {
                    const Icon = outcomeToggleMeta[o].icon
                    return (
                      <ToggleGroupItem
                        key={o}
                        value={o}
                        className={cn("flex-1 gap-1.5 text-xs", outcomeToggleMeta[o].active)}
                      >
                        <Icon className="size-3.5" />
                        {OUTCOME_LABELS[o]}
                      </ToggleGroupItem>
                    )
                  })}
                </ToggleGroup>

                {/* Note — encouraged for anything not fully done */}
                <div className="space-y-1">
                  <Label htmlFor={`note-${item.id}`} className="text-xs text-muted-foreground">
                    Note {entry.outcome && entry.outcome !== "done" ? "(what got in the way?)" : "(optional)"}
                  </Label>
                  <Textarea
                    id={`note-${item.id}`}
                    value={entry.note}
                    onChange={(e) => setNote(item.id, e.target.value)}
                    placeholder="Anything worth remembering about this item…"
                    rows={2}
                    maxLength={2000}
                    disabled={submitting}
                    className="min-h-14 text-xs"
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {/* Summary */}
      <div className="space-y-2">
        <Label htmlFor="eod-summary" className="text-sm font-semibold">
          Day summary
        </Label>
        <Textarea
          id="eod-summary"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="A few lines on how the day went, blockers, and what to pick up tomorrow…"
          rows={4}
          maxLength={5000}
          disabled={submitting}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel} disabled={submitting}>
          Back to planning
        </Button>
        <Button onClick={() => setConfirmOpen(true)} disabled={!allReviewed || submitting} size="lg">
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Lock className="size-4" />}
          Confirm day
        </Button>
      </div>
      {!allReviewed && items.length > 0 && (
        <p className="text-right text-xs text-muted-foreground">
          Choose an outcome for every item to enable confirmation.
        </p>
      )}

      {/* Lock confirmation */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm and lock today?</AlertDialogTitle>
            <AlertDialogDescription>
              Your outcomes and summary will be saved and the day becomes read-only. Only an administrator can
              reopen it afterwards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              <Lock className="size-3.5" />
              Confirm day
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
