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
import { MoreHorizontal, Pencil, Trash2, UserPlus, Calendar } from "lucide-react"
import { useTilt } from "@/hooks/use-tilt"
import type { Ticket } from "@/app/tickets/data"

type TicketCardProps = {
  ticket: Ticket
  onSelect: (ticket: Ticket) => void
  onEdit: (ticket: Ticket) => void
  onDelete: (ticket: Ticket) => void
  onAssign?: (ticket: Ticket) => void
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

const statusLabel: Record<string, string> = {
  open: "Open",
  "in-progress": "In Progress",
  closed: "Closed",
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "in-progress": "default",
  open: "outline",
  closed: "secondary",
}

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  high: "destructive",
  medium: "outline",
  low: "secondary",
}

export function TicketCard({ ticket, onSelect, onEdit, onDelete, onAssign }: TicketCardProps) {
  const { ref, style } = useTilt<HTMLDivElement>({ maxTilt: 5, scale: 1.01 })

  return (
    <Card ref={ref} style={style} className="flex flex-col">
      <CardContent className="flex flex-col gap-4 pt-4 px-4 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={statusVariant[ticket.status] ?? "outline"} className="text-[10px]">
              {statusLabel[ticket.status] ?? ticket.status}
            </Badge>
            <Badge variant={priorityVariant[ticket.priority] ?? "outline"} className="text-[10px] capitalize">
              {ticket.priority}
            </Badge>
            <Badge variant="outline" className="text-[10px] capitalize">
              {ticket.type}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs">
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onAssign && (
                <DropdownMenuItem onClick={() => onAssign(ticket)}>
                  <UserPlus className="size-4" />
                  Assign
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onEdit(ticket)}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(ticket)}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-6 border-2 border-card">
              <AvatarImage src={ticket.requester.avatarUrl} alt={ticket.requester.name} />
              <AvatarFallback className="text-[8px]">{getInitials(ticket.requester.name)}</AvatarFallback>
            </Avatar>
            {ticket.assignee ? (
              <div className="flex items-center gap-2">
                <Avatar className="size-6 border-2 border-card">
                  <AvatarImage src={ticket.assignee.avatarUrl} alt={ticket.assignee.name} />
                  <AvatarFallback className="text-[8px]">{getInitials(ticket.assignee.name)}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">Assigned</span>
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">Unassigned</span>
            )}
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="size-3" />
            {ticket.createdAt}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-3 w-full mt-auto">
        <Button variant="secondary" size="lg" className="flex-1 py-2" onClick={() => onEdit(ticket)}>
          <Pencil className="size-3.5" />
          Edit
        </Button>
        {onAssign ? (
          <Button variant="outline" size="icon-lg" onClick={() => onAssign(ticket)}>
            <UserPlus className="size-3.5" />
          </Button>
        ) : (
          <div />
        )}
        <Button variant="destructive" size="icon-lg" onClick={() => onDelete(ticket)}>
          <Trash2 className="size-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}
