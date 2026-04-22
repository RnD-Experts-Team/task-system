// Responsive task table component rendered inside each SectionCard.
//
// Columns (desktop): Name | Status | Priority | Weight | Due Date | Assignees | Actions
// On mobile the Weight and Assignees columns are hidden; full info is still
// accessible via the "View" action which navigates to the task detail page.
//
// All CRUD actions are delegated back to SectionCard via callbacks so the card
// owns all mutation state (form sheet, delete dialog, edit-loading indicator).

import { Loader2, Plus, Calendar, Eye, Pencil, Trash2, MoreHorizontal, Users, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { SectionTask, SectionTaskAssignedUser } from "./types"
import { usePermissions } from "@/hooks/usePermissions"

// ─── Formatting helpers ──────────────────────────────────────────────────────

// Human-readable labels for each task status value
const statusLabel: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
  rated: "Rated",
}

// Tailwind classes for tinted status badges
const statusClass: Record<string, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  in_progress: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  done: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rated: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
}

// Badge variants for each priority level
const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  critical: "destructive",
  high: "destructive",
  medium: "outline",
  low: "secondary",
}

// Format a YYYY-MM-DD date string to a short locale-aware string
function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

// Returns up to 2 initials from a full name string
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// ─── Assignees column ────────────────────────────────────────────────────────

// Shows up to MAX_VISIBLE avatars in a stacked group; overflowing users
// are represented by a "+N" counter. Hovering any avatar shows a tooltip
// with the user's name and their percentage allocation for this task.

const MAX_VISIBLE = 3

function AssigneesCell({ users }: { users: SectionTaskAssignedUser[] }) {
  if (users.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  const visible = users.slice(0, MAX_VISIBLE)
  const overflow = users.length - MAX_VISIBLE

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((user) => (
        <Tooltip key={user.id}>
          <TooltipTrigger asChild>
            {/* Ring creates the stacked separation between overlapping avatars */}
            <Avatar className="size-6 ring-2 ring-background cursor-default">
              <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
              <AvatarFallback className="text-[10px]">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            <p className="font-medium">{user.name}</p>
            {/* Show allocation percentage if available from pivot data */}
            {user.pivot?.percentage !== undefined && (
              <p className="text-muted-foreground">{user.pivot.percentage}% allocated</p>
            )}
          </TooltipContent>
        </Tooltip>
      ))}

      {/* +N overflow badge when there are more users than MAX_VISIBLE */}
      {overflow > 0 && (
        <div className="size-6 rounded-full ring-2 ring-background bg-muted flex items-center justify-center z-10">
          <span className="text-[10px] font-medium text-muted-foreground">+{overflow}</span>
        </div>
      )}
    </div>
  )
}

// ─── Props ───────────────────────────────────────────────────────────────────

type TaskListProps = {
  tasks: SectionTask[]
  loading: boolean
  error: string | null
  /**
   * ID of the task currently being loaded for editing. While non-null the
   * corresponding row's Edit action shows a spinner to give immediate feedback.
   */
  editLoadingId?: number | null
  /** Open the task create form (pre-filled with this section's id/project) */
  onAddTask: () => void
  /** Fetch full task data then open the edit form */
  onEdit: (taskId: number) => void
  /** Open the delete confirmation dialog */
  onDelete: (task: SectionTask) => void
  /** Navigate to /tasks/:id for the full detail view */
  onView: (taskId: number) => void
  /** Navigate to /ratings/tasks/:id/rate */
  onRate?: (taskId: number) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function TaskList({
  tasks,
  loading,
  error,
  editLoadingId,
  onAddTask,
  onEdit,
  onDelete,
  onView,
  onRate,
}: TaskListProps) {
  const { hasPermission } = usePermissions()
  const canView = hasPermission("view tasks")
  const canEdit = hasPermission("edit tasks")
  const canDelete = hasPermission("delete tasks")
  const canCreate = hasPermission("create tasks")
  const canRate = hasPermission("create task ratings")

  // ── Loading skeleton — mirrors the table structure so layout doesn't jump ──
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <p className="text-sm text-destructive py-2 px-1">{error}</p>
    )
  }

  return (
    <div className="space-y-3">
      {/* Empty state */}
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2 px-1">
          No tasks in this section.
        </p>
      ) : (
        /* ── Task table ─────────────────────────────────────────────────────
           The table uses overflow-x-auto so it scrolls horizontally on very
           small screens rather than breaking the card layout.                */
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[160px]">Name</TableHead>
                <TableHead className="w-28">Status</TableHead>
                {/* Priority hidden on xs, visible from sm */}
                <TableHead className="w-24 hidden sm:table-cell">Priority</TableHead>
                {/* Weight hidden on small screens */}
                <TableHead className="w-16 hidden md:table-cell text-right">Weight</TableHead>
                {/* Due date hidden on xs */}
                <TableHead className="w-32 hidden sm:table-cell">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    Due
                  </span>
                </TableHead>
                {/* Assignees hidden on small screens */}
                <TableHead className="w-28 hidden md:table-cell">
                  <span className="flex items-center gap-1">
                    <Users className="size-3" />
                    Assigned
                  </span>
                </TableHead>
                {/* Actions column always visible */}
                <TableHead className="w-12 text-right" />
              </TableRow>
            </TableHeader>

            <TableBody>
              {tasks.map((task) => (
                <TableRow
                  key={task.id}
                  // Clicking anywhere on the row opens the detail page (only if permitted)
                  className={canView ? "cursor-pointer" : undefined}
                  onClick={canView ? () => onView(task.id) : undefined}
                >
                  {/* Task name — truncated with a title tooltip */}
                  <TableCell className="font-medium">
                    <span
                      className="block max-w-[200px] truncate"
                      title={task.name}
                    >
                      {task.name}
                    </span>
                  </TableCell>

                  {/* Status badge */}
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] whitespace-nowrap ${statusClass[task.status] ?? ""}`}
                    >
                      {statusLabel[task.status] ?? task.status}
                    </Badge>
                  </TableCell>

                  {/* Priority badge — hidden on mobile */}
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant={priorityVariant[task.priority] ?? "outline"}
                      className="text-[10px] capitalize"
                    >
                      {task.priority}
                    </Badge>
                  </TableCell>

                  {/* Weight — hidden on smaller screens */}
                  <TableCell className="hidden md:table-cell text-right text-sm tabular-nums">
                    {task.weight}
                  </TableCell>

                  {/* Due date — hidden on mobile */}
                  <TableCell className="hidden sm:table-cell text-xs text-muted-foreground whitespace-nowrap">
                    {task.due_date ? formatDate(task.due_date) : "—"}
                  </TableCell>

                  {/* Assignees avatar group — hidden on smaller screens */}
                  <TableCell className="hidden md:table-cell">
                    <AssigneesCell users={task.assigned_users ?? []} />
                  </TableCell>

                  {/* Actions dropdown — stop propagation so row click isn't triggered */}
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-7">
                          <MoreHorizontal className="size-3.5" />
                          <span className="sr-only">Task actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* View — navigates to the existing /tasks/:id detail page */}
                        {canView && (
                          <DropdownMenuItem onClick={() => onView(task.id)}>
                            <Eye className="size-4" />
                            View Details
                          </DropdownMenuItem>
                        )}

                        {/* Edit — fetches the full task then opens the form sheet */}
                        {canEdit && (
                          <DropdownMenuItem
                            onClick={() => onEdit(task.id)}
                            disabled={editLoadingId !== null}
                          >
                            {editLoadingId === task.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Pencil className="size-4" />
                            )}
                            Edit Task
                          </DropdownMenuItem>
                        )}

                        {/* Rate — navigates to /ratings/tasks/:id/rate */}
                        {canRate && onRate && (
                          <DropdownMenuItem onClick={() => onRate(task.id)}>
                            <Star className="size-4" />
                            Rate Task
                          </DropdownMenuItem>
                        )}

                        {(canDelete) && <DropdownMenuSeparator />}

                        {/* Delete — opens the confirmation dialog */}
                        {canDelete && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(task)}
                          >
                            <Trash2 className="size-4" />
                            Delete Task
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Task button — shown only when user has create tasks permission */}
      {canCreate && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={onAddTask}
        >
          <Plus className="size-3.5" />
          Add Task
        </Button>
      )}
    </div>
  )
}

