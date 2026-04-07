import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Shield } from "lucide-react"
import type { CorrectionRequest } from "../data"

interface CorrectionCardProps {
  correction: CorrectionRequest
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

export function CorrectionCard({ correction, onApprove, onReject }: CorrectionCardProps) {
  const typeLabel = correction.type === "CLOCK_IN" ? "CLOCK IN" : "CLOCK OUT"

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/10 bg-card/60 backdrop-blur-xl transition-all hover:border-border/30">
      <div className="p-5 sm:p-6">
        {/* Header: User Info + Type Badge */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 rounded-xl">
              <AvatarFallback className="rounded-xl bg-primary/10 text-sm font-bold text-primary">
                {correction.initial}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-sm font-bold leading-tight">{correction.name}</h4>
              <p className="text-xs text-muted-foreground">{correction.email}</p>
            </div>
          </div>
          <Badge variant="outline" className="w-fit gap-1.5 self-start">
            <Clock className="size-2.5" />
            {typeLabel}
          </Badge>
        </div>

        {/* Time Details */}
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-muted/30 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Original Time
            </p>
            <p className="font-mono text-sm font-medium">{correction.originalTime}</p>
          </div>
          <div className="rounded-lg border border-primary/10 bg-primary/5 p-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              Requested Time
            </p>
            <p className="font-mono text-sm font-medium">
              {correction.requestedDate}, {correction.requestedTime}
            </p>
          </div>
        </div>

        {/* Reason */}
        <div className="mb-4">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Reason
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">{correction.reason}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 border-t border-border/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Shield className="size-3" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Ref: {correction.refId}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onReject(correction.id)}
            >
              <XCircle className="size-3" />
              Reject
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => onApprove(correction.id)}
            >
              <CheckCircle className="size-3" />
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
