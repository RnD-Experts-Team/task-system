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
import { MoreHorizontal, Pencil, Trash2, Star, Calendar, HandHelping, X } from "lucide-react"
import { useTilt } from "@/hooks/use-tilt"
import type { HelpRequest } from "@/app/help-requests/data"

type HelpRequestCardProps = {
  request: HelpRequest
  onSelect: (request: HelpRequest) => void
  onEdit: (request: HelpRequest) => void
  onDelete: (request: HelpRequest) => void
  onClaim: (request: HelpRequest) => void
  onUnclaim: (request: HelpRequest) => void
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

export function HelpRequestCard({
  request,
  onSelect,
  onEdit,
  onDelete,
  onClaim,
  onUnclaim,
}: HelpRequestCardProps) {
  const { ref, style } = useTilt<HTMLDivElement>({ maxTilt: 5, scale: 1.015 })

  return (
    <Card ref={ref} style={style} className="flex flex-col">
      <CardContent className="flex flex-col gap-4 pt-4 px-4 flex-1">
        {/* Header: Status + Actions */}
        <div className="flex items-start justify-between">
          <Badge variant={statusVariant[request.status] ?? "outline"} className="text-[10px]">
            {statusLabel[request.status] ?? request.status}
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

        {/* Requester */}
        <div className="flex items-center gap-2">
          <Avatar className="size-6 border-2 border-card">
            <AvatarImage src={request.requester.avatarUrl} alt={request.requester.name} />
            <AvatarFallback className="text-[8px]">{getInitials(request.requester.name)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">{request.requester.name}</span>
        </div>

        {/* Rating Stars */}
        {request.rating > 0 && (
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`size-3.5 ${
                  i < request.rating ? "fill-primary text-primary" : "text-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        )}

        {/* Helper + Date */}
        <div className="flex items-center justify-between mt-auto">
          {request.helper ? (
            <div className="flex items-center gap-1.5">
              <Avatar className="size-5 border border-card">
                <AvatarImage src={request.helper.avatarUrl} alt={request.helper.name} />
                <AvatarFallback className="text-[7px]">{getInitials(request.helper.name)}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{request.helper.name}</span>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">No helper</span>
          )}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="size-3" />
            {request.createdAt}
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
