// src/app/roadmap-admin/pages/tags/page.tsx
// Tags: per-board tag CRUD with colour chips and drag-to-reorder.

import { useState } from "react"
import { MoreHorizontal, Pencil, Plus, Tags, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { BoardSelect } from "../../components/board-select"
import { ConfirmDialog } from "../../components/confirm-dialog"
import { EmptyState } from "../../components/empty-state"
import { ErrorState } from "../../components/error-state"
import { PageHeader } from "../../components/page-header"
import { SortableRows } from "../../components/sortable-rows"
import { TagChip } from "../../components/status-pill"
import { TagFormDialog } from "../../components/tag-form-dialog"
import { useBoardDetail, useBoards } from "../../hooks/useBoards"
import { useRoadmapPermissions } from "../../hooks/useRoadmapPermissions"
import { useBoardsStore } from "../../store/boardsStore"
import { plural } from "../../utils/format"
import type { AdminTag } from "../../types"

export default function RoadmapTagsPage() {
  const { canManage } = useRoadmapPermissions()
  const { boards, loading: boardsLoading } = useBoards()
  const [chosenId, setChosenId] = useState<number | null>(null)
  const boardId = chosenId ?? boards.find((b) => !b.is_archived)?.id ?? boards[0]?.id ?? null

  const { tags, loading, error, refetch } = useBoardDetail(boardId)
  const reorderTags = useBoardsStore((s) => s.reorderTags)
  const deleteTag = useBoardsStore((s) => s.deleteTag)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<AdminTag | null>(null)
  const [deleting, setDeleting] = useState<AdminTag | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)

  async function confirmDelete() {
    if (!deleting || !boardId) return
    setDeleteBusy(true)
    const result = await deleteTag(boardId, deleting.id)
    setDeleteBusy(false)
    if (result.ok) setDeleting(null)
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <PageHeader
        title="Tags"
        description="Group posts by theme. Tags belong to one board."
        actions={
          <>
            <BoardSelect value={boardId} onChange={setChosenId} allLabel={null} />
            {canManage && (
              <Button
                size="lg"
                className="gap-1.5"
                disabled={!boardId}
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
              >
                <Plus />
                New tag
              </Button>
            )}
          </>
        }
      />

      {boardsLoading ? (
        <Skeleton className="h-48 w-full" />
      ) : !boardId ? (
        <EmptyState icon={Tags} title="No boards yet" description="Create a board first, then add tags to it." />
      ) : error && tags.length === 0 ? (
        <ErrorState message={error} onRetry={() => void refetch()} />
      ) : loading && tags.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="No tags on this board"
          description="Tags like “Integrations” or “Mobile” make the feed easier to browse."
          action={
            canManage ? (
              <Button size="lg" onClick={() => setFormOpen(true)}>
                <Plus />
                Create a tag
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card>
          <CardContent>
            <SortableRows
              items={tags}
              disabled={!canManage}
              labelFor={(t) => t.name}
              onReorder={(ids) => boardId && void reorderTags(boardId, ids)}
              renderRow={(tag) => (
                <>
                  <TagChip name={tag.name} color={tag.color} className="h-6 px-2 text-xs" />
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">{tag.slug}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">{plural(tag.posts_count, "post")}</span>
                  {canManage && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Actions for ${tag.name}`}>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => {
                            setEditing(tag)
                            setFormOpen(true)
                          }}
                        >
                          <Pencil />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onSelect={() => setDeleting(tag)}>
                          <Trash2 />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </>
              )}
            />
          </CardContent>
        </Card>
      )}

      {boardId && <TagFormDialog open={formOpen} onOpenChange={setFormOpen} boardId={boardId} tag={editing} />}
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={`Delete “${deleting?.name ?? ""}”?`}
        description={`It is removed from ${plural(deleting?.posts_count ?? 0, "post")}. The posts themselves are not affected.`}
        confirmLabel="Delete tag"
        destructive
        busy={deleteBusy}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
