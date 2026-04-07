import { useState, useMemo } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, LayoutList, LayoutGrid } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { PaginationInfo } from "@/components/pagination-info"
import { usePagination } from "@/hooks/use-pagination"
import { ProjectTableView } from "@/app/projects/pages/project-table-view"
import { ProjectGridView } from "@/app/projects/pages/project-grid-view"
import { ProjectDetailSheet } from "@/app/projects/pages/project-detail-sheet"
import { ConfirmDeleteProjectDialog } from "@/app/projects/pages/confirm-delete-project-dialog"
import { KanbanBoard } from "@/app/projects/pages/kanban-board"
import { projects } from "@/app/projects/data"
import type { Project, ProjectStatus } from "@/app/projects/data"

type ViewMode = "table" | "grid"

const statusOptions: { value: ProjectStatus | "all"; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "in-review", label: "In Review" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
]

export default function ProjectsPage() {
  const navigate = useNavigate()

  // View state
  const [view, setView] = useState<ViewMode>("table")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "all">("all")

  // Sheet / dialog state
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailProject, setDetailProject] = useState<Project | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteProject, setDeleteProject] = useState<Project | null>(null)

  // Kanban view
  const [kanbanProject, setKanbanProject] = useState<Project | null>(null)

  const filtered = useMemo(() => {
    let result = projects
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.owner.name.toLowerCase().includes(q)
      )
    }
    return result
  }, [search, statusFilter])

  const { page, totalPages, paged, startItem, endItem, totalItems, setPage, resetPage } = usePagination(filtered)

  function handleCreate() {
    navigate("/projects/new")
  }

  function handleEdit(project: Project) {
    navigate(`/projects/${project.id}/edit`)
    setDetailOpen(false)
  }

  function handleDelete(project: Project) {
    setDeleteProject(project)
    setDeleteDialogOpen(true)
  }

  function handleConfirmDelete() {
    setDeleteDialogOpen(false)
    setDeleteProject(null)
  }

  function handleSelect(project: Project) {
    setDetailProject(project)
    setDetailOpen(true)
  }

  function handleKanban(project: Project) {
    setKanbanProject(project)
    setDetailOpen(false)
  }

  // Kanban view
  if (kanbanProject) {
    return <KanbanBoard project={kanbanProject} onBack={() => setKanbanProject(null)} />
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
              <Badge variant="secondary" className="uppercase tracking-wider">
                {filtered.length} Projects
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Manage, track, and collaborate on initiatives across all teams.
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

        {/* Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Filter by name, category or owner..."
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

        {/* Content */}
        {view === "table" ? (
          <ProjectTableView
            projects={paged}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSelect={handleSelect}
            onKanban={handleKanban}
          />
        ) : (
          <ProjectGridView
            projects={paged}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSelect={handleSelect}
            onKanban={handleKanban}
          />
        )}

        {/* Pagination */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PaginationInfo startItem={startItem} endItem={endItem} totalItems={totalItems} label="projects" />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Detail Sheet */}
      <ProjectDetailSheet
        project={detailProject}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEdit}
        onKanban={handleKanban}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteProjectDialog
        project={deleteProject}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
