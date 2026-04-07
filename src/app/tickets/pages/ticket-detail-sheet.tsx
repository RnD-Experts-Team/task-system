import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Pencil, UserRoundPlus, UserRoundX } from "lucide-react"
import type { Ticket } from "@/app/tickets/data"

type TicketDetailSheetProps = {
  ticket: Ticket | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (ticket: Ticket) => void
  onClaim?: (ticket: Ticket) => void
  onUnclaim?: (ticket: Ticket) => void
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

export function TicketDetailSheet({
  ticket,
  open,
  onOpenChange,
  onEdit,
  onClaim,
  onUnclaim,
}: TicketDetailSheetProps) {
  if (!ticket) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="max-w-full md:max-w-[50vw] overflow-y-auto themed-scrollbar">
        <SheetHeader className="gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={statusVariant[ticket.status] ?? "outline"}>
              {statusLabel[ticket.status] ?? ticket.status}
            </Badge>
            <Badge variant={priorityVariant[ticket.priority] ?? "outline"}>
              {priorityLabel[ticket.priority] ?? ticket.priority}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">{ticket.id}</span>
          </div>
          <SheetTitle className="text-2xl leading-tight">{ticket.title}</SheetTitle>
          <SheetDescription className="sr-only">
            Details for ticket {ticket.id}
          </SheetDescription>
        </SheetHeader>

        <div className="px-8 pb-10 space-y-8">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Status
              </p>
              <div className="flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${
                    ticket.status === "in-progress"
                      ? "bg-primary animate-pulse"
                      : ticket.status === "closed"
                        ? "bg-green-500"
                        : "bg-muted-foreground"
                  }`}
                />
                <Badge variant={statusVariant[ticket.status] ?? "outline"}>
                  {statusLabel[ticket.status] ?? ticket.status}
                </Badge>
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Priority
              </p>
              <Badge variant={priorityVariant[ticket.priority] ?? "outline"}>
                {priorityLabel[ticket.priority] ?? ticket.priority}
              </Badge>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Type
              </p>
              <p className="text-sm font-medium capitalize">
                {typeLabel[ticket.type] ?? ticket.type}
              </p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Created
              </p>
              <p className="text-sm font-medium">{ticket.createdAt}</p>
            </div>
          </div>

          {/* Requester */}
          <section>
            <h4 className="text-sm font-semibold mb-3">Requester</h4>
            <div className="flex items-center gap-3 rounded-full bg-muted/50 pr-4 pl-1 py-1 w-fit">
              <Avatar className="size-6">
                <AvatarImage src={ticket.requester.avatarUrl} alt={ticket.requester.name} />
                <AvatarFallback className="text-[8px]">
                  {getInitials(ticket.requester.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{ticket.requester.name}</span>
            </div>
          </section>

          {/* Assignee */}
          <section>
            <h4 className="text-sm font-semibold mb-3">Assignee</h4>
            {ticket.assignee ? (
              <div className="flex items-center gap-3 rounded-full bg-muted/50 pr-4 pl-1 py-1 w-fit">
                <Avatar className="size-6">
                  <AvatarImage src={ticket.assignee.avatarUrl} alt={ticket.assignee.name} />
                  <AvatarFallback className="text-[8px]">
                    {getInitials(ticket.assignee.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{ticket.assignee.name}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No assignee yet.</p>
            )}
          </section>

          <Separator />

          {/* Description */}
          <section>
            <h4 className="text-sm font-semibold mb-3">Description</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{ticket.description}</p>
          </section>

          <Separator />

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onEdit(ticket)
                  onOpenChange(false)
                }}
              >
                <Pencil className="size-3.5 mr-2" />
                Edit Ticket
              </Button>
            )}
            {ticket.assignee
              ? onUnclaim && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onUnclaim(ticket)
                      onOpenChange(false)
                    }}
                  >
                    <UserRoundX className="size-3.5 mr-2" />
                    Unclaim
                  </Button>
                )
              : onClaim && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClaim(ticket)
                      onOpenChange(false)
                    }}
                  >
                    <UserRoundPlus className="size-3.5 mr-2" />
                    Claim Ticket
                  </Button>
                )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
