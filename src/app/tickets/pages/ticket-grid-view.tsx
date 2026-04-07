import type { Ticket } from "@/app/tickets/data"
import { TicketCard } from "@/app/tickets/pages/ticket-card"

type TicketGridViewProps = {
  tickets: Ticket[]
  onSelect: (ticket: Ticket) => void
  onEdit: (ticket: Ticket) => void
  onDelete: (ticket: Ticket) => void
  onAssign?: (ticket: Ticket) => void
}

export function TicketGridView({ tickets, onSelect, onEdit, onDelete, onAssign }: TicketGridViewProps) {
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
        />
      ))}
    </div>
  )
}
