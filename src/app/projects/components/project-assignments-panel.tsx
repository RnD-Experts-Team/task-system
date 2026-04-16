// Panel showing all user assignments for a project.
// Fetches GET /projects/{projectId}/assignments and renders a grouped table
// where each row represents one user → task assignment with allocation %.
//
// Props:
//   projectId  — the project to load assignments for
//   variant    — "full" (details page) shows all columns;
//                "compact" (sheet sidebar) hides secondary columns

import { AlertCircle, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useProjectAssignments } from "../hooks/useProjectAssignments"

// ─── Formatting helpers ──────────────────────────────────────────────────────

// Human-readable label per task status
const statusLabel: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
  rated: "Rated",
}

// Tailwind badge classes per status
const statusClass: Record<string, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  in_progress: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  done: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rated: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-300",
}

// Badge variant per priority level
const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  critical: "destructive",
  high: "destructive",
  medium: "outline",
  low: "secondary",
}

// Format a date string to a short human-readable form
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
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

// Two-character initials from a full name
function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

// ─── Component ───────────────────────────────────────────────────────────────

interface ProjectAssignmentsPanelProps {
  projectId: number | null
  /** "full" = all columns (details page); "compact" = fewer columns (sheet) */
  variant?: "full" | "compact"
}

export function ProjectAssignmentsPanel({
  projectId,
  variant = "full",
}: ProjectAssignmentsPanelProps) {
  const { assignedUsers, totalCount, loading, error } = useProjectAssignments(projectId)

  // ── Loading skeleton ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        <AlertCircle className="size-4 shrink-0" />
        <span>{error}</span>
      </div>
    )
  }

  // ── Empty state ────────────────────────────────────────────────
  if (assignedUsers.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground bg-muted/20">
        <Users className="size-6 opacity-40" />
        <span>No team members are assigned to tasks in this project yet.</span>
      </div>
    )
  }

  const isCompact = variant === "compact"

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {totalCount} team member{totalCount !== 1 ? "s" : ""} assigned across this project
      </p>

      <div className="flex flex-col gap-6">
        {assignedUsers.map((user) => {
          const tasks = Array.isArray(user.assignedTasks) ? user.assignedTasks : []

          return (
            <div key={user.id} className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
              {/* User Header Section */}
              <div className="flex items-center gap-3 border-b bg-muted/20 px-4 py-3 sm:px-5 sm:py-4">
                <Avatar className="size-10 shrink-0 border bg-background shadow-sm">
                  <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
                  <AvatarFallback className="text-sm font-medium">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold leading-tight">
                    {user.name}
                  </p>
                  <p className="truncate text-sm text-muted-foreground mt-0.5">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Tasks Section Wrapper */}
              <div className="p-0">
                {tasks.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm italic text-muted-foreground">
                    No tasks assigned yet.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-transparent hover:bg-transparent border-b">
                          <TableHead className="py-3 px-4 sm:px-5">Task</TableHead>
                          <TableHead className="py-3 px-4">Status</TableHead>
                          {!isCompact && (
                            <>
                              <TableHead className="py-3 px-4 hidden sm:table-cell">Priority</TableHead>
                              <TableHead className="py-3 px-4 hidden lg:table-cell">Due Date</TableHead>
                            </>
                          )}
                          <TableHead className="py-3 px-4 sm:px-5 text-right">Alloc.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                         {tasks.map((task, idx) => (
                           <TableRow 
                             key={`${task.id}-${idx}`}
                             className="border-b last:border-0 hover:bg-muted/10 transition-colors"
                           >
                             <TableCell className="py-3 px-4 sm:px-5 font-medium max-w-[200px] sm:max-w-[300px] truncate">
                               {task.name}
                             </TableCell>
                             <TableCell className="py-3 px-4">
                               {/* Smaller badge for mobile */}
                               <Badge
                                 variant="outline"
                                 className={`${statusClass[task.status] ?? ""} text-xs px-2 py-0 border`}
                               >
                                 {statusLabel[task.status] ?? task.status}
                               </Badge>
                             </TableCell>
                             {!isCompact && (
                               <>
                                 <TableCell className="py-3 px-4 hidden sm:table-cell">
                                   <Badge variant={priorityVariant[task.priority] ?? "secondary"} className="text-xs px-2 py-0">
                                     {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                                   </Badge>
                                 </TableCell>
                                 <TableCell className="py-3 px-4 text-sm text-muted-foreground hidden lg:table-cell whitespace-nowrap">
                                   {formatDate(task.due_date)}
                                 </TableCell>
                               </>
                             )}
                             <TableCell className="py-3 px-4 sm:px-5 text-right">
                               {task.pivot?.percentage !== undefined ? (
                                 <span className="text-sm font-semibold tabular-nums whitespace-nowrap">
                                   {task.pivot.percentage}%
                                 </span>
                               ) : (
                                 <span className="text-xs text-muted-foreground">—</span>
                               )}
                             </TableCell>
                           </TableRow>
                         ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
