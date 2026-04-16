// ─── Help Request Detail Page ─────────────────────────────────────────────────
// Displays full details for a single help request loaded from GET /help-requests/{id}.
// Accessed via the /help-requests/:id route.
//
// Shows:
//   - Task title prominently at the top
//   - Status, rating category, created/completed dates
//   - Requester and helper user details
//   - Description text
//   - Linked task info (with link to the task detail page)
//   - Action buttons: Assign (POST /{id}/assign/{userId}),
//                     Complete (POST /{id}/complete),
//                     Delete (DELETE /{id} with confirmation)

import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router"
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  HandHelping,
  User,
  Calendar,
  FileText,
  ExternalLink,
  UserCheck,
  Trash2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
// Hook that fetches GET /help-requests/{id}
import { useHelpRequest } from "@/app/help-requests/hooks/useHelpRequest"
// Utility to derive display status from the API boolean flags
import { getDisplayStatus, helpRequestRatingLabel } from "@/app/help-requests/types"
import type { HelpRequestUser, HelpRequestRatingValue } from "@/app/help-requests/types"
// Mutations hook for write actions (assign / complete / delete)
import { useHelpRequestMutations } from "@/app/help-requests/hooks/useHelpRequestMutations"
// Action dialogs
import { AssignHelpRequestDialog } from "@/app/help-requests/pages/assign-help-request-dialog"
import { CompleteHelpRequestDialog } from "@/app/help-requests/pages/complete-help-request-dialog"
import { ConfirmDeleteHelpRequestDialog } from "@/app/help-requests/pages/confirm-delete-help-request-dialog"

// ── Helpers ──────────────────────────────────────────────────────────────────

// Extract two uppercase initials from a full name
function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

// Format an ISO datetime string to a short readable date
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

// ── Status display maps ──────────────────────────────────────────────────────

// Tailwind class sets for each derived status — used for badge coloring
const statusClass: Record<string, string> = {
  open: "border-yellow-400/50 text-yellow-600 bg-yellow-50 dark:bg-yellow-400/10 dark:text-yellow-400",
  claimed: "border-blue-400/50 text-blue-600 bg-blue-50 dark:bg-blue-400/10 dark:text-blue-400",
  completed: "border-green-400/50 text-green-600 bg-green-50 dark:bg-green-400/10 dark:text-green-400",
}

const statusLabel: Record<string, string> = {
  open: "Open",
  claimed: "Claimed",
  completed: "Completed",
}

// ── Loading skeleton ─────────────────────────────────────────────────────────

function HelpRequestDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-36 w-full" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
    </div>
  )
}

// ── User info card ────────────────────────────────────────────────────────────
// Shared card used for both requester and helper

function UserCard({ label, user }: { label: string; user: HelpRequestUser | null }) {
  if (!user) {
    return (
      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
          {label}
        </p>
        <p className="text-sm text-muted-foreground">Not assigned</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg bg-muted/50 p-4 flex items-center gap-3">
      <Avatar className="size-10 border-2 border-card">
        <AvatarImage src={user.avatar_url ?? undefined} alt={user.name} />
        <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
          {label}
        </p>
        <p className="text-sm font-medium truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
      </div>
    </div>
  )
}

// ── Main detail page ──────────────────────────────────────────────────────────

export default function HelpRequestDetailPage() {
  // Read the :id param from the URL — cast to number for the API call
  const { id } = useParams<{ id: string }>()
  const requestId = id ? parseInt(id, 10) : null
  const navigate = useNavigate()

  // Fetch GET /help-requests/{id} via the useHelpRequest hook
  const { request, loading, error } = useHelpRequest(requestId)

  // ── Write actions from the store ──────────────────────────────────────────
  const { assignHelpRequest, completeHelpRequest, deleteHelpRequest } = useHelpRequestMutations()

  // ── Assign dialog state ────────────────────────────────────────────────────
  const [assignOpen, setAssignOpen]   = useState(false)
  const [assigning, setAssigning]     = useState(false)

  // ── Complete dialog state ──────────────────────────────────────────────────
  const [completeOpen, setCompleteOpen]   = useState(false)
  const [completing, setCompleting]       = useState(false)

  // ── Delete dialog state ────────────────────────────────────────────────────
  const [deleteOpen, setDeleteOpen]   = useState(false)
  const [deleting, setDeleting]       = useState(false)

  // ── Assign handler ────────────────────────────────────────────────────────
  // POST /help-requests/{id}/assign/{userId}
  async function handleConfirmAssign(reqId: number, userId: number) {
    setAssigning(true)
    await assignHelpRequest(reqId, userId)
    setAssigning(false)
    setAssignOpen(false)
  }

  // ── Complete handler ──────────────────────────────────────────────────────
  // POST /help-requests/{id}/complete
  async function handleConfirmComplete(reqId: number, rating: HelpRequestRatingValue) {
    setCompleting(true)
    await completeHelpRequest(reqId, { rating })
    setCompleting(false)
    setCompleteOpen(false)
  }

  // ── Delete handler ─────────────────────────────────────────────────────────
  // DELETE /help-requests/{id} — navigates back to list on success
  async function handleConfirmDelete() {
    if (!request) return
    setDeleting(true)
    const ok = await deleteHelpRequest(request.id)
    setDeleting(false)
    if (ok) {
      setDeleteOpen(false)
      navigate("/help-requests")
    }
  }

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Back button placeholder */}
        <Skeleton className="h-8 w-32" />
        <HelpRequestDetailSkeleton />
      </div>
    )
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  // Cancel errors are ignored inside the store, so only real errors reach here
  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <Link
          to="/help-requests"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="size-4" />
          Back to Help Requests
        </Link>
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    )
  }

  // ── Not found state ──────────────────────────────────────────────────────────
  if (!request) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <Link
          to="/help-requests"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="size-4" />
          Back to Help Requests
        </Link>
        <p className="text-sm text-muted-foreground">Help request not found.</p>
      </div>
    )
  }

  // Compute display status from the API boolean flags
  const status = getDisplayStatus(request)

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">

      {/* ── Back navigation + status badge ───────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/help-requests"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="size-4" />
          Back to Help Requests
        </Link>
        <div className="flex items-center gap-2">
          {/* Numeric ID from the API */}
          <span className="text-xs text-muted-foreground font-mono">#{request.id}</span>
          {/* Status badge with color derived from is_claimed + is_completed */}
          <Badge
            className={`border ${statusClass[status] ?? ""}`}
            variant="outline"
          >
            {status === "completed" && <CheckCircle2 className="size-3 mr-1" />}
            {status === "claimed"   && <Clock className="size-3 mr-1" />}
            {statusLabel[status] ?? status}
          </Badge>
        </div>
      </div>

      {/* ── Page title — shows task name when available ───────────────────────── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {/* Show the linked task name as the page title for context */}
          {request.task ? request.task.name : "Help Request Details"}
        </h1>
        {/* Subtitle showing it's a help request (only when task name is used as title) */}
        {request.task && (
          <p className="text-sm text-muted-foreground">Help Request #{request.id}</p>
        )}
      </div>

      {/* ── Action buttons ────────────────────────────────────────────────────── */}
      {/* Row of contextual action buttons for the three new endpoints */}
      <div className="flex flex-wrap gap-2">
        {/* Assign — POST /help-requests/{id}/assign/{userId} */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAssignOpen(true)}
          disabled={request.is_completed}
        >
          <UserCheck className="size-4" />
          Assign
        </Button>

        {/* Complete — POST /help-requests/{id}/complete (hidden when already completed) */}
        {!request.is_completed && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCompleteOpen(true)}
          >
            <CheckCircle2 className="size-4" />
            Mark Complete
          </Button>
        )}

        {/* Delete — DELETE /help-requests/{id} with confirmation dialog */}
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>

      {/* ── Metadata grid (4 stat cards) ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

        {/* Status card */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Status
            </p>
            <p className="text-sm font-semibold">{statusLabel[status] ?? status}</p>
          </CardContent>
        </Card>

        {/* Claimed / Available indicator */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Helper Assigned
            </p>
            <p className="text-sm font-semibold">
              {request.is_claimed ? "Yes" : "No"}
            </p>
          </CardContent>
        </Card>

        {/* Created date formatted from ISO string */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Created
            </p>
            <p className="text-sm font-semibold">{formatDate(request.created_at)}</p>
          </CardContent>
        </Card>

        {/* Completed date or "Pending" */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Completed
            </p>
            <p className="text-sm font-semibold">
              {request.completed_at ? formatDate(request.completed_at) : "Pending"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Description card ─────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="size-4" />
            Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {request.description}
          </p>
        </CardContent>
      </Card>

      {/* ── People section (requester + helper) ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <User className="size-4" />
            Requester
          </h3>
          {/* User card showing avatar, name, email */}
          <UserCard label="Requester" user={request.requester} />
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            <HandHelping className="size-4" />
            Helper
          </h3>
          {/* Helper is null when the request is still open/unclaimed */}
          <UserCard label="Helper" user={request.helper} />
        </div>
      </div>

      {/* ── Linked task card ──────────────────────────────────────────────────── */}
      {request.task && (
        <>
          <Separator />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="size-4" />
                Linked Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{request.task.name}</p>
                  {/* Show the project name when the section relationship is loaded */}
                  {request.task.section?.project && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {request.task.section.project.name}
                      {request.task.section && (
                        <> &rsaquo; {request.task.section.name}</>
                      )}
                    </p>
                  )}
                </div>
                {/* Link to the task detail page */}
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/tasks/${request.task.id}`}>
                    <ExternalLink className="size-3.5 mr-1.5" />
                    View Task
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Rating category ───────────────────────────────────────────────────── */}
      {/* Only shown when the request has been completed and rated */}
      {request.rating && (
        <>
          <Separator />
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Rating Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary" className="text-sm">
                {/* helpRequestRatingLabel maps the API enum string to a human label */}
                {helpRequestRatingLabel[request.rating]}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                This category determines the penalty multiplier applied to the task rating.
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {/* ── Assign dialog — POST /help-requests/{id}/assign/{userId} ─────────── */}
      <AssignHelpRequestDialog
        request={request}
        open={assignOpen}
        onOpenChange={setAssignOpen}
        onAssign={handleConfirmAssign}
        assigning={assigning}
      />

      {/* ── Complete dialog — POST /help-requests/{id}/complete ──────────────── */}
      <CompleteHelpRequestDialog
        request={request}
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        onComplete={handleConfirmComplete}
        completing={completing}
      />

      {/* ── Delete confirmation dialog — DELETE /help-requests/{id} ─────────── */}
      <ConfirmDeleteHelpRequestDialog
        request={request}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleConfirmDelete}
        confirming={deleting}
      />
    </div>
  )
}
