// ─── Ticket Card ─────────────────────────────────────────────────────────────
// Displays a single ApiTicket in a card layout for the grid view.
// Includes quick-action buttons: Edit, Assign, Unassign, Complete, Status, Delete.
// All actions are handled via callbacks — no direct API calls from here.

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  UserPlus,
  UserRoundX,
  UserCheck,
  CheckCircle2,
  ArrowUpDown,
  Calendar,
} from "lucide-react"
import { useTilt } from "@/hooks/use-tilt"
import { usePermissions } from "@/hooks/usePermissions"
import { useAuthStore } from "@/app/(auth)/stores/authStore"
// API-aligned type and display helpers
import type { ApiTicket } from "@/app/tickets/types"
import {
  TICKET_STATUS_LABELS,
  TICKET_STATUS_VARIANTS,
  TICKET_TYPE_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_PRIORITY_VARIANTS,
  formatTicketDate,
} from "@/app/tickets/types"

type TicketCardProps = {
  ticket: ApiTicket
  onSelect: (ticket: ApiTicket) => void
  onEdit: (ticket: ApiTicket) => void
  onDelete: (ticket: ApiTicket) => void
  // Quick-action callbacks — all optional so the card works in any context
  onAssign?: (ticket: ApiTicket) => void
  onUnassign?: (ticket: ApiTicket) => void
  onComplete?: (ticket: ApiTicket) => void
  onStatusChange?: (ticket: ApiTicket) => void
  onClaim?: (ticket: ApiTicket) => void
}

// Extract initials for avatar fallback
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function TicketCard({
  ticket,
  onSelect,
  onEdit,
  onDelete,
  onAssign,
  onUnassign,
  onComplete,
  onStatusChange,
  onClaim,
}: TicketCardProps) {
  const { ref, style } = useTilt<HTMLDivElement>({ maxTilt: 5, scale: 1.01 })
  const { hasPermission, hasRole } = usePermissions()
  const currentUser = useAuthStore((s) => s.user)
  const isAssignee  = ticket.assignee?.id === currentUser?.id
  const isRequester = ticket.requester?.id === currentUser?.id
  const isAdmin     = hasRole("admin")
  const canAssignAction = isAdmin || isRequester

  const canView   = hasPermission("view tickets")
  const canEdit   = hasPermission("edit tickets")
  const canDelete = hasPermission("delete tickets")
  const showMenu  = canView || canEdit || canDelete

  // Show complete button only when ticket is not already resolved
  const canComplete = ticket.status !== "resolved"

  return (
    <Card ref={ref} style={style} className="flex flex-col">
      <CardContent className="flex flex-col gap-4 pt-4 px-4 flex-1">
        <div className="flex items-start justify-between">
          {/* Status, priority, and type badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={TICKET_STATUS_VARIANTS[ticket.status] ?? "outline"} className="text-[10px]">
              {TICKET_STATUS_LABELS[ticket.status] ?? ticket.status}
            </Badge>
            <Badge variant={TICKET_PRIORITY_VARIANTS[ticket.priority] ?? "outline"} className="text-[10px]">
              {TICKET_PRIORITY_LABELS[ticket.priority] ?? ticket.priority}
            </Badge>
            <Badge variant="outline" className="text-[10px]">
              {TICKET_TYPE_LABELS[ticket.type] ?? ticket.type}
            </Badge>
          </div>

          {/* Actions dropdown — contains all quick actions */}
          {showMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs">
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem onClick={() => onEdit(ticket)}>
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                )}

                {/* Claim — self-assign when unassigned */}
                {onClaim && !ticket.assignee && (
                  <DropdownMenuItem onClick={() => onClaim(ticket)}>
                    <UserCheck className="size-4" />
                    Claim
                  </DropdownMenuItem>
                )}

                {/* Assign — only the admin or requester can assign */}
                {onAssign && !ticket.assignee && canAssignAction && (
                  <DropdownMenuItem onClick={() => onAssign(ticket)}>
                    <UserPlus className="size-4" />
                    Assign
                  </DropdownMenuItem>
                )}

                {/* Unassign — only the current assignee can unassign */}
                {onUnassign && ticket.assignee && isAssignee && (
                  <DropdownMenuItem onClick={() => onUnassign(ticket)}>
                    <UserRoundX className="size-4" />
                    Unassign
                  </DropdownMenuItem>
                )}

                {/* Change status — only the current assignee can change status */}
                {onStatusChange && isAssignee && (
                  <DropdownMenuItem onClick={() => onStatusChange(ticket)}>
                    <ArrowUpDown className="size-4" />
                    Change Status
                  </DropdownMenuItem>
                )}

                {/* Complete — only when not already resolved and the user is the assignee */}
                {onComplete && canComplete && isAssignee && (
                  <DropdownMenuItem onClick={() => onComplete(ticket)}>
                    <CheckCircle2 className="size-4" />
                    Complete
                  </DropdownMenuItem>
                )}

                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => onDelete(ticket)}>
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Title and description */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            className="text-lg font-semibold text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors text-left leading-tight"
            onClick={() => onSelect(ticket)}
          >
            {ticket.title}
          </button>
          <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
        </div>

        {/* Requester, assignee, and created date row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Requester avatar */}
            {ticket.requester ? (
              <Avatar className="size-6 border-2 border-card">
                <AvatarImage
                  src={ticket.requester.avatar_url ?? undefined}
                  alt={ticket.requester.name}
                />
                <AvatarFallback className="text-[8px]">
                  {getInitials(ticket.requester.name)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <span className="text-xs text-muted-foreground">{ticket.requester_name}</span>
            )}
            {/* Assignee info */}
            {ticket.assignee ? (
              <div className="flex items-center gap-2">
                <Avatar className="size-6 border-2 border-card">
                  <AvatarImage
                    src={ticket.assignee.avatar_url ?? undefined}
                    alt={ticket.assignee.name}
                  />
                  <AvatarFallback className="text-[8px]">
                    {getInitials(ticket.assignee.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">Assigned</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Unassigned</span>
            )}
          </div>
          {/* Created date */}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="size-3" />
            {formatTicketDate(ticket.created_at)}
          </span>
        </div>
      </CardContent>

      {/* Footer — quick action buttons visible at a glance */}
      <CardFooter className="flex items-center gap-2 w-full mt-auto flex-wrap">
        {canEdit && (
          <Button variant="secondary" size="sm" className="flex-1 min-w-[80px]" onClick={() => onEdit(ticket)}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
        )}

        {/* Assign / Claim / Unassign quick buttons */}
        {ticket.assignee ? (
          onUnassign && isAssignee && (
            <Button variant="outline" size="sm" className="flex-1 min-w-[80px]" onClick={() => onUnassign(ticket)}>
              <UserRoundX className="size-3.5" />
              Unassign
            </Button>
          )
        ) : (
          <>
            {onClaim && (
              <Button variant="outline" size="sm" className="flex-1 min-w-[80px]" onClick={() => onClaim(ticket)}>
                <UserCheck className="size-3.5" />
                Claim
              </Button>
            )}

            {onAssign && canAssignAction && (
              <Button variant="outline" size="sm" className="flex-1 min-w-[80px]" onClick={() => onAssign(ticket)}>
                <UserPlus className="size-3.5" />
                Assign
              </Button>
            )}
          </>
        )}

        {/* Complete button — only when ticket is not resolved and the user is the assignee */}
        {onComplete && canComplete && isAssignee && (
          <Button variant="outline" size="sm" className="flex-1 min-w-[80px]" onClick={() => onComplete(ticket)}>
            <CheckCircle2 className="size-3.5" />
            Complete
          </Button>
        )}

        {canDelete && (
          <Button variant="destructive" size="icon-sm" onClick={() => onDelete(ticket)}>
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
