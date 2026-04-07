import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "react-router"
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
import { TaskTableView } from "@/app/tasks/pages/task-table-view"
import { TaskGridView } from "@/app/tasks/pages/task-grid-view"
import { TaskDetailSheet } from "@/app/tasks/pages/task-detail-sheet"
import { ConfirmDeleteTaskDialog } from "@/app/tasks/pages/confirm-delete-task-dialog"
import { TaskForm } from "@/app/tasks/pages/task-form"
import { TaskRatingForm } from "@/app/tasks/pages/task-rating-form"
import { tasks } from "@/app/tasks/data"
import type { Task, TaskStatus, TaskPriority, TaskFormData } from "@/app/tasks/data"

type ViewMode = "table" | "grid"
type PageView = "list" | "form" | "rating"

const statusOptions: { value: TaskStatus | "all"; label: string }[] = [
  { value: "all", label: "All Status" },
  { value: "in-progress", label: "In Progress" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "todo", label: "Todo" },
]

const priorityOptions: { value: TaskPriority | "all"; label: string }[] = [
  { value: "all", label: "All Priority" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

export default function TasksPage() {
  const [view, setView] = useState<ViewMode>("table")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all")

  // Page-level view state
  const [pageView, setPageView] = useState<PageView>("list")
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Selected task state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetTask, setSheetTask] = useState<Task | null>(null)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTask, setDeleteTask] = useState<Task | null>(null)

  // Rating state
  const [ratingTask, setRatingTask] = useState<Task | null>(null)

  const [searchParams] = useSearchParams()

  useEffect(() => {
    const rateParam = searchParams.get("rate")
    if (!rateParam) return

    const q = decodeURIComponent(rateParam).trim()
    const matched = tasks.find(
      (t) =>
        t.id === q ||
        t.code === q ||
        t.title === q ||
        t.title.toLowerCase().includes(q.toLowerCase()),
    )

    if (matched) {
      setRatingTask(matched)
      setPageView("rating")
    }
  }, [searchParams])

  const filtered = useMemo(() => {
    let result = tasks
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter)
    }
    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          t.project.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      )
    }
    return result
  }, [search, statusFilter, priorityFilter])

  const { page, totalPages, paged, startItem, endItem, totalItems, setPage, resetPage } = usePagination(filtered)

  function handleCreate() {
    setSelectedTask(null)
    setFormMode("create")
    setPageView("form")
  }

  function handleEdit(task: Task) {
    setSelectedTask(task)
    setFormMode("edit")
    setPageView("form")
    setSheetOpen(false)
  }

  function handleDelete(task: Task) {
    setDeleteTask(task)
    setDeleteDialogOpen(true)
  }

  function handleConfirmDelete() {
    setDeleteDialogOpen(false)
    setDeleteTask(null)
  }

  function handleSelect(task: Task) {
    setSheetTask(task)
    setSheetOpen(true)
  }

  function handleRate(task: Task) {
    setRatingTask(task)
    setPageView("rating")
    setSheetOpen(false)
  }

  function handleFormSubmit(_data: TaskFormData) {
    setPageView("list")
    setSelectedTask(null)
  }

  function handleFormCancel() {
    setPageView("list")
    setSelectedTask(null)
  }

  function handleRatingSubmit() {
    setPageView("list")
    setRatingTask(null)
  }

  function handleRatingCancel() {
    setPageView("list")
    setRatingTask(null)
  }

  // Show form view
  if (pageView === "form") {
    return (
      <TaskForm
        mode={formMode}
        initialData={selectedTask}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    )
  }

  // Show rating view
  if (pageView === "rating" && ratingTask) {
    return (
      <TaskRatingForm
        task={ratingTask}
        onSubmit={handleRatingSubmit}
        onCancel={handleRatingCancel}
      />
    )
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
              <Badge variant="secondary" className="uppercase tracking-wider">
                {filtered.length} Tasks
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Curating and managing workflow excellence across all enterprise verticals.
            </p>
          </div>
          <Button
            className="transition-all hover:shadow-md hover:shadow-primary/25"
            size="lg"
            onClick={handleCreate}
          >
            <Plus />
            Add New Task
          </Button>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tasks, descriptions, or IDs..."
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
                setStatusFilter(v as TaskStatus | "all")
                resetPage()
              }}
            >
              <SelectTrigger className="w-36 h-10">
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

            <Select
              value={priorityFilter}
              onValueChange={(v) => {
                setPriorityFilter(v as TaskPriority | "all")
                resetPage()
              }}
            >
              <SelectTrigger className="w-36 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((opt) => (
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
              <span className="hidden sm:inline">Table</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid className="size-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Content */}
        {view === "table" ? (
          <TaskTableView
            tasks={paged}
            onSelect={handleSelect}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRate={handleRate}
          />
        ) : (
          <TaskGridView
            tasks={paged}
            onSelect={handleSelect}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRate={handleRate}
          />
        )}

        {/* Pagination */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PaginationInfo startItem={startItem} endItem={endItem} totalItems={totalItems} label="tasks" />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Task Detail Sheet */}
      <TaskDetailSheet
        task={sheetTask}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onEdit={handleEdit}
        onRate={handleRate}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteTaskDialog
        task={deleteTask}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
