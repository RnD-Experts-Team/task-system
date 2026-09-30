// src/app/roadmap-admin/pages/visitors/page.tsx
// Visitors & Abuse: visitors table (banned / suspicious / search), detail sheet, ban and bulk
// remove dialogs, and the recent abuse events feed.
// Deep links: ?visitor=ULID opens the sheet, ?ip=<hash> opens the bulk-remove dialog prefilled.

import { useState } from "react"
import { useSearchParams } from "react-router"
import { Ban, Fingerprint, RefreshCw, Search, ShieldCheck, Trash2, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AbuseEventsList } from "../../components/abuse-events-list"
import { BulkRemoveDialog } from "../../components/bulk-remove-dialog"
import { EmptyState } from "../../components/empty-state"
import { ErrorState } from "../../components/error-state"
import { PageHeader } from "../../components/page-header"
import { PaginationBar } from "../../components/pagination-bar"
import { TableSkeleton } from "../../components/skeletons"
import { VisitorDetailSheet } from "../../components/visitor-detail-sheet"
import { useDebouncedValue } from "../../hooks/useDebouncedValue"
import { useRoadmapPermissions } from "../../hooks/useRoadmapPermissions"
import { useAbuseEvents, useVisitors } from "../../hooks/useVisitors"
import { timeAgo } from "../../utils/format"

type VisitorFilter = "all" | "banned" | "trusted" | "suspicious"
const PER_PAGE = 25

export default function RoadmapVisitorsPage() {
  const { canModerate } = useRoadmapPermissions()
  const [searchParams, setSearchParams] = useSearchParams()
  const openVisitorId = searchParams.get("visitor")
  const ipParam = searchParams.get("ip")

  const [filter, setFilter] = useState<VisitorFilter>("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkDismissedIp, setBulkDismissedIp] = useState<string | null>(null)
  const debouncedSearch = useDebouncedValue(search.trim(), 300)

  const { visitors: allVisitors, pagination: serverPagination, loading, error, refetch } = useVisitors({
    banned: filter === "banned" ? true : undefined,
    trusted: filter === "trusted" ? true : undefined,
    q: debouncedSearch || undefined,
    sort: "last_seen",
    page,
    // "Suspicious" is a computed flag, so it is filtered client-side over a bigger page
    per_page: filter === "suspicious" ? 100 : PER_PAGE,
  })
  const visitors = filter === "suspicious" ? allVisitors.filter((v) => v.suspicious) : allVisitors
  const pagination = filter === "suspicious" ? null : serverPagination
  const events = useAbuseEvents()

  // A ?ip= deep link opens the bulk-remove dialog prefilled (until dismissed)
  const ipDialogOpen = ipParam !== null && bulkDismissedIp !== ipParam

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const firstLoad = loading && visitors.length === 0
  const hasFilters = filter !== "all" || search !== ""

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        title="Visitors & Abuse"
        description="Anonymous visitors, what they did, and the tools to deal with spam and vote manipulation."
        actions={
          <>
            <Button
              variant="outline"
              size="lg"
              className="gap-1.5"
              onClick={() => {
                void refetch()
                void events.refetch()
              }}
              disabled={loading}
            >
              <RefreshCw className={loading ? "animate-spin" : undefined} />
              Refresh
            </Button>
            {canModerate && (
              <Button variant="destructive" size="lg" className="gap-1.5" onClick={() => setBulkOpen(true)}>
                <Trash2 />
                Bulk remove…
              </Button>
            )}
          </>
        }
      />

      <Tabs defaultValue="visitors">
        <TabsList>
          <TabsTrigger value="visitors">Visitors</TabsTrigger>
          <TabsTrigger value="events">Abuse events</TabsTrigger>
        </TabsList>

        <TabsContent value="visitors" className="space-y-4 pt-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
                placeholder="Search by ID or IP hash…"
                className="ps-8 font-mono"
                aria-label="Search visitors"
              />
            </div>
            <Select
              value={filter}
              onValueChange={(v) => {
                setFilter(v as VisitorFilter)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-44" aria-label="Filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All visitors</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
                <SelectItem value="trusted">Trusted</SelectItem>
                <SelectItem value="suspicious">Suspicious (latest 100)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && visitors.length === 0 ? (
            <ErrorState message={error} onRetry={() => void refetch()} />
          ) : firstLoad ? (
            <TableSkeleton columns={["Visitor", "Network", "Posts", "Comments", "Votes", "Last seen"]} />
          ) : visitors.length === 0 ? (
            <EmptyState
              icon={hasFilters ? Ban : Users}
              title={hasFilters ? "No visitors match" : "No visitors yet"}
              description={hasFilters ? "Try another filter or search term." : "Visitors appear once someone posts, comments or votes."}
            />
          ) : (
            <>
              <div className="w-full overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[200px]">Visitor</TableHead>
                      <TableHead className="hidden sm:table-cell">Network</TableHead>
                      <TableHead className="w-16 text-end">Posts</TableHead>
                      <TableHead className="hidden w-20 text-end md:table-cell">Comments</TableHead>
                      <TableHead className="w-16 text-end">Votes</TableHead>
                      <TableHead className="hidden lg:table-cell">Last seen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitors.map((v) => (
                      <TableRow
                        key={v.id}
                        tabIndex={0}
                        aria-label={`Open visitor ${v.id.slice(0, 8)}`}
                        className="cursor-pointer outline-none focus-visible:bg-muted/60"
                        onClick={() => setParam("visitor", v.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            setParam("visitor", v.id)
                          }
                        }}
                      >
                        <TableCell className="py-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-mono text-sm">{v.id.slice(0, 10)}</span>
                            {v.is_banned && <Badge variant="destructive">Banned</Badge>}
                            {v.is_trusted && (
                              <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                <ShieldCheck />
                                Trusted
                              </Badge>
                            )}
                            {v.suspicious && (
                              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
                                Suspicious
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden py-3 sm:table-cell">
                          <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                            <Fingerprint className="size-3" />
                            {v.ip_hash_short ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell className="py-3 text-end tabular-nums">{v.posts_count}</TableCell>
                        <TableCell className="hidden py-3 text-end tabular-nums md:table-cell">{v.comments_count}</TableCell>
                        <TableCell className="py-3 text-end tabular-nums">{v.votes_count}</TableCell>
                        <TableCell className="hidden py-3 text-muted-foreground lg:table-cell">{timeAgo(v.last_seen_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <PaginationBar pagination={pagination} label="visitors" onPageChange={setPage} />
            </>
          )}
        </TabsContent>

        <TabsContent value="events" className="pt-2">
          <AbuseEventsList events={events.events} loading={events.loading} error={events.error} onRetry={() => void events.refetch()} />
        </TabsContent>
      </Tabs>

      <VisitorDetailSheet visitorId={openVisitorId} onClose={() => setParam("visitor", null)} />
      <BulkRemoveDialog
        open={bulkOpen || ipDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setBulkOpen(false)
            if (ipParam) setBulkDismissedIp(ipParam)
          }
        }}
        initial={ipDialogOpen && ipParam ? { by: "ip_hash", value: ipParam } : null}
      />
    </div>
  )
}
