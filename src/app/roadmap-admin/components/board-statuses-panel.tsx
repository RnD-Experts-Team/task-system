import { useState } from "react"
import { Columns3, Lock, MoreHorizontal, Pencil, Plus, Star, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useBoardDetail } from "../hooks/useBoards"
import { useBoardsStore } from "../store/boardsStore"
import { humanize } from "../utils/format"
import type { AdminBoard, AdminStatus } from "../types"
import { DeleteStatusDialog } from "./delete-status-dialog"
import { EmptyState } from "./empty-state"
import { ErrorState } from "./error-state"
import { SortableRows } from "./sortable-rows"
import { StatusFormDialog } from "./status-form-dialog"
import { StatusPill } from "./status-pill"

/** Sortable statuses of one board with create / edit / make default / delete. */
export function BoardStatusesPanel({ board, canManage }: { board: AdminBoard; canManage: boolean }) {
  const { statuses, loading, error, refetch } = useBoardDetail(board.id)
  const reorderStatuses = useBoardsStore((s) => s.reorderStatuses)
  const makeStatusDefault = useBoardsStore((s) => s.makeStatusDefault)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminStatus | null>(null)
  const [deleting, setDeleting] = useState<AdminStatus | null>(null)

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Columns3 className="size-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">Statuses · {board.name}</CardTitle>
            <p className="text-xs text-muted-foreground">Drag to reorder. The order is used on the roadmap and in pickers.</p>
          </div>
          {canManage && (
            <Button
              size="lg"
              className="gap-1.5"
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              <Plus />
              Add status
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && statuses.length === 0 ? (
          <ErrorState message={error} onRetry={() => void refetch()} />
        ) : loading && statuses.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : statuses.length === 0 ? (
          <EmptyState title="No statuses" description="Add a status to start triaging posts." className="p-6" />
        ) : (
          <SortableRows
            items={statuses}
            disabled={!canManage}
            labelFor={(s) => s.name}
            onReorder={(ids) => void reorderStatuses(board.id, ids)}
            renderRow={(status) => (
              <>
                <StatusPill name={status.name} color={status.color} />
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{humanize(status.kind)}</span>
                  {status.is_default && (
                    <Badge variant="secondary" className="gap-1">
                      <Star />
                      Default
                    </Badge>
                  )}
                  {status.is_roadmap_column && <Badge variant="outline">Roadmap</Badge>}
                  {status.locks_voting && (
                    <Badge variant="outline" className="gap-1">
                      <Lock />
                      Locks voting
                    </Badge>
                  )}
                </div>
                <span className="hidden text-xs tabular-nums text-muted-foreground sm:inline">{status.posts_count} posts</span>
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={`Actions for ${status.name}`}>
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onSelect={() => {
                          setEditing(status)
                          setFormOpen(true)
                        }}
                      >
                        <Pencil />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem disabled={status.is_default} onSelect={() => void makeStatusDefault(board.id, status.id)}>
                        <Star />
                        Make default
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" disabled={status.is_default} onSelect={() => setDeleting(status)}>
                        <Trash2 />
                        {status.is_default ? "Default can't be deleted" : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          />
        )}
      </CardContent>

      <StatusFormDialog open={formOpen} onOpenChange={setFormOpen} boardId={board.id} status={editing} />
      <DeleteStatusDialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)} boardId={board.id} status={deleting} allStatuses={statuses} />
    </Card>
  )
}
