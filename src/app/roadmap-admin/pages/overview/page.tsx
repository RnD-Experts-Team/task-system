// src/app/roadmap-admin/pages/overview/page.tsx
// Roadmap overview: KPI tiles, votes/day + posts/day charts, top posts, status breakdown and
// the "Needs attention" panel fed by the suspicion heuristics.

import { useState } from "react"
import { Link } from "react-router"
import { ArrowUpRight, Eye, FileText, Inbox, MessageSquare, RefreshCw, ThumbsUp, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BoardSelect } from "../../components/board-select"
import { DailyAreaChart } from "../../components/daily-area-chart"
import { EmptyState } from "../../components/empty-state"
import { ErrorState } from "../../components/error-state"
import { KpiTile } from "../../components/kpi-tile"
import { NeedsAttentionPanel } from "../../components/needs-attention-panel"
import { PageHeader } from "../../components/page-header"
import { ChartCardSkeleton, KpiRowSkeleton } from "../../components/skeletons"
import { StatusPill } from "../../components/status-pill"
import { useAnalytics } from "../../hooks/useAnalytics"
import { plural } from "../../utils/format"

const RANGES = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
]

export default function RoadmapOverviewPage() {
  const [boardId, setBoardId] = useState<number | null>(null)
  const [days, setDays] = useState("30")
  const { data, loading, error, refetch } = useAnalytics({ board_id: boardId ?? undefined, days: Number(days) })

  const backlog = data ? data.moderation_backlog.posts + data.moderation_backlog.comments : 0
  const statusTotal = data ? data.by_status.reduce((sum, row) => sum + row.count, 0) : 0

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        title="Roadmap Overview"
        description="Feedback activity, what's waiting for review, and anything that looks off."
        actions={
          <>
            <BoardSelect value={boardId} onChange={setBoardId} />
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-full sm:w-36" aria-label="Period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="lg" className="gap-1.5" onClick={() => void refetch()} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : undefined} />
              Refresh
            </Button>
          </>
        }
      />

      {error && !data ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : loading && !data ? (
        <>
          <KpiRowSkeleton />
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
            <ChartCardSkeleton />
            <ChartCardSkeleton />
          </div>
        </>
      ) : data ? (
        <>
          {error && <ErrorState title="Couldn't refresh" message={error} onRetry={() => void refetch()} />}

          {/* KPI tiles */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <KpiTile label="Posts" value={data.totals.posts.toLocaleString()} icon={FileText} />
            <KpiTile label="Votes" value={data.totals.votes.toLocaleString()} icon={ThumbsUp} />
            <KpiTile label="Comments" value={data.totals.comments.toLocaleString()} icon={MessageSquare} />
            <KpiTile label="Visitors" value={data.totals.visitors.toLocaleString()} icon={Eye} />
            <Link to="/roadmap-admin/moderation" className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <KpiTile
                label="Moderation backlog"
                value={backlog.toLocaleString()}
                icon={Inbox}
                tone={backlog > 0 ? "warn" : "good"}
                hint={`${plural(data.moderation_backlog.posts, "post")}, ${plural(data.moderation_backlog.comments, "comment")}`}
                className="h-full"
              />
            </Link>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Votes per day</CardTitle>
              </CardHeader>
              <CardContent>
                <DailyAreaChart series={data.votes_per_day} label="Votes" color="var(--chart-2)" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Posts per day</CardTitle>
              </CardHeader>
              <CardContent>
                <DailyAreaChart series={data.posts_per_day} label="Posts" color="var(--chart-4)" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-3">
            {/* Top posts */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Trophy className="size-4 text-primary" />
                  </div>
                  <CardTitle className="text-base">Top posts</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {data.top_posts.length === 0 ? (
                  <EmptyState icon={Trophy} title="No posts yet" description="The most voted requests will be ranked here." className="p-6" />
                ) : (
                  <div className="overflow-hidden rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Post</TableHead>
                          <TableHead className="hidden sm:table-cell">Status</TableHead>
                          <TableHead className="w-20 text-end">Votes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.top_posts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell className="w-full max-w-0 py-2.5">
                              <Link
                                to={`/roadmap-admin/posts?post=${post.id}`}
                                className="group flex items-center gap-1.5 font-medium hover:underline"
                              >
                                <span className="truncate">{post.title}</span>
                                <ArrowUpRight className="size-3 shrink-0 opacity-0 group-hover:opacity-60" />
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                {post.board_slug} · #{post.number}
                              </p>
                            </TableCell>
                            <TableCell className="hidden py-2.5 sm:table-cell">
                              <StatusPill name={post.status.name} color={post.status.color} />
                            </TableCell>
                            <TableCell className="py-2.5 text-end font-semibold tabular-nums">{post.votes_count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* By status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">By status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.by_status.length === 0 || statusTotal === 0 ? (
                  <EmptyState title="No posts yet" className="p-6" />
                ) : (
                  <>
                    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted" role="img" aria-label="Posts by status">
                      {data.by_status
                        .filter((row) => row.count > 0)
                        .map((row) => (
                          <div
                            key={row.status.id}
                            style={{ width: `${(row.count / statusTotal) * 100}%`, backgroundColor: row.status.color }}
                            title={`${row.status.name}: ${row.count}`}
                          />
                        ))}
                    </div>
                    <ul className="space-y-2">
                      {data.by_status.map((row) => (
                        <li key={row.status.id} className="flex items-center justify-between gap-2">
                          <StatusPill name={row.status.name} color={row.status.color} />
                          <span className="text-sm font-medium tabular-nums">{row.count}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <NeedsAttentionPanel items={data.suspicious} />
          {data.suspicious.length > 0 && (
            <p className="-mt-3 text-xs text-muted-foreground">
              Suspicion scores are heuristics, not verdicts. Review before banning.
            </p>
          )}
        </>
      ) : null}
    </div>
  )
}
