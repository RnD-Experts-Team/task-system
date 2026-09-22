import { useState } from "react"
import { Link } from "react-router"
import { AlertCircle, AlertTriangle, CalendarDays, Globe, Loader2, RotateCcw, Sunrise } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { CarryOverCandidate, StartSessionPayload, TodayPayload } from "../types"
import { formatWorkDate } from "../utils/format"
import { OutcomeBadge } from "./outcome-badge"
import { PriorityBadge } from "./priority-badge"

type StartDayDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  today: TodayPayload
  submitting?: boolean
  submitError?: string | null
  onStart: (payload: StartSessionPayload) => void
}

/** Groups carry-over candidates by their source work date (newest first) */
function groupBySourceDate(candidates: CarryOverCandidate[]) {
  const map = new Map<string, CarryOverCandidate[]>()
  for (const c of candidates) {
    const list = map.get(c.source_work_date) ?? []
    list.push(c)
    map.set(c.source_work_date, list)
  }
  return [...map.entries()].sort(([a], [b]) => (a < b ? 1 : a > b ? -1 : 0))
}

/** "Start your day" dialog — date/timezone, carry-over checklist, previous open sessions nudge */
export function StartDayDialog({
  open,
  onOpenChange,
  today,
  submitting = false,
  submitError,
  onStart,
}: StartDayDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <DialogContent className="flex max-h-[90vh] w-[95vw] flex-col gap-0 p-0 sm:max-w-lg">
        {/* DialogContent unmounts when closed, so the body's selection state resets on every open */}
        <StartDayBody
          today={today}
          submitting={submitting}
          submitError={submitError}
          onStart={onStart}
          onDismiss={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type StartDayBodyProps = Omit<StartDayDialogProps, "open" | "onOpenChange"> & {
  onDismiss: () => void
}

/** Dialog body — owns the carry-over selection; mounts fresh each time the dialog opens */
function StartDayBody({ today, submitting = false, submitError, onStart, onDismiss }: StartDayBodyProps) {
  const candidates = today.carry_over_candidates
  const [selected, setSelected] = useState<Set<number>>(() => new Set())

  const allSelected = candidates.length > 0 && selected.size === candidates.length
  const someSelected = selected.size > 0 && !allSelected

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(candidates.map((c) => c.id)))
  }

  function handleStart() {
    onStart(selected.size > 0 ? { carry_over_item_ids: [...selected] } : {})
  }

  const groups = groupBySourceDate(candidates)

  return (
    <>
      <DialogHeader className="border-b px-6 py-5 pr-12">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Sunrise className="size-4 text-primary" />
          </div>
          <div className="space-y-1">
            <DialogTitle>Start your day</DialogTitle>
            <DialogDescription>
              Plan what you intend to work on today, then confirm it at the end of the day.
            </DialogDescription>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-3.5" />
            <span className="font-medium text-foreground">{formatWorkDate(today.today)}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Globe className="size-3.5" />
            {today.company_timezone}
          </span>
        </div>
      </DialogHeader>

      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
        {submitError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Previous open sessions warning */}
        {today.previous_open_sessions.length > 0 && (
          <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs">
            <p className="flex items-center gap-2 font-medium text-amber-700 dark:text-amber-400">
              <AlertTriangle className="size-3.5 shrink-0" />
              You have {today.previous_open_sessions.length} unconfirmed{" "}
              {today.previous_open_sessions.length === 1 ? "day" : "days"}
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {today.previous_open_sessions.map((s) => (
                <li key={s.id}>
                  <Link
                    to="/work-sessions/history"
                    className="rounded-full border border-amber-500/30 bg-background/60 px-2 py-0.5 text-amber-800 underline-offset-2 hover:underline dark:text-amber-300"
                  >
                    {formatWorkDate(s.work_date)}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground">
              You can still start today. Review and confirm them from{" "}
              <Link
                to="/work-sessions/history"
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                History
              </Link>
              .
            </p>
          </div>
        )}

        {/* Carry-over checklist */}
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h4 className="flex items-center gap-2 text-sm font-semibold">
                <RotateCcw className="size-3.5 text-muted-foreground" />
                Carry over unfinished items
              </h4>
              <p className="text-xs text-muted-foreground">
                {candidates.length === 0
                  ? "Nothing left over from your last confirmed day."
                  : "Selected items are copied into today's plan."}
              </p>
            </div>
            {candidates.length > 0 && (
              <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-muted-foreground">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={toggleAll}
                  disabled={submitting}
                  aria-label="Select all"
                />
                Select all
              </label>
            )}
          </div>

          {groups.map(([date, list]) => (
            <div key={date} className="space-y-1.5">
              <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-muted-foreground">
                From {formatWorkDate(date)}
              </p>
              <ul className="space-y-1.5">
                {list.map((c) => {
                  const checked = selected.has(c.id)
                  const id = `carry-${c.id}`
                  return (
                    <li key={c.id}>
                      <Label
                        htmlFor={id}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40",
                          checked && "border-primary/40 bg-primary/5"
                        )}
                      >
                        <Checkbox
                          id={id}
                          checked={checked}
                          onCheckedChange={() => toggle(c.id)}
                          disabled={submitting}
                          className="mt-0.5"
                        />
                        <span className="min-w-0 flex-1 space-y-1">
                          <span className="block text-sm font-medium leading-tight">{c.title}</span>
                          <span className="flex flex-wrap items-center gap-1.5">
                            <OutcomeBadge outcome={c.outcome} />
                            <PriorityBadge priority={c.priority} />
                            {c.task && (
                              <span className="truncate text-[0.625rem] text-muted-foreground">{c.task.name}</span>
                            )}
                          </span>
                        </span>
                      </Label>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </section>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t px-6 py-4 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onDismiss} disabled={submitting}>
          Not now
        </Button>
        <Button onClick={handleStart} disabled={submitting} size="lg">
          {submitting ? <Loader2 className="size-4 animate-spin" /> : <Sunrise className="size-4" />}
          {selected.size > 0 ? `Start with ${selected.size} carried over` : "Start day"}
        </Button>
      </div>
    </>
  )
}
