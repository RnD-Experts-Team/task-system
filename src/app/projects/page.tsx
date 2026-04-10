import { useState, useMemo } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Plus, Search, LayoutList, LayoutGrid, AlertCircle } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { PaginationInfo } from "@/components/pagination-info"
import { usePagination } from "@/hooks/use-pagination"

// Feature-scoped imports
import { useProjects } from "./hooks/useProjects"
import { useDeleteProject } from "./hooks/useDeleteProject"
import { ProjectTableView } from "./components/project-table-view"
import { ProjectGridView } from "./components/project-grid-view"
import { ProjectDetailSheet } from "./components/project-detail-sheet"
import { ConfirmDeleteDialog } from "./components/confirm-delete-dialog"
import type { Project, ProjectStatus } from "./types"
import { projectKanbanPath } from "./utils/project-routes"

type ViewMode = "table" | "grid"

const statusOptions: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "done", label: "Done" },
  { value: "rated", label: "Rated" },
]

// Page composition — wires hooks, state, and UI components together
export default function ProjectsPage() {
  const navigate = useNavigate()

  // Data hooks
  const { projects, loading, error, refetch } = useProjects()
  const { deleteProject, submitting: deleting } = useDeleteProject()

  // Local UI state
  const [view, setView] = useState<ViewMode>("table")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all")

  // Sheet / dialog state
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailProject, setDetailProject] = useState<Project | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

  // Filter projects by status and search query
  const filtered = useMemo(() => {
    let result = projects
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter)
    }
    if (!search.trim()) return result
    const q = search.toLowerCase()
    return result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    )
  }, [projects, search, statusFilter])

  const { page, totalPages, paged, startItem, endItem, totalItems, setPage, resetPage } =
    usePagination(filtered)

  // ── Handlers ────────────────────────────────────────────────────

  function handleCreate() {
    navigate("/projects/create")
  }

  function handleEdit(project: Project) {
    navigate(`/projects/${project.id}/edit`)
    setDetailOpen(false)
  }

  function handleViewPage(project: Project) {
    setDetailOpen(false)
    navigate(projectKanbanPath(project.id))
  }

  function handleSelect(project: Project) {
    setDetailProject(project)
    setDetailOpen(true)
  }

  function handleDeleteClick(project: Project) {
    setDeleteTarget(project)
    setDeleteDialogOpen(true)
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return
    const ok = await deleteProject(deleteTarget.id)
    if (ok) {
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
    }
  }

  // ── Loading state ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // ── Error state ─────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="size-5" />
          <span className="font-medium">{error}</span>
        </div>
        <Button variant="outline" onClick={refetch}>
          Try Again
        </Button>
      </div>
    )
  }

  // ── Main view ───────────────────────────────────────────────────

  return (
    <>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Header */}
        <div className="relative overflow-hidden  p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-16 size-48 rounded-full bg-primary/10 blur-2xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-20 size-56 blur-3xl" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-1">
              
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
                <Badge variant="secondary" className="uppercase tracking-wider">
                  {filtered.length} Projects
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                Manage progress, ownership, and delivery status across all project teams.
              </p>
            </div>
            <Button
              className="transition-all hover:shadow-md hover:shadow-primary/25"
              size="lg"
              onClick={handleCreate}
            >
              <Plus />
              New Project
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                resetPage()
              }}
              className="pl-8 h-10 text-sm"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as ProjectStatus | "all")
              resetPage()
            }}
          >
            <SelectTrigger className="w-40 h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

          <ToggleGroup
            type="single"
            variant="outline"
            value={view}
            onValueChange={(v) => {
              if (v) setView(v as ViewMode)
            }}
          >
            <ToggleGroupItem value="table" aria-label="Table view">
              <LayoutList className="size-3.5" />
              <span className="hidden sm:inline">List</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid className="size-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16">
            <p className="text-muted-foreground">No projects found.</p>
            <Button variant="outline" onClick={handleCreate}>
              <Plus className="size-4" />
              Create your first project
            </Button>
          </div>
        ) : (
          <>
            {/* Content */}
            {view === "table" ? (
              <ProjectTableView
                projects={paged}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onSelect={handleSelect}
                onViewPage={handleViewPage}
              />
            ) : (
              <ProjectGridView
                projects={paged}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onSelect={handleSelect}
                onViewPage={handleViewPage}
              />
            )}

            {/* Pagination (only show when more than 15 rows) */}
            {totalItems > 15 && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <PaginationInfo startItem={startItem} endItem={endItem} totalItems={totalItems} label="projects" />
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Sheet — includes link to full details page */}
      <ProjectDetailSheet
        project={detailProject}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEdit}
        onViewPage={handleViewPage}
        onViewDetails={(project) => navigate(`/projects/${project.id}`)}
      />

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        project={deleteTarget}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        submitting={deleting}
      />
    </>
  )
}
