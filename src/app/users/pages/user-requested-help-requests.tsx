// ─── UserRequestedHelpRequests ────────────────────────────────────────────────
// Displays a paginated list of help requests that were submitted by this user
// (the user is the "requester").
// Endpoint: GET /users/{userId}/help-requests/requested
// Follows the same pattern as UserProjects (paginated card list).

import { useEffect } from "react"
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  UserCheck,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useUsersStore } from "@/app/users/stores/usersStore"
import { helpRequestRatingLabel } from "@/app/help-requests/types"

// ─── Props ────────────────────────────────────────────────────────────────────
type UserRequestedHelpRequestsProps = {
  /** The user id whose submitted help requests should be loaded */
  userId: string
}

// ─── Status helpers ───────────────────────────────────────────────────────────
// Maps the three possible request states to a human-readable label + colour

function StatusBadge({ isCompleted, isClaimed }: { isCompleted: boolean; isClaimed: boolean }) {
  if (isCompleted) {
    return (
      <Badge variant="default" className="gap-1 whitespace-nowrap">
        <CheckCircle2 className="size-3" />
        Completed
      </Badge>
    )
  }
  if (isClaimed) {
    return (
      <Badge variant="secondary" className="gap-1 whitespace-nowrap">
        <UserCheck className="size-3" />
        In Progress
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1 whitespace-nowrap">
      <Clock className="size-3" />
      Open
    </Badge>
  )
}

// Format ISO date string to "Oct 12, 2025" or "—" when null
function formatDate(iso: string | null): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// ─── Component ────────────────────────────────────────────────────────────────
export function UserRequestedHelpRequests({ userId }: UserRequestedHelpRequestsProps) {
  // Pull only the slices we need directly from the store.
  // Using the store directly (not useUsers) avoids triggering the
  // fetchUsers() side-effect that lives in the useUsers hook.
  const {
    userRequestedHelpRequests,
    userRequestedHelpRequestsPagination,
    userRequestedHelpRequestsLoading,
    userRequestedHelpRequestsError,
    fetchUserRequestedHelpRequests,
  } = useUsersStore()

  // Fetch page 1 every time the userId prop changes (i.e. a different user is opened)
  useEffect(() => {
    fetchUserRequestedHelpRequests(userId, 1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Navigate to a different page in the paginated list
  const goToPage = (page: number) => fetchUserRequestedHelpRequests(userId, page)

  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (userRequestedHelpRequestsLoading && !userRequestedHelpRequests) {
    return (
      <>
        {/* Separator separates this section from whatever is rendered above it */}
        <Separator />
        <div className="space-y-2">
          {/* Section heading skeleton */}
          <Skeleton className="h-4 w-44" />
          {/* Table row skeletons */}
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-md" />
          ))}
        </div>
      </>
    )
  }

  // ── Error state (ignore cancelled requests — only show real failures) ────
  if (userRequestedHelpRequestsError && !userRequestedHelpRequests) {
    return (
      <>
        <Separator />
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <AlertCircle className="size-7 text-destructive" />
          <p className="text-sm text-destructive">{userRequestedHelpRequestsError}</p>
          {/* Retry button re-triggers page 1 */}
          <Button variant="outline" size="sm" onClick={() => fetchUserRequestedHelpRequests(userId, 1)}>
            Retry
          </Button>
        </div>
      </>
    )
  }

  // ── Empty / not-yet-loaded: hide section entirely ────────────────────────
  // Returns null so no separator or heading appears when there are no requests.
  if (!userRequestedHelpRequests || userRequestedHelpRequests.length === 0) return null

  const pagination = userRequestedHelpRequestsPagination

  return (
    <>
      {/* Separator separates this section from whatever rendered above it */}
      <Separator />

      <div className="space-y-3">
      {/* ── Section heading ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Help Requests Submitted
        </h4>
        {/* Total count badge */}
        {pagination && (
          <Badge variant="secondary" className="text-xs">
            {pagination.total}
          </Badge>
        )}
      </div>

      {/* ── Inline error banner shown when a page-navigation fails ─────── */}
      {userRequestedHelpRequestsError && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{userRequestedHelpRequestsError}</p>
        </div>
      )}

      {/* ── Card list ────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {userRequestedHelpRequests.map((req) => {
          // Resolve the task name and parent project from eager-loaded relations
          const taskName = req.task?.name ?? "—"
          const projectName = req.task?.section?.project?.name ?? "—"

          return (
            <div
              key={req.id}
              className="flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50"
            >
              {/* Top row: task info + status badge */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 space-y-1">
                  {/* Task name (truncated if too long) */}
                  <p className="font-semibold text-sm leading-none truncate">{taskName}</p>
                  {/* Project name */}
                  <p className="text-xs text-muted-foreground">{projectName}</p>
                </div>
                <div className="shrink-0">
                  <StatusBadge isCompleted={req.is_completed} isClaimed={req.is_claimed} />
                </div>
              </div>

              {/* Description (truncated to 2 lines so the card stays compact) */}
              {req.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{req.description}</p>
              )}

              {/* Bottom row: helper name (if assigned) + dates */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {/* Helper name, shown only when a helper has been assigned */}
                {req.helper && (
                  <span className="flex items-center gap-1">
                    <UserCheck className="size-3" />
                    {req.helper.name}
                  </span>
                )}

                {/* Completion date when the request is done */}
                {req.is_completed && req.completed_at && (
                  <span className="flex items-center gap-1 border-l border-border pl-3">
                    <CheckCircle2 className="size-3" />
                    {formatDate(req.completed_at)}
                  </span>
                )}

                {/* Rating category, displayed only after completion */}
                {req.rating && (
                  <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
                    {helpRequestRatingLabel[req.rating] ?? req.rating}
                  </span>
                )}

                {/* Submitted date — always visible */}
                <span className="ml-auto">{formatDate(req.created_at)}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Pagination controls — only rendered when there are multiple pages */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {/* Range label e.g. "1–10 of 23" */}
          <span>
            {pagination.from}–{pagination.to} of {pagination.total}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={pagination.current_page <= 1 || userRequestedHelpRequestsLoading}
              onClick={() => goToPage(pagination.current_page - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-1">
              {pagination.current_page} / {pagination.last_page}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={
                pagination.current_page >= pagination.last_page ||
                userRequestedHelpRequestsLoading
              }
              onClick={() => goToPage(pagination.current_page + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
      </div>
    </>
  )
}
