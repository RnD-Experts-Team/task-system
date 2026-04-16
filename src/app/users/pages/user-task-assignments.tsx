import { useEffect } from "react"
import { AlertCircle, ClipboardList, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useUsersStore } from "@/app/users/stores/usersStore"
import type { TaskPriority, TaskStatus } from "@/services/usersService"

// ─── Props ────────────────────────────────────────────────────────────────────
type UserTaskAssignmentsProps = {
  /** The user id whose task assignments should be loaded */
  userId: string
}

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  pending:     "Pending",
  in_progress: "In Progress",
  done:        "Done",
  rated:       "Rated",
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending:     "outline",
  in_progress: "secondary",
  done:        "default",
  rated:       "default",
}

const STATUS_DOT: Record<string, string> = {
  pending:     "bg-muted-foreground",
  in_progress: "bg-yellow-500",
  done:        "bg-primary",
  rated:       "bg-purple-500",
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const key = String(status).toLowerCase()
  return (
    <Badge variant={STATUS_VARIANT[key] ?? "outline"} className="whitespace-nowrap">
      <span className={`mr-1.5 inline-block size-2 rounded-full ${STATUS_DOT[key] ?? "bg-muted-foreground"}`} />
      {STATUS_LABEL[key] ?? status}
    </Badge>
  )
}

// ─── Priority helpers ─────────────────────────────────────────────────────────
const PRIORITY_LABEL: Record<string, string> = {
  low:      "Low",
  medium:   "Medium",
  high:     "High",
  critical: "Critical",
}

// Priority badge uses custom Tailwind colour classes (no variant mapping needed)
const PRIORITY_CLASS: Record<string, string> = {
  low:      "bg-slate-100  text-slate-600  border-slate-200  dark:bg-slate-800  dark:text-slate-300",
  medium:   "bg-blue-50    text-blue-600   border-blue-200   dark:bg-blue-950   dark:text-blue-400",
  high:     "bg-orange-50  text-orange-600 border-orange-200 dark:bg-orange-950 dark:text-orange-400",
  critical: "bg-red-50     text-red-600    border-red-200    dark:bg-red-950    dark:text-red-400",
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const key = String(priority).toLowerCase()
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap
        ${PRIORITY_CLASS[key] ?? "bg-muted text-muted-foreground border-muted"}`}
    >
      {PRIORITY_LABEL[key] ?? priority}
    </span>
  )
}

// Format ISO due_date to "Oct 12, 2025" or "—" if null
function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  })
}

// ─── Component ────────────────────────────────────────────────────────────────
export function UserTaskAssignments({ userId }: UserTaskAssignmentsProps) {
  // Pull only the slices we need directly from the store.
  // Using the store directly (not useUsers) avoids triggering the
  // fetchUsers() side-effect that lives in the useUsers hook.
  const {
    userTaskAssignments,
    userTaskAssignmentsLoading,
    userTaskAssignmentsError,
    fetchUserTaskAssignments,
  } = useUsersStore()

  // Fetch whenever the userId changes
  useEffect(() => {
    fetchUserTaskAssignments(userId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (userTaskAssignmentsLoading && !userTaskAssignments) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-md" />
        ))}
      </div>
    )
  }

  // ── Error state (ignore cancelled requests) ──────────────────────────────
  if (userTaskAssignmentsError && !userTaskAssignments) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <AlertCircle className="size-7 text-destructive" />
        <p className="text-sm text-destructive">{userTaskAssignmentsError}</p>
        {/* Retry simply re-triggers the fetch */}
        <Button variant="outline" size="sm" onClick={() => fetchUserTaskAssignments(userId)}>
          Retry
        </Button>
      </div>
    )
  }

  // ── Empty state ──────────────────────────────────────────────────────────
  if (userTaskAssignments && userTaskAssignments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
        <ClipboardList className="size-8 opacity-40" />
        <p className="text-sm">No task assignments found for this user.</p>
      </div>
    )
  }

  if (!userTaskAssignments) return null

  return (
    <div className="space-y-3">
      {/* ── Section heading ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Task Assignments
        </h4>
        {/* Total count badge */}
        <Badge variant="secondary" className="text-xs">
          {userTaskAssignments.length}
        </Badge>
      </div>

      {/* ── Inline error banner (shown when a re-fetch fails) ───────────── */}
      {userTaskAssignmentsError && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{userTaskAssignmentsError}</p>
        </div>
      )}

      {/* ── Cards List ────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {userTaskAssignments.map((task) => {
          // Resolve the parent project name from the eager-loaded section
          const projectName = task.section?.project?.name ?? "—"
          const assignmentPct = task.pivot?.percentage ?? 0

          return (
            <div
              key={task.id}
              className="flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-semibold text-sm leading-none">{task.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{projectName}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="inline-flex h-6 items-center rounded bg-primary/10 px-2 text-xs font-semibold text-primary tabular-nums">
                    {assignmentPct}%
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                {task.due_date && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground px-1 border-l border-border ml-1">
                    <Calendar className="size-3" />
                    {formatDate(task.due_date)}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
