// src/app/work-sessions/components/ratings-table.tsx
// One row per user for a given month: activity stats for context plus an
// inline score / comment editor. Drafts live in this component keyed by user
// id and are dropped when the month changes or after a successful save.

import { useState } from "react"
import { Eraser, Loader2, Save, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { MonthlyRatingRow, UpsertRatingPayload, YearMonth } from "../types"
import { formatDateTime, monthLabel } from "../utils/format"
import { CompletionBadge } from "./completion-badge"
import { EmptyState } from "./empty-state"

type RatingsTableProps = {
  rows: MonthlyRatingRow[]
  yearMonth: YearMonth
  onSave: (userId: number, payload: UpsertRatingPayload) => Promise<boolean>
  onClear: (userId: number) => Promise<boolean>
  savingUserId: number | null
}

type Draft = { score: string; comment: string }

// Two initials from a full name ("John Doe" → "JD")
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Laravel serializes decimal(5,2) as a string ("87.50") — normalize to a number
function scoreToNumber(score: string | number | null | undefined): number | null {
  if (score === null || score === undefined || score === "") return null
  const n = typeof score === "number" ? score : Number(score)
  return Number.isFinite(n) ? n : null
}

// Trim trailing zeros for the input ("87.50" → "87.5", "90.00" → "90")
function scoreToInput(score: string | number | null | undefined): string {
  const n = scoreToNumber(score)
  return n === null ? "" : String(n)
}

// Validates a draft score: numeric, 0..100
function parseScore(value: string): number | null {
  if (value.trim() === "") return null
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0 || n > 100) return null
  return n
}

export function RatingsTable({ rows, yearMonth, onSave, onClear, savingUserId }: RatingsTableProps) {
  const monthKey = `${yearMonth.year}-${yearMonth.month}`

  // Drafts keyed by user id. Reset when the month changes (React's
  // "adjust state while rendering" pattern — no effect needed).
  const [drafts, setDrafts] = useState<Record<number, Draft>>({})
  const [draftsMonthKey, setDraftsMonthKey] = useState(monthKey)
  if (draftsMonthKey !== monthKey) {
    setDraftsMonthKey(monthKey)
    setDrafts({})
  }

  // Per-row Clear confirmation
  const [clearTarget, setClearTarget] = useState<MonthlyRatingRow | null>(null)

  function draftFor(row: MonthlyRatingRow): Draft {
    return (
      drafts[row.user.id] ?? {
        score: scoreToInput(row.rating?.score),
        comment: row.rating?.comment ?? "",
      }
    )
  }

  function updateDraft(row: MonthlyRatingRow, patch: Partial<Draft>) {
    setDrafts((prev) => ({ ...prev, [row.user.id]: { ...draftFor(row), ...patch } }))
  }

  function dropDraft(userId: number) {
    setDrafts((prev) => {
      const next = { ...prev }
      delete next[userId]
      return next
    })
  }

  async function handleSave(row: MonthlyRatingRow) {
    const draft = draftFor(row)
    const score = parseScore(draft.score)
    if (score === null) return
    const ok = await onSave(row.user.id, { score, comment: draft.comment.trim() || null })
    if (ok) dropDraft(row.user.id)
  }

  async function handleClearConfirm() {
    if (!clearTarget) return
    const ok = await onClear(clearTarget.user.id)
    if (ok) dropDraft(clearTarget.user.id)
    setClearTarget(null)
  }

  // Resolve the rater's name from the rows themselves (every user is listed)
  function raterName(ratedBy: number | null): string | null {
    if (ratedBy === null) return null
    return rows.find((r) => r.user.id === ratedBy)?.user.name ?? null
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No users to rate"
        description="There are no users available for this month."
      />
    )
  }

  return (
    <>
      <div className="w-full overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">User</TableHead>
              <TableHead className="min-w-[200px]">Activity</TableHead>
              <TableHead className="w-28">Score</TableHead>
              <TableHead className="min-w-[220px]">Comment</TableHead>
              <TableHead className="w-[150px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const draft = draftFor(row)
              const existingScore = scoreToNumber(row.rating?.score)
              const existingComment = row.rating?.comment ?? ""
              const parsed = parseScore(draft.score)
              const valid = parsed !== null
              const dirty =
                parsed !== existingScore || draft.comment.trim() !== existingComment.trim()
              const saving = savingUserId === row.user.id
              const busy = savingUserId !== null
              const rater = row.rating ? raterName(row.rating.rated_by) : null

              return (
                <TableRow key={row.user.id}>
                  {/* User */}
                  <TableCell className="align-top">
                    <div className="flex items-center gap-2">
                      <Avatar className="size-8">
                        <AvatarImage src={row.user.avatar_url ?? undefined} alt={row.user.name} />
                        <AvatarFallback className="text-[10px]">{getInitials(row.user.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{row.user.name}</p>
                        {row.user.email && (
                          <p className="truncate text-xs text-muted-foreground">{row.user.email}</p>
                        )}
                      </div>
                    </div>
                    {row.rating && (
                      <p className="mt-1.5 text-[0.6875rem] text-muted-foreground">
                        Rated{rater ? ` by ${rater}` : ""} on {formatDateTime(row.rating.updated_at)}
                      </p>
                    )}
                  </TableCell>

                  {/* Activity context */}
                  <TableCell className="align-top">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        <span className="font-medium tabular-nums text-foreground">{row.stats.sessions_count}</span>{" "}
                        {row.stats.sessions_count === 1 ? "session" : "sessions"}
                      </span>
                      <span>
                        <span className="font-medium tabular-nums text-foreground">{row.stats.items_total}</span>{" "}
                        {row.stats.items_total === 1 ? "item" : "items"}
                      </span>
                      <CompletionBadge pct={row.stats.completion_pct} />
                    </div>
                    <p className="mt-1 text-[0.6875rem] tabular-nums text-muted-foreground">
                      <span className="text-emerald-700 dark:text-emerald-400">{row.stats.done} done</span>
                      {" · "}
                      <span className="text-amber-700 dark:text-amber-400">{row.stats.partial} partial</span>
                      {" · "}
                      <span className="text-red-700 dark:text-red-400">{row.stats.not_done} not done</span>
                    </p>
                  </TableCell>

                  {/* Score */}
                  <TableCell className="align-top">
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        inputMode="decimal"
                        value={draft.score}
                        onChange={(e) => updateDraft(row, { score: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && dirty && valid && !busy) handleSave(row)
                        }}
                        disabled={saving}
                        aria-invalid={draft.score !== "" && !valid}
                        aria-label={`Score for ${row.user.name}`}
                        placeholder="0–100"
                        className="h-8 pr-6 text-sm tabular-nums"
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        %
                      </span>
                    </div>
                  </TableCell>

                  {/* Comment */}
                  <TableCell className="align-top">
                    <Input
                      value={draft.comment}
                      onChange={(e) => updateDraft(row, { comment: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && dirty && valid && !busy) handleSave(row)
                      }}
                      disabled={saving}
                      maxLength={1000}
                      placeholder="Optional comment"
                      aria-label={`Comment for ${row.user.name}`}
                      className="h-8 text-sm"
                    />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="align-top">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        className="h-8 gap-1.5"
                        disabled={!dirty || !valid || busy}
                        onClick={() => handleSave(row)}
                      >
                        {saving ? <Loader2 className="animate-spin" /> : <Save />}
                        Save
                      </Button>
                      {row.rating && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 gap-1.5 text-muted-foreground hover:text-destructive"
                          disabled={busy}
                          onClick={() => setClearTarget(row)}
                          aria-label={`Clear rating for ${row.user.name}`}
                        >
                          <Eraser />
                          Clear
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Clear confirmation */}
      <AlertDialog open={clearTarget !== null} onOpenChange={(open) => !open && setClearTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear this rating?</AlertDialogTitle>
            <AlertDialogDescription>
              {clearTarget
                ? `${clearTarget.user.name}'s rating for ${monthLabel(yearMonth.year, yearMonth.month)} will be removed. This cannot be undone.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={savingUserId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={savingUserId !== null}
              onClick={(e) => {
                // Keep the dialog open until the request settles
                e.preventDefault()
                handleClearConfirm()
              }}
            >
              {savingUserId !== null ? "Clearing…" : "Clear rating"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
