// Task Comments Section
// Self-contained card that lives inside the task detail page.
// Displays comments fetched from the API response (GET /tasks/{id})
// Supports: add comment (POST), edit comment (PUT), delete comment (DELETE with confirm).
// All comment state is maintained locally; comments are accumulated as they are created or loaded.

import { useState } from "react"
import { AxiosError, isCancel } from "axios"
import {
  AlertCircle,
  MessageSquare,
  Pencil,
  Trash2,
  Send,
  X,
  Check,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { taskService } from "@/app/tasks/services/taskService"
import type { TaskComment } from "@/app/tasks/types"
import type { ApiValidationError } from "@/types"
import { usePermissions } from "@/hooks/usePermissions"
import { useAuthStore } from "@/app/(auth)/stores/authStore"

// ─── Helpers ─────────────────────────────────────────────────────

/** Returns up to 2-character uppercase initials from a full name. */
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/** Extracts a user-friendly error message from caught Axios errors. */
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiValidationError | undefined
    // Laravel validation errors come as { errors: { field: [msg] } }
    if (data?.errors) {
      const first = Object.values(data.errors)[0]
      if (first?.[0]) return first[0]
    }
    return data?.message ?? fallback
  }
  return fallback
}

/** Formats a UTC ISO timestamp to a readable local date+time string. */
function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// ─── Sub-components ───────────────────────────────────────────────

/** Inline error alert shown inside the card (not a toast). */
function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive">
      <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  )
}

// ─── Types ───────────────────────────────────────────────────────

interface TaskCommentsSectionProps {
  /** Numeric task ID — used for the POST /tasks/{taskId}/comments endpoint. */
  taskId: number
  /** Optional initial comments loaded from the task response (GET /tasks/{id}) */
  initialComments?: TaskComment[]
}

// ─── Main Component ───────────────────────────────────────────────

export function TaskCommentsSection({ taskId, initialComments = [] }: TaskCommentsSectionProps) {
  const { hasPermission } = usePermissions()
  const currentUserId = useAuthStore((s) => s.user?.id)
  // Any authenticated user can add comments.
  // Comment owners can always edit or delete their own comments.
  // Users with "create tasks" can modify any comment.
  const canCreateComment = currentUserId !== undefined
  function canModifyComment(comment: TaskComment): boolean {
    return hasPermission("create tasks") || (currentUserId !== undefined && comment.user_id === currentUserId)
  }
  // ── Local comment list (accumulated from API responses, initialized with server data) ───────
  // When task is loaded, initialComments from GET /tasks/{id} populates this state
  // New comments created via POST are prepended; edited/deleted comments update this state
  const [comments, setComments] = useState<TaskComment[]>(initialComments)

  // ── Add-comment form state ────────────────────────────────────
  // Tracks form input, loading state, and any validation/network errors during add
  const [newContent, setNewContent] = useState("")
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // ── Edit state (one comment at a time) ───────────────────────
  // editingId tracks which comment row is currently being edited
  // Only one comment can be edited at a time; editing another comment cancels previous edits
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  // ── Delete confirmation state ─────────────────────────────────
  // deleteTarget holds the comment queued for deletion (triggers confirmation dialog)
  // Only shown when user clicks delete; dismissed when user cancels or deletion completes
  const [deleteTarget, setDeleteTarget] = useState<TaskComment | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // ── Add comment ───────────────────────────────────────────────
  // POST /tasks/{taskId}/comments — creates new comment and adds to local state
  // Error handling: extracts API validation/message errors; ignores canceled requests
  // If successful: comment prepended to list (newest first) and form cleared
  async function handleAddComment() {
    const trimmed = newContent.trim()
    if (!trimmed) return

    setAddLoading(true)
    setAddError(null)

    try {
      // POST /tasks/{taskId}/comments — returns the created comment with user info
      const created = await taskService.createComment(taskId, { content: trimmed })
      // Prepend so newest comments appear first
      setComments((prev) => [created, ...prev])
      setNewContent("")
    } catch (err: unknown) {
      if (isCancel(err)) return // Ignore canceled requests
      setAddError(extractErrorMessage(err, "Failed to add comment."))
    } finally {
      setAddLoading(false)
    }
  }

  // ── Start editing a comment (populate the edit textarea) ─────
  // Activates inline edit mode for the selected comment
  function handleStartEdit(comment: TaskComment) {
    setEditingId(comment.id)
    setEditContent(comment.content)
    setEditError(null)
  }

  /** Cancel editing without saving. */
  // Clears edit state and restores the comment to read-only display
  function handleCancelEdit() {
    setEditingId(null)
    setEditContent("")
    setEditError(null)
  }

  // ── Save edited comment ───────────────────────────────────────
  // PUT /comments/{commentId} — updates comment text and syncs local state
  // Error handling: displays error in the table without clearing edit mode
  // If successful: comment replaced in list and edit mode exited
  async function handleSaveEdit(commentId: number) {
    const trimmed = editContent.trim()
    if (!trimmed) return

    setEditLoading(true)
    setEditError(null)

    try {
      // PUT /comments/{commentId} — returns the updated comment
      const updated = await taskService.updateComment(commentId, { content: trimmed })
      // Replace the matching comment in local state with the API response
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updated : c))
      )
      setEditingId(null)
      setEditContent("")
    } catch (err: unknown) {
      if (isCancel(err)) return // Ignore canceled requests
      setEditError(extractErrorMessage(err, "Failed to update comment."))
    } finally {
      setEditLoading(false)
    }
  }

  // ── Delete comment ────────────────────────────────────────────
  // DELETE /comments/{commentId} — removes comment after confirmation
  // Error handling: displays error in dialog without dismissing it (allows retry)
  // If successful: comment removed from list and dialog closes
  async function handleConfirmDelete() {
    if (!deleteTarget) return

    setDeleteLoading(true)
    setDeleteError(null)

    try {
      // DELETE /comments/{commentId}
      await taskService.deleteComment(deleteTarget.id)
      // Remove the deleted comment from local state
      setComments((prev) => prev.filter((c) => c.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (err: unknown) {
      if (isCancel(err)) return // Ignore canceled requests
      setDeleteError(extractErrorMessage(err, "Failed to delete comment."))
    } finally {
      setDeleteLoading(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────
  // Card contains: form to add comment, table of existing comments, delete confirmation dialog
  // Responsive design: table responsive table on md+, stacked on mobile (via hidden/block classes)
  // Error handling: inline errors in form, per-row edit errors, dialog errors for delete

  return (
    <>
      <Card>
        <CardHeader>
          {/* Header with title icon, "Comments" label, and live comment count badge */}
          {/* Badge updates in real-time as comments are added/deleted */}
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="size-4 text-muted-foreground" />
            Comments
            {/* Show total count as a badge */}
            <Badge variant="secondary" className="ml-auto">
              {comments.length}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* ── Add new comment form ── */}
          {/* Only visible to users with create tasks permission */}
          {canCreateComment && (
          <div className="space-y-2">
            <Textarea
              placeholder="Write a comment… (max 5000 characters)"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              maxLength={5000}
              rows={3}
              disabled={addLoading}
              className="resize-none text-sm"
              aria-label="New comment"
            />

            {/* Character counter + submit button row */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">
                {newContent.length}/5000
              </span>
              <Button
                size="sm"
                onClick={handleAddComment}
                disabled={addLoading || newContent.trim().length === 0}
              >
                <Send className="size-3.5 mr-1.5" />
                {addLoading ? "Posting…" : "Post Comment"}
              </Button>
            </div>

            {/* Inline error for add failures */}
            {addError && <InlineError message={addError} />}
          </div>
          )}

          {/* ── Comments table / list ── */}
          {/* Shows "no comments" message OR a responsive table with comments */}
          {/* Responsive design: table columns hide/show based on screen size to preserve mobile space */}
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No comments yet. Be the first to add one.
            </p>
          ) : (

            // Responsive table: full table headers/cells on md+, optimized on smaller screens
            // Table structure: Author | Comment (full width) | Date (hidden on mobile) | Actions
            // Each row supports inline editing OR normal display; only one row edited at a time
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-sm">
                <thead>
                  {/* Table headers with responsive column visibility */}
                  {/* Columns: Author (fixed width), Comment (full width), Date (hidden sm), Actions (fixed width) */}
                  <tr className="border-b border-border/60 bg-muted/40">
                    {/* Author column — shows user avatar + name; avatar only on mobile to save space */}
                    <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                      Author
                    </th>
                    {/* Comment content column — takes remaining space; supports inline edit or read-only display */}
                    <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground w-full">
                      Comment
                    </th>
                    {/* Date column — hidden on mobile/sm screens (shown in comment cell on mobile instead) */}
                    <th className="px-4 py-2.5 text-left font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap hidden sm:table-cell">
                      Date
                    </th>
                    {/* Actions column — edit/delete buttons; changes to save/cancel when editing */}
                    <th className="px-4 py-2.5 text-right font-semibold text-xs uppercase tracking-wide text-muted-foreground whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border/40">
                  {comments.map((comment) => {
                    const isEditing = editingId === comment.id

                    return (
                      <tr
                        key={comment.id}
                        className="align-top hover:bg-muted/20 transition-colors"
                      >
                        {/* ── Author cell ── */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Avatar className="size-7 shrink-0">
                              <AvatarImage
                                src={comment.user?.avatar_url ?? undefined}
                                alt={comment.user?.name ?? "User"}
                              />
                              <AvatarFallback className="text-[10px]">
                                {comment.user ? getInitials(comment.user.name) : "?"}
                              </AvatarFallback>
                            </Avatar>
                            {/* Hide name on very small screens to save space */}
                            <span className="text-xs font-medium hidden xs:block sm:block">
                              {comment.user?.name ?? "Unknown"}
                            </span>
                          </div>
                        </td>

                        {/* ── Comment / edit cell ── */}
                        <td className="px-4 py-3 w-full">
                          {isEditing ? (
                            // Inline edit form replaces the comment text when editing
                            <div className="space-y-2">
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                maxLength={5000}
                                rows={3}
                                disabled={editLoading}
                                className="resize-none text-sm"
                                aria-label="Edit comment"
                                autoFocus
                              />
                              {/* Character counter */}
                              <span className="text-xs text-muted-foreground">
                                {editContent.length}/5000
                              </span>
                              {/* Per-row edit error */}
                              {editError && <InlineError message={editError} />}
                            </div>
                          ) : (
                            // Normal read-only view — truncated with ellipsis and full text on hover
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="leading-relaxed text-sm cursor-help"
                                  // Multiline clamp to 3 lines, show ellipsis when overflowing
                                  style={{
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "normal",
                                  }}
                                >
                                  {comment.content}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent sideOffset={6}>
                                <div className="whitespace-pre-wrap wrap-break-word text-sm max-w-xs">
                                  {comment.content}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}

                          {/* Show date below content on mobile (hidden on sm+) */}
                          <p className="text-[10px] text-muted-foreground mt-1 sm:hidden">
                            {formatDate(comment.created_at)}
                            {comment.updated_at !== comment.created_at && " · edited"}
                          </p>
                        </td>

                        {/* ── Date cell (hidden on mobile, shown on sm+) ── */}
                        <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </p>
                          {/* Show "edited" label when the comment was modified after creation */}
                          {comment.updated_at !== comment.created_at && (
                            <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                              edited
                            </p>
                          )}
                        </td>

                        {/* ── Actions cell ── */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {isEditing ? (
                            // Save / Cancel buttons while editing
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7 text-primary hover:text-primary"
                                onClick={() => handleSaveEdit(comment.id)}
                                disabled={editLoading || editContent.trim().length === 0}
                                aria-label="Save edit"
                              >
                                <Check className="size-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7"
                                onClick={handleCancelEdit}
                                disabled={editLoading}
                                aria-label="Cancel edit"
                              >
                                <X className="size-3.5" />
                              </Button>
                            </div>
                          ) : canModifyComment(comment) ? (
                            // Normal Edit / Delete buttons — only for owner or create tasks
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7"
                                onClick={() => handleStartEdit(comment)}
                                aria-label="Edit comment"
                              >
                                <Pencil className="size-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-7 text-destructive hover:text-destructive"
                                onClick={() => {
                                  setDeleteError(null)
                                  setDeleteTarget(comment)
                                }}
                                aria-label="Delete comment"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Global delete error shown below the table (in case confirmation stays open) */}
          {deleteError && <InlineError message={deleteError} />}
        </CardContent>
      </Card>

      {/* ── Delete confirmation dialog ── */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
            setDeleteError(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* Show delete error inside the dialog if the API call failed */}
          {deleteError && (
            <div className="px-1">
              <InlineError message={deleteError} />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
