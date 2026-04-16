// Panel showing all stakeholder ratings submitted for a project.
// Fetches GET /projects/{projectId}/stakeholder-ratings and renders a table
// with the stakeholder's name, final score, individual field scores, and date.
//
// Props:
//   projectId  — the project to load ratings for
//   variant    — "full" (details page) shows all columns;
//                "compact" (sheet sidebar) hides the raw field breakdown

import { AlertCircle, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useStakeholderRatings } from "../hooks/useStakeholderRatings"

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Two-character initials from a full name
function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

// Format an ISO datetime string to a short readable date
function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

/**
 * Derive a color class for the final rating score badge.
 * ≥80 → green, ≥60 → amber, <60 → red.
 */
function ratingColorClass(score: number): string {
  if (score >= 80) return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
  if (score >= 60) return "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
  return "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300"
}

/**
 * Render the raw rating_data fields as a compact pill list.
 * Each field shows "Label: value" in a tooltip-accessible badge.
 * e.g. { quality: 8, communication: 9 } → "Quality: 8", "Communication: 9"
 */
function RatingDataBadges({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data)
  if (entries.length === 0) return <span className="text-xs text-muted-foreground">—</span>

  return (
    <div className="flex flex-wrap gap-1">
      {entries.map(([key, value]) => (
        <Tooltip key={key}>
          <TooltipTrigger asChild>
            {/* Pill badge: human-readable field name + score */}
            <Badge variant="secondary" className="text-xs cursor-default capitalize">
              {key.replace(/_/g, " ")}: {value}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {key.replace(/_/g, " ")} — score: {value}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

interface StakeholderRatingsPanelProps {
  projectId: number | null
  /** "full" = all columns (details page); "compact" = fewer columns (sheet) */
  variant?: "full" | "compact"
}

export function StakeholderRatingsPanel({
  projectId,
  variant = "full",
}: StakeholderRatingsPanelProps) {
  const { ratings, totalCount, loading, error } = useStakeholderRatings(projectId)

  // ── Loading skeleton ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        <AlertCircle className="size-4 shrink-0" />
        <span>{error}</span>
      </div>
    )
  }

  // ── Empty state ────────────────────────────────────────────────
  if (ratings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
        <Star className="size-6 opacity-40" />
        <span>No stakeholder ratings have been submitted for this project yet.</span>
      </div>
    )
  }

  const isCompact = variant === "compact"

  return (
    <div className="space-y-2">
      {/* Summary count */}
      <p className="text-xs text-muted-foreground">
        {totalCount} rating{totalCount !== 1 ? "s" : ""} submitted for this project
      </p>

      {/* Horizontally scrollable for small screens */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              {/* Always visible columns */}
              <TableHead className="min-w-[160px]">Stakeholder</TableHead>
              <TableHead className="min-w-[100px]">Final Score</TableHead>
              {/* Field breakdown hidden in compact (sheet) mode */}
              {!isCompact && <TableHead className="min-w-[220px]">Field Breakdown</TableHead>}
              <TableHead className="min-w-[110px]">Rated At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ratings.map((entry) => {
              // Parse final_rating to a number so we can colour-code it
              const score = parseFloat(entry.final_rating)

              return (
                <TableRow key={entry.id}>
                  {/* Stakeholder identity */}
                  <TableCell className="py-3">
                    {entry.stakeholder ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8 shrink-0">
                          <AvatarImage
                            src={entry.stakeholder.avatar_url ?? undefined}
                            alt={entry.stakeholder.name}
                          />
                          <AvatarFallback className="text-xs">
                            {getInitials(entry.stakeholder.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate leading-tight">
                            {entry.stakeholder.name}
                          </p>
                          {/* Email hidden in compact mode */}
                          {!isCompact && (
                            <p className="text-xs text-muted-foreground truncate">
                              {entry.stakeholder.email}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs italic text-muted-foreground">Unknown</span>
                    )}
                  </TableCell>

                  {/* Final rating score — colour-coded by range */}
                  <TableCell className="py-3">
                    <Badge
                      variant="outline"
                      className={ratingColorClass(score)}
                    >
                      {isNaN(score) ? entry.final_rating : `${score.toFixed(1)} / 100`}
                    </Badge>
                  </TableCell>

                  {/* Per-field breakdown — full variant only */}
                  {!isCompact && (
                    <TableCell className="py-3">
                      <RatingDataBadges data={entry.rating_data} />
                    </TableCell>
                  )}

                  {/* Date the rating was submitted */}
                  <TableCell className="py-3 text-sm text-muted-foreground">
                    {formatDate(entry.rated_at)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
