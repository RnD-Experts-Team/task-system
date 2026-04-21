import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { WorkspacePageShell } from "./workspace-page-shell"

// ─── Reusable primitives ───────────────────────────────────────────────────────

/** A table skeleton with configurable row count and column count */
function TableSkeleton({ rows = 4, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <div className="w-full">
        {/* Header row */}
        <div className="flex items-center gap-4 border-b px-4 py-3">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {/* Data rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b px-4 py-4 last:border-0">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton
                key={j}
                className={`h-4 flex-1 ${j === 0 ? "max-w-8" : ""}`}
                style={{ opacity: 1 - i * 0.12 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/** A form field skeleton: label + input */
function FormFieldSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-28" />
      <Skeleton className={tall ? "h-24 w-full" : "h-10 w-full"} />
    </div>
  )
}

// ─── Page-level skeletons ──────────────────────────────────────────────────────

/**
 * Skeleton for WorkspaceDetailsPage — mirrors the card/tabs layout.
 * Rendered inside WorkspacePageShell so the shell chrome stays visible.
 */
export function WorkspaceDetailsSkeleton() {
  return (
    <WorkspacePageShell
      title="Workspace Details"
      description="Loading workspace information..."
    >
      <div className="space-y-6">
        {/* Header card — initials + name + description + button */}
        <Card className="border-border/70">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
            <Skeleton className="h-9 w-36 shrink-0" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full max-w-lg" />
          </CardContent>
        </Card>

        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center -space-x-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="size-10 rounded-full border-2 border-card" />
                ))}
              </div>
              <Skeleton className="h-3.5 w-20" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-40" />
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Tabs bar + action buttons */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-16 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-28 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
        </div>

        {/* Members table skeleton */}
        <TableSkeleton rows={4} cols={4} />
      </div>
    </WorkspacePageShell>
  )
}

/**
 * Skeleton for EditWorkspacePage — mirrors the workspace form layout.
 */
export function EditWorkspaceSkeleton({ workspaceId }: { workspaceId: number | null }) {
  return (
    <WorkspacePageShell
      title="Edit Workspace"
      description="Loading workspace data..."
      backTo={workspaceId ? `/workspaces/${workspaceId}` : "/workspaces"}
      backLabel="Back to workspace"
    >
      <div className="space-y-5">
        {/* Name field */}
        <FormFieldSkeleton />
        {/* Description textarea */}
        <FormFieldSkeleton tall />
        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-1">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </WorkspacePageShell>
  )
}

/**
 * Skeleton for EditTodoPage — mirrors the todo form layout (4 fields).
 */
export function EditTodoSkeleton({
  workspaceId,
}: {
  workspaceId: number | null
}) {
  return (
    <WorkspacePageShell
      title="Edit Todo"
      description="Loading todo..."
      backTo={workspaceId ? `/workspaces/${workspaceId}` : "/workspaces"}
      backLabel="Back to workspace"
    >
      <div className="space-y-5">
        {/* Title */}
        <FormFieldSkeleton />
        {/* Due date */}
        <FormFieldSkeleton />
        {/* Status + Parent — side by side on sm+ */}
        <div className="grid gap-5 sm:grid-cols-2">
          <FormFieldSkeleton />
          <FormFieldSkeleton />
        </div>
        {/* Action buttons */}
        <div className="flex items-center gap-3 pt-1">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-20" />
        </div>
      </div>
    </WorkspacePageShell>
  )
}

/**
 * Skeleton for TodoDetailPage — mirrors the todo detail card layout.
 */
export function TodoDetailSkeleton({ workspaceId }: { workspaceId: number | null }) {
  return (
    <WorkspacePageShell
      title="Todo Details"
      description="Loading todo..."
      backTo={workspaceId ? `/workspaces/${workspaceId}` : "/workspaces"}
      backLabel="Back to workspace"
    >
      <div className="space-y-6">
        {/* Main todo card */}
        <Card className="border-border/70">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3 flex-1">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-9 w-20 shrink-0" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full max-w-md" />
          </CardContent>
        </Card>

        {/* Info cards — due date / created / last updated */}
        <div className="grid gap-4 md:grid-cols-3">
          {["Due Date", "Created", "Last Updated"].map((label) => (
            <Card key={label}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-5 w-36" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        {/* Subtasks section */}
        <div className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border/60 p-3"
                style={{ opacity: 1 - i * 0.2 }}
              >
                <Skeleton className="size-4 rounded-sm" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspacePageShell>
  )
}

/**
 * Inline skeleton for the members tab inside WorkspaceDetailsPage.
 * Replaces the Loader2 spinner when membersLoading is true.
 */
export function MembersTableSkeleton() {
  return <TableSkeleton rows={3} cols={4} />
}

/**
 * Inline skeleton for the todos tab inside WorkspaceDetailsPage.
 * Replaces the Loader2 spinner when todosLoading is true.
 */
export function TodosTableSkeleton() {
  return <TableSkeleton rows={4} cols={5} />
}
