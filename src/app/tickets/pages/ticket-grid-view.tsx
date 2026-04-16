// ─── Ticket Grid View ─────────────────────────────────────────────────────────
// Renders ApiTicket items in a responsive card grid (1→2→3→4 cols).
// Passes all quick-action callbacks through to TicketCard.
import type { ApiTicket } from "@/app/tickets/types"
import { TicketCard } from "@/app/tickets/pages/ticket-card"

type TicketGridViewProps = {
  tickets: ApiTicket[]
  onSelect: (ticket: ApiTicket) => void
  onEdit: (ticket: ApiTicket) => void
  onDelete: (ticket: ApiTicket) => void
  // Quick-action callbacks forwarded to each TicketCard
  onAssign?: (ticket: ApiTicket) => void
  onUnassign?: (ticket: ApiTicket) => void
  onComplete?: (ticket: ApiTicket) => void
  onStatusChange?: (ticket: ApiTicket) => void
  onClaim?: (ticket: ApiTicket) => void
}

export function TicketGridView({
  tickets,
  onSelect,
  onEdit,
  onDelete,
  onAssign,
  onUnassign,
  onComplete,
  onStatusChange,
  onClaim,
}: TicketGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onAssign={onAssign}
          onUnassign={onUnassign}
          onComplete={onComplete}
            onClaim={onClaim}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  )
}
