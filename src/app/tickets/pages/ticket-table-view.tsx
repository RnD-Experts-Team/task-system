import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  Eye,
  UserRoundPlus,
  UserRoundX,
} from "lucide-react"
import type { Ticket } from "@/app/tickets/data"

type TicketTableViewProps = {
  tickets: Ticket[]
  onSelect: (ticket: Ticket) => void
  onEdit: (ticket: Ticket) => void
  onDelete: (ticket: Ticket) => void
  onClaim: (ticket: Ticket) => void
  onUnclaim: (ticket: Ticket) => void
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
  open: "outline",
  "in-progress": "default",
  closed: "secondary",
}

const priorityLabel: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
}

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  low: "secondary",
  medium: "outline",
  high: "destructive",
}

const typeLabel: Record<string, string> = {
  bug: "Bug",
  feature: "Feature",
  task: "Task",
  support: "Support",
}

export function TicketTableView({
  tickets,
  onSelect,
  onEdit,
  onDelete,
  onClaim,
  onUnclaim,
}: TicketTableViewProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8">ID</TableHead>
          <TableHead>Title</TableHead>
          <TableHead className="hidden lg:table-cell">Description</TableHead>
          <TableHead className="hidden md:table-cell">Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead className="hidden xl:table-cell">Requester</TableHead>
          <TableHead className="hidden xl:table-cell">Assignee</TableHead>
          <TableHead className="hidden lg:table-cell">Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.length === 0 && (
          <TableRow>
            <TableCell colSpan={10} className="h-24 text-center text-sm text-muted-foreground">
              No tickets found.
            </TableCell>
          </TableRow>
        )}
        {tickets.map((ticket) => (
          <TableRow key={ticket.id} className="group">
            {/* ID */}
            <TableCell className="py-3">
              <span className="text-xs font-mono text-muted-foreground">{ticket.id}</span>
            </TableCell>

            {/* Title */}
            <TableCell className="py-3 max-w-45">
              <div className="relative overflow-hidden">
                <button
                  type="button"
                  className="font-medium text-foreground text-sm hover:text-primary hover:underline underline-offset-2 transition-colors w-full text-left line-clamp-2"
                  onClick={() => onSelect(ticket)}
                >
                  {ticket.title}
                </button>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-12">
                  <div className="h-full w-full bg-linear-to-l from-background via-background/70 to-transparent backdrop-blur-[1px]" />
                </div>
              </div>
            </TableCell>

            {/* Description */}
            <TableCell className="py-3 max-w-65 hidden lg:table-cell">
              <div className="relative overflow-hidden">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {ticket.description}
                </p>
                <div className="pointer-events-none absolute inset-y-0 right-0 w-14">
                  <div className="h-full w-full bg-linear-to-l from-background via-background/60 to-transparent backdrop-blur-[1px]" />
                </div>
              </div>
            </TableCell>

            {/* Type */}
            <TableCell className="py-3 hidden md:table-cell">
              <span className="text-sm text-muted-foreground capitalize">
                {typeLabel[ticket.type] ?? ticket.type}
              </span>
            </TableCell>

            {/* Status */}
            <TableCell className="py-3">
              <Badge variant={statusVariant[ticket.status] ?? "outline"}>
                {statusLabel[ticket.status] ?? ticket.status}
              </Badge>
            </TableCell>

            {/* Priority */}
            <TableCell className="py-3">
              <Badge variant={priorityVariant[ticket.priority] ?? "outline"}>
                {priorityLabel[ticket.priority] ?? ticket.priority}
              </Badge>
            </TableCell>

            {/* Requester */}
            <TableCell className="py-3 hidden xl:table-cell">
              <div className="flex items-center gap-2">
                <Avatar className="size-7 border-2 border-card">
                  <AvatarImage src={ticket.requester.avatarUrl} alt={ticket.requester.name} />
                  <AvatarFallback className="text-[8px]">
                    {getInitials(ticket.requester.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{ticket.requester.name}</span>
              </div>
            </TableCell>

            {/* Assignee */}
            <TableCell className="py-3 hidden xl:table-cell">
              {ticket.assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar className="size-7 border-2 border-card">
                    <AvatarImage src={ticket.assignee.avatarUrl} alt={ticket.assignee.name} />
                    <AvatarFallback className="text-[8px]">
                      {getInitials(ticket.assignee.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{ticket.assignee.name}</span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Unassigned</span>
              )}
            </TableCell>

            {/* Created */}
            <TableCell className="py-3 hidden lg:table-cell">
              <span className="text-sm text-muted-foreground">{ticket.createdAt}</span>
            </TableCell>

            {/* Actions */}
            <TableCell className="py-3 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Open actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => onSelect(ticket)}>
                    <Eye className="size-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(ticket)}>
                    <Pencil className="size-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {ticket.assignee ? (
                    <DropdownMenuItem onClick={() => onUnclaim(ticket)}>
                      <UserRoundX className="size-4 mr-2" />
                      Unclaim
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onClaim(ticket)}>
                      <UserRoundPlus className="size-4 mr-2" />
                      Claim
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(ticket)}
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
