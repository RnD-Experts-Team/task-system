// src/app/roadmap-admin/pages/boards/page.tsx
// Boards & Statuses: boards list (create / edit / archive / reorder / delete) and the statuses of
// the selected board.

import { useState } from "react"
import { Archive, ArchiveRestore, LayoutGrid, MoreHorizontal, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { BoardFormDialog } from "../../components/board-form-dialog"
import { BoardStatusesPanel } from "../../components/board-statuses-panel"
import { ConfirmDialog } from "../../components/confirm-dialog"
import { EmptyState } from "../../components/empty-state"
import { ErrorState } from "../../components/error-state"
import { PageHeader } from "../../components/page-header"
import { SortableRows } from "../../components/sortable-rows"
import { useBoards } from "../../hooks/useBoards"
import { useRoadmapPermissions } from "../../hooks/useRoadmapPermissions"
import { useBoardsStore } from "../../store/boardsStore"
import type { AdminBoard } from "../../types"

export default function RoadmapBoardsPage() {
  const { canManage } = useRoadmapPermissions()
  const { boards, loading, error, refetch } = useBoards()
  const updateBoard = useBoardsStore((s) => s.updateBoard)
  const deleteBoard = useBoardsStore((s) => s.deleteBoard)
  const reorderBoards = useBoardsStore((s) => s.reorderBoards)

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminBoard | null>(null)
  const [deleting, setDeleting] = useState<AdminBoard | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  const selected = boards.find((b) => b.id === selectedId) ?? boards[0] ?? null

  async function confirmDelete() {
    if (!deleting) return
    setDeleteBusy(true)
    const result = await deleteBoard(deleting.id)
    setDeleteBusy(false)
    if (result.ok) setDeleting(null)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        title="Boards & Statuses"
        description="One board per product. Each board has its own statuses, tags and moderation rules."
        badge={boards.length > 0 ? `${boards.length} ${boards.length === 1 ? "board" : "boards"}` : undefined}
        actions={
          <>
            <Button variant="outline" size="lg" className="gap-1.5" onClick={() => void refetch()} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : undefined} />
              Refresh
            </Button>
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
                New board
              </Button>
            )}
          </>
        }
      />

      {error && boards.length === 0 ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : loading && boards.length === 0 ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      ) : boards.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No boards yet"
          description="Create your first board to start collecting feedback."
          action={
            canManage ? (
              <Button size="lg" onClick={() => setFormOpen(true)}>
                <Plus />
                Create a board
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          {/* Boards */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <LayoutGrid className="size-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">Boards</CardTitle>
                  <p className="text-xs text-muted-foreground">Drag to reorder. Select one to edit its statuses.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SortableRows
                items={boards}
                disabled={!canManage}
                labelFor={(b) => b.name}
                onReorder={(ids) => void reorderBoards(ids)}
                renderRow={(board) => (
                  <>
                    <button
                      type="button"
                      onClick={() => setSelectedId(board.id)}
                      aria-pressed={selected?.id === board.id}
                      className={cn(
                        "min-w-0 flex-1 rounded-md px-2 py-1.5 text-start outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
                        selected?.id === board.id && "bg-primary/10"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {board.icon && !/^[a-z0-9-]+$/i.test(board.icon) && <span aria-hidden>{board.icon}</span>}
                        <span className="truncate text-sm font-medium">{board.name}</span>
                        {board.is_archived && (
                          <Badge variant="outline" className="gap-1">
                            <Archive />
                            Archived
                          </Badge>
                        )}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                        <span className="font-mono">/{board.slug}</span>
                        <span>{board.posts_count} posts</span>
                        {board.pending_count > 0 && <span className="text-amber-600 dark:text-amber-400">{board.pending_count} pending</span>}
                      </span>
                    </button>
                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`Actions for ${board.name}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onSelect={() => {
                              setEditing(board)
                              setFormOpen(true)
                            }}
                          >
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() =>
                              void updateBoard(board.id, { is_archived: !board.is_archived }, board.is_archived ? "Board restored" : "Board archived")
                            }
                          >
                            {board.is_archived ? <ArchiveRestore /> : <Archive />}
                            {board.is_archived ? "Restore" : "Archive"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" disabled={board.posts_count > 0} onSelect={() => setDeleting(board)}>
                            <Trash2 />
                            {board.posts_count > 0 ? "Has posts: archive instead" : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </>
                )}
              />
            </CardContent>
          </Card>

          {/* Statuses */}
          {selected && <BoardStatusesPanel key={selected.id} board={selected} canManage={canManage} />}
        </div>
      )}

      <BoardFormDialog open={formOpen} onOpenChange={setFormOpen} board={editing} onSaved={(b) => !editing && setSelectedId(b.id)} />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete “${deleting?.name ?? ""}”?`}
        description="The board, its statuses and tags are permanently deleted. Boards that have posts can only be archived."
        confirmLabel="Delete board"
        destructive
        busy={deleteBusy}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
