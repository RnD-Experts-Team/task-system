import { AlertCircle, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ErrorStateProps = {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

/** Inline error banner with an optional retry — used by every screen's error state. */
export function ErrorState({ title = "Something went wrong", message, onRetry, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4",
        className
      )}
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-destructive">{title}</p>
        <p className="mt-0.5 text-sm text-destructive/80">{message}</p>
      </div>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" className="shrink-0 gap-1.5" onClick={onRetry}>
          <RotateCw />
          Retry
        </Button>
      )}
    </div>
  )
}
