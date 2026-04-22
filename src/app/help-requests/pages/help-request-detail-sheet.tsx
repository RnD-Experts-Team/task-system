// ─── HelpRequestDetailSheet ──────────────────────────────────────────────────────
// Side sheet showing full details for a single help request.
// Updated to use the API-aligned HelpRequest type from ../types.

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
import { Pencil, HandHelping, X } from "lucide-react"
// API types replacing the old mock-data types
import type { HelpRequest } from "@/app/help-requests/types"
import { getDisplayStatus, helpRequestRatingLabel } from "@/app/help-requests/types"
import { usePermissions } from "@/hooks/usePermissions"
import { useAuthStore } from "@/app/(auth)/stores/authStore"

type HelpRequestDetailSheetProps = {
  request: HelpRequest | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (request: HelpRequest) => void
  onClaim?: (request: HelpRequest) => void
  onUnclaim?: (request: HelpRequest) => void
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

// Human-readable labels for derived status
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

// Format ISO datetime to readable date string
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function HelpRequestDetailSheet({
  request,
  open,
  onOpenChange,
  onEdit,
  onClaim,
  onUnclaim,
}: HelpRequestDetailSheetProps) {
  const { hasPermission } = usePermissions()
  const currentUser = useAuthStore((s) => s.user)
  const canEdit = hasPermission("edit help requests")
  const isHelper = !!request && request.helper?.id === currentUser?.id

  if (!request) return null

  // Derive display status from API boolean flags
  const status = getDisplayStatus(request)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="data-[side=right]:sm:max-w-full overflow-y-auto themed-scrollbar">
        <SheetHeader className="gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={statusVariant[status] ?? "outline"}>
              {statusLabel[status] ?? status}
            </Badge>
            {/* Show numeric id from the API */}
            <span className="text-xs text-muted-foreground font-mono">#{request.id}</span>
          </div>
          <SheetTitle className="text-2xl">Help Request Details</SheetTitle>
          <SheetDescription className="sr-only">
            Details for help request #{request.id}
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
                    status === "claimed"
                      ? "bg-primary animate-pulse"
                      : status === "completed"
                        ? "bg-green-500"
                        : "bg-muted-foreground"
                  }`}
                />
                <Badge variant={statusVariant[status] ?? "outline"}>
                  {statusLabel[status] ?? status}
                </Badge>
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Created At
              </p>
              {/* Format ISO datetime from API to readable short date */}
              <p className="text-sm font-medium">{formatDate(request.created_at)}</p>
            </div>
          </div>

          {/* Requester */}
          <section>
            <h4 className="text-sm font-semibold mb-3">Requester</h4>
            <div className="flex items-center gap-3 rounded-full bg-muted/50 pr-4 pl-1 py-1 w-fit">
              {/* Use avatar_url from API response */}
              <Avatar className="size-6">
                <AvatarImage src={request.requester.avatar_url ?? undefined} alt={request.requester.name} />
                <AvatarFallback className="text-[8px]">
                  {getInitials(request.requester.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{request.requester.name}</span>
            </div>
          </section>

          {/* Helper */}
          <section>
            <h4 className="text-sm font-semibold mb-3">Helper</h4>
            {request.helper ? (
              <div className="flex items-center gap-3 rounded-full bg-muted/50 pr-4 pl-1 py-1 w-fit">
                {/* Use avatar_url from API response */}
                <Avatar className="size-6">
                  <AvatarImage src={request.helper.avatar_url ?? undefined} alt={request.helper.name} />
                  <AvatarFallback className="text-[8px]">
                    {getInitials(request.helper.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{request.helper.name}</span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No helper assigned yet.</p>
            )}
          </section>

          <Separator />

          {/* Description */}
          <section>
            <h4 className="text-sm font-semibold mb-3">Description</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{request.description}</p>
          </section>

          {/* Rating — show the enum label instead of stars */}
          {request.rating && (
            <>
              <Separator />
              <section>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      Rating Category
                    </p>
                    <p className="text-sm font-bold mt-1">
                      {helpRequestRatingLabel[request.rating]}
                    </p>
                  </div>
                </div>
              </section>
            </>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            {!request.helper && onClaim && (
              <Button variant="outline" size="lg" className="flex-1" onClick={() => onClaim(request)}>
                <HandHelping className="size-4" />
                Claim Request
              </Button>
            )}
            {isHelper && onUnclaim && (
              <Button variant="outline" size="lg" className="flex-1" onClick={() => onUnclaim(request)}>
                <X className="size-4" />
                Unclaim Request
              </Button>
            )}
            {canEdit && onEdit && (
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => onEdit(request)}>
                <Pencil className="size-4" />
                Edit Request
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
