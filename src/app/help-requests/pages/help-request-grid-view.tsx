import type { HelpRequest } from "@/app/help-requests/data"
import { HelpRequestCard } from "@/app/help-requests/pages/help-request-card"

type HelpRequestGridViewProps = {
  requests: HelpRequest[]
  onSelect: (request: HelpRequest) => void
  onEdit: (request: HelpRequest) => void
  onDelete: (request: HelpRequest) => void
  onClaim: (request: HelpRequest) => void
  onUnclaim: (request: HelpRequest) => void
}

export function HelpRequestGridView({
  requests,
  onSelect,
  onEdit,
  onDelete,
  onClaim,
  onUnclaim,
}: HelpRequestGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {requests.map((request) => (
        <HelpRequestCard
          key={request.id}
          request={request}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onClaim={onClaim}
          onUnclaim={onUnclaim}
        />
      ))}
    </div>
  )
}
