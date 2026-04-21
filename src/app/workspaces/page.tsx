import { useState, useMemo } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Search, AlertCircle } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { PaginationInfo } from "@/components/pagination-info"
import { usePagination } from "@/hooks/use-pagination"
import { WorkspaceGridView } from "./components/workspace-grid-view"
import { WorkspaceCardSkeleton } from "./components/workspace-card"
import { ConfirmDeleteWorkspaceDialog } from "./components/confirm-delete-workspace-dialog"
import { useWorkspaces } from "./hooks/useWorkspaces"
import { useDeleteWorkspace } from "./hooks/useDeleteWorkspace"
import type { Workspace } from "./types"

export default function WorkspacesPage() {
  const navigate = useNavigate()

  // Fetch workspaces from the API via Zustand store
  const { workspaces, loading, error, refetch } = useWorkspaces()
  const { deleteWorkspace, deleting } = useDeleteWorkspace()

  // Local UI state for search filter and delete dialog
  const [search, setSearch] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Workspace | null>(null)

  // Client-side search filter on name and description
  const filtered = useMemo(() => {
    if (!search.trim()) return workspaces
    const q = search.toLowerCase()
    return workspaces.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.description?.toLowerCase().includes(q)
    )
  }, [workspaces, search])

  // Pagination — 9 cards per page to fill a 3-column grid
  const { page, totalPages, paged, startItem, endItem, totalItems, setPage, resetPage } =
    usePagination(filtered, { itemsPerPage: 9 })

  // Navigate to the create workspace page
  function handleCreate() {
    navigate("/workspaces/create")
  }

  // Navigate to the edit workspace page
  function handleEdit(workspace: Workspace) {
    navigate(`/workspaces/${workspace.id}/edit`)
  }

  // Open the delete confirmation dialog
  function handleDeleteClick(workspace: Workspace) {
    setDeleteTarget(workspace)
    setDeleteDialogOpen(true)
  }

  // Call the API to delete the workspace, then refresh the list
  async function handleConfirmDelete() {
    if (!deleteTarget) return
    const success = await deleteWorkspace(deleteTarget.id)
    if (success) {
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
      // Refresh the list from the API after deletion
      refetch()
    }
  }

  // Loading skeleton while the API request is in flight
  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <div className="h-9 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-72 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-10 w-36 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <WorkspaceCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Error state — show a message and a retry button
  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 md:p-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center max-w-md">
          <AlertCircle className="size-8 text-destructive" />
          <p className="font-medium text-destructive">{error}</p>
          <Button variant="outline" onClick={refetch}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Header — workspace count badge and create button */}
        <div className="relative overflow-hidden p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-primary/10 blur-2xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-20 size-56 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold tracking-tight">Workspaces</h2>
                <Badge variant="secondary" className="uppercase tracking-wider">
                  {filtered.length} Workspaces
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                Curate your creative environments and manage production pipelines.
              </p>
            </div>
            <Button
              className="transition-all hover:shadow-md hover:shadow-primary/25"
              size="lg"
              onClick={handleCreate}
            >
              <Plus />
              New Workspace
            </Button>
          </div>
        </div>

        {/* Search filter */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search workspaces..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  resetPage()
                }}
                className="pl-8 h-10 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Content — grid of workspace cards or empty state */}
        {filtered.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
            <p className="text-muted-foreground">No workspaces found.</p>
            <Button variant="outline" onClick={handleCreate}>
              <Plus className="size-4" />
              Create your first workspace
            </Button>
          </div>
        ) : (
          <>
            <WorkspaceGridView
              workspaces={paged}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onCreate={handleCreate}
            />

            {/* Pagination — only shown when there are more than 9 workspaces */}
            {totalItems > 9 && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <PaginationInfo startItem={startItem} endItem={endItem} totalItems={totalItems} label="workspaces" />
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDeleteWorkspaceDialog
        workspace={deleteTarget}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        submitting={deleting}
      />
    </>
  )
}
