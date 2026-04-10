// Displays a single task row inside a section card.
// Shows task name, priority badge, status badge, due date, and CRUD action placeholders.

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import type { SectionTask } from "./types"

// --- Formatting helpers for task status and priority ---

const taskStatusLabel: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
  rated: "Rated",
}

const taskStatusClass: Record<string, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  in_progress: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  done: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rated: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
}

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  critical: "destructive",
  high: "destructive",
  medium: "outline",
  low: "secondary",
}

// --- Task item row component ---

type TaskItemProps = {
  task: SectionTask
}

export function TaskItem({ task }: TaskItemProps) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 transition-colors hover:bg-muted/40">
      {/* Left side: task name + badges */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-sm font-medium truncate">{task.name}</span>
        <Badge variant="outline" className={`text-[10px] shrink-0 ${taskStatusClass[task.status] ?? ""}`}>
          {taskStatusLabel[task.status] ?? task.status}
        </Badge>
        <Badge variant={priorityVariant[task.priority] ?? "outline"} className="text-[10px] capitalize shrink-0">
          {task.priority}
        </Badge>
      </div>

      {/* Right side: due date + actions menu */}
      <div className="flex items-center gap-2 shrink-0">
        {task.due_date && (
          <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="size-3" />
            {new Date(task.due_date).toLocaleDateString()}
          </span>
        )}

        {/* CRUD action placeholders — UI only, no mutations wired yet */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7">
              <MoreHorizontal className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled>
              <Pencil className="size-4" />
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuItem disabled className="text-destructive focus:text-destructive">
              <Trash2 className="size-4" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

// --- Task list component: renders all tasks + create button placeholder ---

type TaskListProps = {
  tasks: SectionTask[]
  loading: boolean
  error: string | null
}

export function TaskList({ tasks, loading, error }: TaskListProps) {
  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <p className="text-sm text-destructive py-2">{error}</p>
    )
  }

  return (
    <div className="space-y-2">
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">No tasks in this section.</p>
      ) : (
        tasks.map((task) => <TaskItem key={task.id} task={task} />)
      )}

      {/* Create task placeholder button — UI only, no mutation wired yet */}
      <Button variant="ghost" size="sm" className="w-full justify-start gap-1.5 text-muted-foreground" disabled>
        <Plus className="size-3.5" />
        Add Task
      </Button>
    </div>
  )
}
