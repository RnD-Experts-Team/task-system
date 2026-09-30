// src/app/roadmap-admin/pages/changelog/page.tsx
// Changelog list: status + board filters, publish / unpublish, delete.

import { useState } from "react"
import { Link, useNavigate } from "react-router"
import { Eye, EyeOff, Megaphone, MoreHorizontal, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BoardSelect } from "../../components/board-select"
import { ChangelogLabelBadge, ChangelogStatusBadge } from "../../components/changelog-badges"
import { ConfirmDialog } from "../../components/confirm-dialog"
import { EmptyState } from "../../components/empty-state"
import { ErrorState } from "../../components/error-state"
import { PageHeader } from "../../components/page-header"
import { PaginationBar } from "../../components/pagination-bar"
import { TableSkeleton } from "../../components/skeletons"
import { useChangelogList } from "../../hooks/useChangelog"
import { useRoadmapPermissions } from "../../hooks/useRoadmapPermissions"
import { useChangelogStore } from "../../store/changelogStore"
import { formatDateTime } from "../../utils/format"
import type { AdminChangelogEntry, ChangelogStatus } from "../../types"

const PER_PAGE = 20

export default function RoadmapChangelogPage() {
  const navigate = useNavigate()
  const { canManageChangelog } = useRoadmapPermissions()
  const [status, setStatus] = useState<ChangelogStatus | "all">("all")
  const [boardId, setBoardId] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<AdminChangelogEntry | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const { entries, pagination, loading, error, refetch } = useChangelogList({
    status,
    board_id: boardId ?? undefined,
    page,
    per_page: PER_PAGE,
  })
  const publish = useChangelogStore((s) => s.publish)
  const unpublish = useChangelogStore((s) => s.unpublish)
  const remove = useChangelogStore((s) => s.remove)

  async function confirmDelete() {
    if (!deleting) return
    setDeleteBusy(true)
    const result = await remove(deleting.id)
    setDeleteBusy(false)
    if (result.ok) setDeleting(null)
  }

  const filtered = status !== "all" || boardId !== null

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        title="Changelog"
        description="Announce what shipped. Entries can be scheduled and linked to the requests they fulfil."
        badge={pagination ? `${pagination.total} entries` : undefined}
        actions={
          <>
            <Button variant="outline" size="lg" className="gap-1.5" onClick={() => void refetch()} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : undefined} />
              Refresh
            </Button>
            {canManageChangelog && (
              <Button asChild size="lg" className="gap-1.5">
                <Link to="/roadmap-admin/changelog/new">
                  <Plus />
                  New entry
                </Link>
              </Button>
            )}
          </>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select
          value={status}
          onValueChange={(v) => {
            setStatus(v as ChangelogStatus | "all")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-40" aria-label="Status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
        <BoardSelect
          value={boardId}
          onChange={(next) => {
            setBoardId(next)
            setPage(1)
          }}
        />
      </div>

      {error && entries.length === 0 ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : loading && entries.length === 0 ? (
        <TableSkeleton columns={["Entry", "Label", "Status", "Date", "Posts", ""]} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title={filtered ? "No entries match these filters" : "No changelog entries yet"}
          description={filtered ? "Try another status or board." : "Write your first release note to keep visitors in the loop."}
          action={
            canManageChangelog && !filtered ? (
              <Button asChild size="lg">
                <Link to="/roadmap-admin/changelog/new">
                  <Plus />
                  Write an entry
                </Link>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="w-full overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[240px]">Entry</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden w-20 text-end sm:table-cell">Posts</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id} className="cursor-pointer" onClick={() => navigate(`/roadmap-admin/changelog/${entry.id}`)}>
                    <TableCell className="w-full max-w-0 py-3 whitespace-normal">
                      <p className="truncate font-medium">{entry.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{entry.board ? entry.board.name : "All boards"}</p>
                    </TableCell>
                    <TableCell className="py-3">
                      <ChangelogLabelBadge label={entry.label} />
                    </TableCell>
                    <TableCell className="py-3">
                      <ChangelogStatusBadge entry={entry} />
                    </TableCell>
                    <TableCell className="hidden py-3 text-muted-foreground md:table-cell">{formatDateTime(entry.published_at ?? entry.updated_at)}</TableCell>
                    <TableCell className="hidden py-3 text-end tabular-nums sm:table-cell">{entry.linked_posts_count}</TableCell>
                    <TableCell className="py-3 text-end" onClick={(e) => e.stopPropagation()}>
                      {canManageChangelog && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Actions for ${entry.title}`}>
                              <MoreHorizontal />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => navigate(`/roadmap-admin/changelog/${entry.id}`)}>
                              <Pencil />
                              Edit
                            </DropdownMenuItem>
                            {entry.status === "draft" ? (
                              <DropdownMenuItem onSelect={() => void publish(entry.id)}>
                                <Eye />
                                Publish now
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onSelect={() => void unpublish(entry.id)}>
                                <EyeOff />
                                Unpublish
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(entry)}>
                              <Trash2 />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationBar pagination={pagination} label="entries" onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete “${deleting?.title ?? ""}”?`}
        description="This removes the entry from the public changelog and RSS feed. Linked posts are not affected."
        confirmLabel="Delete entry"
        destructive
        busy={deleteBusy}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
