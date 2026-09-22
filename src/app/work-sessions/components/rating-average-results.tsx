// src/app/work-sessions/components/rating-average-results.tsx
// Results block for the "Average" tab: summary tiles + per-user ranking of
// average monthly scores over the selected range.

import { useMemo } from "react"
import { BarChart3, CalendarRange, TrendingUp, Trophy, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { PerUserAverage, RatingAverageResponse } from "../types"
import { completionTone, completionToneClasses } from "../utils/format"
import { KpiTile } from "./kpi-tile"

// Two initials from a full name ("John Doe" → "JD")
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Average desc; users without any rating sink to the bottom
function byAverageDesc(a: PerUserAverage, b: PerUserAverage) {
  if (a.average_score === null && b.average_score === null) return 0
  if (a.average_score === null) return 1
  if (b.average_score === null) return -1
  return b.average_score - a.average_score
}

// "2026-09" → "Sep 2026" for the range hint (falls back to raw)
function rangeLabel(value: string): string {
  const [y, m] = value.split("-").map(Number)
  if (!y || !m) return value
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "short", year: "numeric" })
}

function formatPct(value: number | null): string {
  return value === null ? "—" : `${Math.round(value * 100) / 100}%`
}

export function RatingAverageResults({ result }: { result: RatingAverageResponse }) {
  const sorted = useMemo(() => [...result.per_user].sort(byAverageDesc), [result.per_user])
  const topPerformer = sorted.find((u) => u.average_score !== null) ?? null
  const overallTone = completionTone(result.overall_average)

  return (
    <div className="flex flex-col gap-4">
      {/* Summary tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile
          label="Overall average"
          value={formatPct(result.overall_average)}
          hint="Mean of per-user averages"
          icon={TrendingUp}
          tone={overallTone === "none" ? "default" : overallTone}
        />
        <KpiTile
          label="Users rated"
          value={
            <>
              {result.users_with_ratings}
              <span className="text-base font-medium text-muted-foreground"> / {result.per_user.length}</span>
            </>
          }
          hint="With at least one rated month"
          icon={Users}
        />
        <KpiTile
          label="Months in range"
          value={result.range.months_in_range}
          hint={`${rangeLabel(result.range.from)} – ${rangeLabel(result.range.to)}`}
          icon={CalendarRange}
        />
        {topPerformer ? (
          <Card className="transition-all hover:border-primary/20 hover:shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Top performer
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Avatar className="size-7">
                      <AvatarImage src={topPerformer.avatar_url ?? undefined} alt={topPerformer.user_name} />
                      <AvatarFallback className="text-[9px]">{getInitials(topPerformer.user_name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{topPerformer.user_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatPct(topPerformer.average_score)} avg over {topPerformer.months_rated}{" "}
                        {topPerformer.months_rated === 1 ? "month" : "months"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="shrink-0 rounded-lg bg-amber-500/10 p-2">
                  <Trophy className="size-4 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <KpiTile label="Top performer" value="—" hint="No ratings in range" icon={Trophy} />
        )}
      </div>

      {/* Per-user table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <BarChart3 className="size-4 text-primary" />
            </div>
            <CardTitle className="text-base">Per-user averages</CardTitle>
            <Badge variant="secondary" className="ml-auto text-xs">
              {sorted.length} {sorted.length === 1 ? "user" : "users"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Months rated</TableHead>
                  <TableHead className="hidden md:table-cell">Monthly scores</TableHead>
                  <TableHead className="text-right">Average</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sorted.map((u, i) => {
                  const isTop = topPerformer !== null && u.user_id === topPerformer.user_id
                  return (
                    <TableRow key={u.user_id} className={cn(isTop && "bg-amber-500/5")}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7">
                            <AvatarImage src={u.avatar_url ?? undefined} alt={u.user_name} />
                            <AvatarFallback className="text-[9px]">{getInitials(u.user_name)}</AvatarFallback>
                          </Avatar>
                          <span className="truncate text-sm font-medium">{u.user_name}</span>
                          {isTop && <Trophy className="size-3.5 shrink-0 text-amber-500" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {u.months_rated}
                        <span className="text-xs text-muted-foreground"> / {result.range.months_in_range}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {u.ratings.length === 0 ? (
                          <span className="text-xs text-muted-foreground">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {u.ratings.map((r) => (
                              <span
                                key={`${r.year}-${r.month}`}
                                title={rangeLabel(`${r.year}-${String(r.month).padStart(2, "0")}`)}
                                className={cn(
                                  "rounded border px-1.5 py-0.5 font-mono text-[0.625rem] tabular-nums",
                                  completionToneClasses(completionTone(r.score))
                                )}
                              >
                                {r.score}
                              </span>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {u.average_score === null ? (
                          <Badge variant="outline" className="text-muted-foreground">
                            No data
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className={cn("tabular-nums", completionToneClasses(completionTone(u.average_score)))}
                          >
                            {formatPct(u.average_score)}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          <p className="border-t px-4 py-2.5 text-xs text-muted-foreground">
            Averages are over rated months only — months without a rating are not counted as zero.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
