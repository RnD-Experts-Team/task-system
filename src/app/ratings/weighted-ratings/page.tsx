import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DateInput } from "@/components/ui/date-input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertCircle,
  BarChart3,
  Calculator,
  Loader2,
  Trophy,
  TrendingUp,
  Users,
  X,
} from "lucide-react"
import { useUsers } from "@/hooks/useUsers"
import { useCalculateWeightedRatingsSOS } from "./hooks/useCalculateWeightedRatingsSOS"

// ── Types ─────────────────────────────────────────────────────────────────────

type WeightedResult = {
  userId: string
  name: string
  avatarUrl: string | null
  // ratingPercent is null when the user had no rated tasks in the selected period
  ratingPercent: number | null
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function WeightedRatingsPage() {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  // Holds the mapped & sorted results after a successful API call
  const [results, setResults] = useState<WeightedResult[]>([])

  const { users } = useUsers()

  // Hook that wraps the POST /final-ratings/calculate-weighted-ratings-sos call
  const { calculate, calculating, error, clearError } = useCalculateWeightedRatingsSOS()

  const activeUsers = useMemo(() => (users ?? []).filter((u) => u.status === "active"), [users])

  function toggleUser(userId: string) {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  function toggleAllUsers() {
    if (selectedUserIds.length === activeUsers.length) {
      setSelectedUserIds([])
    } else {
      setSelectedUserIds(activeUsers.map((u) => u.id))
    }
  }

  async function handleCalculate() {
    // Determine which users to calculate for (all active if none explicitly selected)
    const selected =
      selectedUserIds.length > 0
        ? activeUsers.filter((u) => selectedUserIds.includes(u.id))
        : activeUsers

    // Build the API payload; user_ids must be integers per the backend contract
    const payload = {
      user_ids: selected.map((u) => parseInt(u.id, 10)),
      start_date: startDate,
      end_date: endDate,
    }

    // Clear previous results before firing the request
    setResults([])

    // Call the API; the hook handles loading & error state
    const apiResults = await calculate(payload)
    if (!apiResults) return  // error already captured in the hook's error state

    // Merge API results (returned in the same order as user_ids) with local
    // user objects to attach avatar URLs and stable IDs for rendering
    const computed: WeightedResult[] = apiResults.map((r, i) => {
      const user = selected[i]
      return {
        userId: user?.id ?? String(i),
        name: r.user_name,
        avatarUrl: user?.avatarUrl ?? null,
        ratingPercent: r.rating,  // already a percentage (0–100) or null
      }
    })

    // Sort descending by rating; users with null ratings sink to the bottom
    computed.sort((a, b) => {
      if (a.ratingPercent === null && b.ratingPercent === null) return 0
      if (a.ratingPercent === null) return 1
      if (b.ratingPercent === null) return -1
      return b.ratingPercent - a.ratingPercent
    })

    setResults(computed)
  }

  // Average over only the users that actually have a rating in the period
  const averageRating = useMemo(() => {
    const rated = results.filter((r) => r.ratingPercent !== null)
    if (rated.length === 0) return 0
    const sum = rated.reduce((acc, r) => acc + (r.ratingPercent as number), 0)
    return Math.round((sum / rated.length) * 100) / 100
  }, [results])

  // First entry with a non-null rating (list is already sorted descending)
  const topPerformer = useMemo(
    () => results.find((r) => r.ratingPercent !== null) ?? null,
    [results]
  )

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold tracking-tight">
            Weighted Ratings (SOS)
          </h2>
          {results.length > 0 && (
            <Badge variant="secondary" className="uppercase tracking-wider">
              {results.length} {results.length === 1 ? "Result" : "Results"}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground max-w-lg">
          Calculate and compare weighted ratings across team members using the SOS methodology.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2">
              <Users className="size-4 text-primary" />
            </div>
            <CardTitle className="text-base">Filters</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {/* User multi-select */}
          <div className="space-y-2">
            <Label className="text-xs">Select Users</Label>
            <div className="rounded-md border max-h-48 overflow-y-auto">
              {/* Select all */}
              <button
                type="button"
                onClick={toggleAllUsers}
                className="flex w-full items-center gap-3 border-b px-3 py-2 text-sm transition-colors hover:bg-muted/50"
              >
                <Checkbox
                  checked={
                    selectedUserIds.length === activeUsers.length &&
                    activeUsers.length > 0
                  }
                />
                <span className="font-medium">Select All</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {selectedUserIds.length} / {activeUsers.length}
                </Badge>
              </button>
              {activeUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleUser(user.id)}
                  className="flex w-full items-center gap-3 px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                >
                  <Checkbox
                    checked={selectedUserIds.includes(user.id)}
                  />
                  <Avatar className="size-6">
                    <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                    <AvatarFallback className="text-[9px]">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{user.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {user.role}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Date range + action */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="w-start" className="text-xs">
                Start Date
              </Label>
              <DateInput
                id="w-start"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="w-end" className="text-xs">
                End Date
              </Label>
              <DateInput
                id="w-end"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 text-sm"
              />
            </div>
            <Button onClick={handleCalculate} disabled={calculating} className="shrink-0">
              {calculating ? (
                // Spinner shown while the API request is in-flight
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Calculator className="size-3.5" />
              )}
              {calculating ? "Calculating…" : "Calculate Rating"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error alert — shown when the API call fails (cancellations are ignored) */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Calculation failed</p>
            <p className="mt-0.5 text-sm text-destructive/80">{error}</p>
          </div>
          {/* Dismiss button clears the error without discarding previous results */}
          <button
            type="button"
            onClick={clearError}
            className="text-destructive/60 hover:text-destructive"
            aria-label="Dismiss error"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="transition-all hover:shadow-sm hover:border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Average Rating
                    </p>
                    <p className="text-2xl font-bold tracking-tight">
                      {averageRating}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Across {results.length} users
                    </p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-2">
                    <TrendingUp className="size-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {topPerformer && (
              <Card className="transition-all hover:shadow-sm hover:border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Top Performer
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar className="size-7">
                          <AvatarImage src={topPerformer.avatarUrl ?? undefined} alt={topPerformer.name} />
                          <AvatarFallback className="text-[9px]">
                            {getInitials(topPerformer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold">
                            {topPerformer.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {topPerformer.ratingPercent !== null
                              ? `${topPerformer.ratingPercent}% avg rating`
                              : "No data for period"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-amber-500/10 p-2">
                      <Trophy className="size-4 text-amber-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <BarChart3 className="size-4 text-primary" />
                </div>
                <CardTitle className="text-base">Rating Results</CardTitle>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {results.length} {results.length === 1 ? "user" : "users"}
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
                      <TableHead className="text-right">Rating %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((r, i) => (
                      <TableRow key={r.userId}>
                        <TableCell className="text-muted-foreground font-mono text-xs">
                          {i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="size-7">
                              <AvatarImage src={r.avatarUrl ?? undefined} alt={r.name} />
                              <AvatarFallback className="text-[9px]">
                                {getInitials(r.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {r.name}
                            </span>
                            {/* Trophy only for the top-ranked user with a real rating */}
                            {i === 0 && r.ratingPercent !== null && (
                              <Trophy className="size-3.5 text-amber-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {r.ratingPercent === null ? (
                            // User had no rated tasks in the selected period
                            <Badge variant="outline" className="text-muted-foreground">
                              No data
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className={
                                r.ratingPercent >= 80
                                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                                  : r.ratingPercent >= 60
                                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                                    : "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30"
                              }
                            >
                              {r.ratingPercent}%
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty state */}
      {results.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <BarChart3 className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">No results yet</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Select users, set a date range, and calculate ratings to see results.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
