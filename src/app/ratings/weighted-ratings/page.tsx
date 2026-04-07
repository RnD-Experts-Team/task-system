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
  BarChart3,
  Calculator,
  Trophy,
  TrendingUp,
  Users,
} from "lucide-react"
import { users } from "@/app/users/data"

// ── Types ─────────────────────────────────────────────────────────────────────

type WeightedResult = {
  userId: string
  name: string
  avatarUrl: string
  totalPoints: number
  ratingPercent: number
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
  const [results, setResults] = useState<WeightedResult[]>([])

  const activeUsers = useMemo(
    () => users.filter((u) => u.status === "active"),
    []
  )

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

  function handleCalculate() {
    const selected =
      selectedUserIds.length > 0
        ? activeUsers.filter((u) => selectedUserIds.includes(u.id))
        : activeUsers

    const computed: WeightedResult[] = selected.map((u) => {
      const totalPoints = Math.round(120 + Math.random() * 80)
      const ratingPercent = Math.round((totalPoints / 200) * 100 * 100) / 100
      return {
        userId: u.id,
        name: u.name,
        avatarUrl: u.avatarUrl,
        totalPoints,
        ratingPercent: Math.min(ratingPercent, 100),
      }
    })

    computed.sort((a, b) => b.ratingPercent - a.ratingPercent)
    setResults(computed)
  }

  const averageRating = useMemo(() => {
    if (results.length === 0) return 0
    const sum = results.reduce((acc, r) => acc + r.ratingPercent, 0)
    return Math.round((sum / results.length) * 100) / 100
  }, [results])

  const topPerformer = useMemo(
    () => (results.length > 0 ? results[0] : null),
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
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
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
            <Button onClick={handleCalculate} className="shrink-0">
              <Calculator className="size-3.5" />
              Calculate Rating
            </Button>
          </div>
        </CardContent>
      </Card>

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
                          <AvatarImage
                            src={topPerformer.avatarUrl}
                            alt={topPerformer.name}
                          />
                          <AvatarFallback className="text-[9px]">
                            {getInitials(topPerformer.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-bold">
                            {topPerformer.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {topPerformer.ratingPercent}% avg rating
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
                      <TableHead className="text-right">Total Points</TableHead>
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
                              <AvatarImage src={r.avatarUrl} alt={r.name} />
                              <AvatarFallback className="text-[9px]">
                                {getInitials(r.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {r.name}
                            </span>
                            {i === 0 && (
                              <Trophy className="size-3.5 text-amber-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {r.totalPoints}
                        </TableCell>
                        <TableCell className="text-right">
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
