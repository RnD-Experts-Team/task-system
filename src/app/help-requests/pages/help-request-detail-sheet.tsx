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
import { Pencil, Star, HandHelping, X } from "lucide-react"
import type { HelpRequest } from "@/app/help-requests/data"

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

const statusLabel: Record<string, string> = {
  open: "Open",
  claimed: "Claimed",
  completed: "Completed",
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  open: "outline",
  claimed: "default",
  completed: "secondary",
}

export function HelpRequestDetailSheet({
  request,
  open,
  onOpenChange,
  onEdit,
  onClaim,
  onUnclaim,
}: HelpRequestDetailSheetProps) {
  if (!request) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="max-w-full md:max-w-[80vw] overflow-y-auto themed-scrollbar">
        <SheetHeader className="gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={statusVariant[request.status] ?? "outline"}>
              {statusLabel[request.status] ?? request.status}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">{request.id.toUpperCase()}</span>
          </div>
          <SheetTitle className="text-2xl">Help Request Details</SheetTitle>
          <SheetDescription className="sr-only">
            Details for help request {request.id}
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
                    request.status === "claimed"
                      ? "bg-primary animate-pulse"
                      : request.status === "completed"
                        ? "bg-green-500"
                        : "bg-muted-foreground"
                  }`}
                />
                <Badge variant={statusVariant[request.status] ?? "outline"}>
                  {statusLabel[request.status] ?? request.status}
                </Badge>
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Created At
              </p>
              <p className="text-sm font-medium">{request.createdAt}</p>
            </div>
          </div>

          {/* Requester */}
          <section>
            <h4 className="text-sm font-semibold mb-3">Requester</h4>
            <div className="flex items-center gap-3 rounded-full bg-muted/50 pr-4 pl-1 py-1 w-fit">
              <Avatar className="size-6">
                <AvatarImage src={request.requester.avatarUrl} alt={request.requester.name} />
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
                <Avatar className="size-6">
                  <AvatarImage src={request.helper.avatarUrl} alt={request.helper.name} />
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

          {/* Rating */}
          {request.rating > 0 && (
            <>
              <Separator />
              <section>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Star className="size-5 fill-primary text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Quality Rating
                      </p>
                      <p className="text-sm font-bold">
                        {request.rating >= 4
                          ? "Excellent"
                          : request.rating >= 3
                            ? "Good"
                            : request.rating >= 2
                              ? "Fair"
                              : "Needs Improvement"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`size-4 ${
                          i < request.rating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
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
            {request.helper && onUnclaim && (
              <Button variant="outline" size="lg" className="flex-1" onClick={() => onUnclaim(request)}>
                <X className="size-4" />
                Unclaim Request
              </Button>
            )}
            {onEdit && (
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
