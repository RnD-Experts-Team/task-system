// ─── HelpRequestCard ──────────────────────────────────────────────────────────
// Single card rendered inside the grid view.
// Updated to use the API-aligned HelpRequest type from ../types.

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Calendar, HandHelping, X, UserCheck, CheckCircle2 } from "lucide-react"
import { useTilt } from "@/hooks/use-tilt"
// API types replacing the old mock-data types
import type { HelpRequest } from "@/app/help-requests/types"
import { getDisplayStatus, helpRequestRatingLabel } from "@/app/help-requests/types"
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

type HelpRequestCardProps = {
  request: HelpRequest
  onSelect: (request: HelpRequest) => void
  onEdit: (request: HelpRequest) => void
  onDelete: (request: HelpRequest) => void
  onClaim: (request: HelpRequest) => void
  onUnclaim: (request: HelpRequest) => void
  /** Opens the assign-user dialog for POST /help-requests/{id}/assign/{userId} */
  onAssign: (request: HelpRequest) => void
  /** Opens the complete dialog for POST /help-requests/{id}/complete */
  onComplete: (request: HelpRequest) => void
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

// Human-readable labels for each derived status
const statusLabel: Record<string, string> = {
  open: "Open",
  claimed: "Claimed",
  completed: "Completed",
}

// Badge variant per derived status
const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  open: "outline",
  claimed: "default",
  completed: "secondary",
}

// Format ISO datetime to a short date string
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function HelpRequestCard({
  request,
  onSelect,
  onEdit,
  onDelete,
  onClaim,
  onUnclaim,
  onAssign,
  onComplete,
}: HelpRequestCardProps) {
  const { ref, style } = useTilt<HTMLDivElement>({ maxTilt: 5, scale: 1.015 })
  // Compute display status from API boolean flags
  const status = getDisplayStatus(request)

  return (
    <Card ref={ref} style={style} className="flex flex-col">
      <CardContent className="flex flex-col gap-4 pt-4 px-4 flex-1">
        {/* Header: Status badge + actions dropdown */}
        <div className="flex items-start justify-between">
          <Badge variant={statusVariant[status] ?? "outline"} className="text-[10px]">
            {statusLabel[status] ?? status}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs">
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(request)}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              {!request.helper ? (
                <DropdownMenuItem onClick={() => onClaim(request)}>
                  <HandHelping className="size-4" />
                  Claim
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onUnclaim(request)}>
                  <X className="size-4" />
                  Unclaim
                </DropdownMenuItem>
              )}
              {/* Assign — opens dialog to pick a helper user */}
              <DropdownMenuItem onClick={() => onAssign(request)}>
                <UserCheck className="size-4" />
                Assign
              </DropdownMenuItem>
              {/* Complete — only when not yet completed */}
              {!request.is_completed && (
                <DropdownMenuItem onClick={() => onComplete(request)}>
                  <CheckCircle2 className="size-4" />
                  Complete
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(request)}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            className="text-sm font-medium text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors text-left leading-tight line-clamp-3"
            onClick={() => onSelect(request)}
          >
            {request.description}
          </button>
        </div>

        {/* Requester avatar + name */}
        <div className="flex items-center gap-2">
          <Avatar className="size-6 border-2 border-card">
            <AvatarImage src={request.requester.avatar_url ?? undefined} alt={request.requester.name} />
            <AvatarFallback className="text-[8px]">{getInitials(request.requester.name)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{request.requester.name}</span>
        </div>

        {/* Rating category label (API enum string, shown only when completed) */}
        {request.rating && (
          <div className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
            {helpRequestRatingLabel[request.rating]}
          </div>
        )}

        {/* Helper + Created date row */}
        <div className="flex items-center justify-between mt-auto">
          {request.helper ? (
            <div className="flex items-center gap-1.5">
              <Avatar className="size-5 border border-card">
                {/* Use avatar_url from the API response */}
                <AvatarImage src={request.helper.avatar_url ?? undefined} alt={request.helper.name} />
                <AvatarFallback className="text-[7px]">{getInitials(request.helper.name)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{request.helper.name}</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No helper</span>
          )}
          {/* Format ISO string from API to readable date */}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="size-3" />
            {formatDate(request.created_at)}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-3 w-full mt-auto">
        <Button variant="secondary" size="lg" className="flex-1 py-2" onClick={() => onEdit(request)}>
          <Pencil className="size-3.5" />
          Edit
        </Button>
        {!request.helper ? (
          <Button variant="outline" size="icon-lg" onClick={() => onClaim(request)}>
            <HandHelping className="size-3.5" />
          </Button>
        ) : (
          <Button variant="outline" size="icon-lg" onClick={() => onUnclaim(request)}>
            <X className="size-3.5" />
          </Button>
        )}
        <Button variant="destructive" size="icon-lg" onClick={() => onDelete(request)}>
          <Trash2 className="size-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}
