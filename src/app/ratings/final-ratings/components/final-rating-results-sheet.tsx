import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertCircle,
  FileArchive,
  FileText,
  Loader2,
  Trophy,
  Calendar,
  Settings2,
  BarChart2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useExportFinalRatingsPdf } from "@/app/ratings/final-ratings/hooks/useExportFinalRatingsPdf"
import type {
  CalculateFinalRatingsPayload,
  FinalRatingUserResult,
  FinalRatingsCalculateResult,
  FinalRatingsExportFormat,
} from "@/app/ratings/final-ratings/types"

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format a date string "YYYY-MM-DD" to human-readable */
function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/** Format a datetime ISO string to readable date+time */
function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/** Get initials from a name */
function initials(name: string) {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Colour the progress bar + label based on the final percentage score.
 * ≥ 80 → green  |  ≥ 60 → yellow  |  ≥ 40 → orange  |  < 40 → red
 */
function scoreColour(pct: number): string {
  if (pct >= 80) return "text-emerald-600 dark:text-emerald-400"
  if (pct >= 60) return "text-yellow-600 dark:text-yellow-400"
  if (pct >= 40) return "text-orange-600 dark:text-orange-400"
  return "text-red-600 dark:text-red-400"
}



// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * UserRatingCard
 * Shows one employee's score with an expandable breakdown panel.
 */
function UserRatingCard({
  result,
  rank,
}: {
  result: FinalRatingUserResult
  rank: number
}) {
  const [expanded, setExpanded] = useState(false)
  const { breakdown } = result

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* ── Summary row ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Rank number */}
        <div className="w-7 shrink-0 text-center text-sm font-bold text-muted-foreground">
          #{rank}
        </div>

        {/* Avatar */}
        <Avatar className="size-9 shrink-0">
          <AvatarImage src={result.avatar_url ?? undefined} alt={result.user_name} />
          <AvatarFallback className="text-xs">{initials(result.user_name)}</AvatarFallback>
        </Avatar>

        {/* Name + email */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-tight truncate">{result.user_name}</p>
          <p className="text-xs text-muted-foreground truncate">{result.user_email}</p>
        </div>

        {/* Score badge */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-sm font-bold tabular-nums ${scoreColour(result.final_percentage)}`}>
            {result.final_percentage.toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground tabular-nums hidden sm:block">
            ({result.total_points} / {result.max_points} pts)
          </span>
          {/* Expand / collapse the breakdown panel */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={expanded ? "Hide breakdown" : "Show breakdown"}
          >
            {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
      </div>

      {/* Progress bar — inline implementation (no shadcn progress component available) */}
      <div className="px-4 pb-3">
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${Math.min(result.final_percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* ── Expandable breakdown ─────────────────────────────────── */}
      {expanded && (
        <div className="border-t px-4 py-3 bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Score Breakdown
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {/* Task Ratings */}
            <BreakdownItem label="Task Ratings" value={breakdown.task_ratings?.value ?? 0} />
            {/* Stakeholder Ratings */}
            <BreakdownItem label="Stakeholder Ratings" value={breakdown.stakeholder_ratings?.value ?? 0} />
            {/* Help requests — combined helper + requester */}
            <BreakdownItem label="Help Requests (Helper)" value={breakdown.help_requests?.helper?.value ?? 0} />
            <BreakdownItem label="Help Requests (Requester)" value={breakdown.help_requests?.requester?.value ?? 0} />
            {/* Tickets */}
            <BreakdownItem label="Tickets Resolved" value={breakdown.tickets_resolved?.value ?? 0} />
          </div>
        </div>
      )}
    </div>
  )
}

/** Single labelled points row inside the breakdown panel */
function BreakdownItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-semibold tabular-nums">{value.toFixed(2)} pts</span>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

type FinalRatingResultsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Calculation output from the calculate hook */
  result: FinalRatingsCalculateResult | null
  /** The exact form values used when calculating — re-sent to export-pdf */
  payload: CalculateFinalRatingsPayload | null
  /** Allow the user to go back and recalculate with different params */
  onRecalculate: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FinalRatingResultsSheet({
  open,
  onOpenChange,
  result,
  payload,
  onRecalculate,
}: FinalRatingResultsSheetProps) {
  // Hook for POST /final-ratings/export-pdf (blob download)
  const { exportPdf, exporting, error: exportError, clearError: clearExportError } = useExportFinalRatingsPdf()
  const [exportFormat, setExportFormat] = useState<FinalRatingsExportFormat>("zip")

  /** Download the ZIP — re-uses the same payload that produced the current results */
  async function handleExport() {
    if (!payload) return
    clearExportError()
    await exportPdf(payload, exportFormat)
  }

  // Sort users by final_percentage descending (best score first)
  const sorted = result
    ? [...result.users].sort((a, b) => b.final_percentage - a.final_percentage)
    : []

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* Wide sheet to comfortably display the ranked table */}
      <SheetContent className="sm:max-w-2xl w-full overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <div className="rounded-md bg-primary/10 p-1.5">
              <Trophy className="size-4 text-primary" />
            </div>
            Calculation Results
          </SheetTitle>
          <SheetDescription>
            Final ratings for the selected period. Expand any row to see the full score breakdown.
          </SheetDescription>
        </SheetHeader>

        {result && (
          <div className="flex flex-col gap-4">

            {/* ── Meta / summary strip ─────────────────────────────── */}
            <div className="rounded-lg border bg-card p-4 flex flex-wrap gap-4 text-sm">
              {/* Period */}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="size-3.5 shrink-0" />
                <span>
                  {formatDate(result.period.start)} — {formatDate(result.period.end)}
                </span>
              </div>
              {/* Config used */}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Settings2 className="size-3.5 shrink-0" />
                <span>{result.config.name}</span>
              </div>
              {/* Max points */}
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <BarChart2 className="size-3.5 shrink-0" />
                <span>Max {result.max_points_for_100_percent} pts = 100 %</span>
              </div>
              {/* Total users */}
              <Badge variant="secondary" className="ml-auto">
                {result.users.length} {result.users.length === 1 ? "employee" : "employees"}
              </Badge>
            </div>

            {/* ── Export error banner ─────────────────────────────── */}
            {exportError && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <span className="flex-1">{exportError}</span>
                <button
                  type="button"
                  className="text-xs underline shrink-0"
                  onClick={clearExportError}
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* ── Action bar — Export & Recalculate ──────────────── */}
            <div className="flex items-center gap-2 flex-wrap">
              <Select
                value={exportFormat}
                onValueChange={(value) => setExportFormat(value as FinalRatingsExportFormat)}
              >
                <SelectTrigger className="h-8 w-37.5" disabled={exporting}>
                  <SelectValue placeholder="Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zip">ZIP (all PDFs)</SelectItem>
                  <SelectItem value="pdf">PDF (overview)</SelectItem>
                </SelectContent>
              </Select>

              {/* Export ZIP — same params as the current result */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleExport}
                disabled={exporting}
                className="flex-1 sm:flex-none"
              >
                {exporting ? (
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                ) : exportFormat === "zip" ? (
                  <FileArchive className="size-3.5 mr-1.5" />
                ) : (
                  <FileText className="size-3.5 mr-1.5" />
                )}
                {exporting ? "Exporting…" : `Export as ${exportFormat.toUpperCase()}`}
              </Button>

              {/* Back to form to recalculate */}
              <Button
                size="sm"
                variant="ghost"
                onClick={onRecalculate}
                className="flex-1 sm:flex-none"
              >
                Recalculate
              </Button>
            </div>

            {/* ── Empty state ─────────────────────────────────────── */}
            {sorted.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="rounded-full bg-muted p-4">
                  <BarChart2 className="size-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">No employees found</p>
                  <p className="text-sm text-muted-foreground">
                    No users had tasks due within the selected period.
                  </p>
                </div>
              </div>
            )}

            {/* ── Ranked employee cards ───────────────────────────── */}
            <div className="flex flex-col gap-2">
              {sorted.map((user, idx) => (
                <UserRatingCard key={user.user_id} result={user} rank={idx + 1} />
              ))}
            </div>

            {/* ── Footer — calculated at timestamp ────────────────── */}
            <p className="text-xs text-muted-foreground text-center pt-1">
              Calculated at {formatDateTime(result.calculated_at)}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
