import { AlertCircle, Clock } from "lucide-react"
import { describeError, isRateLimited } from "../../lib/errors"
import { S } from "../../lib/strings"
import { btn } from "../../lib/ui"
import { cn } from "@/lib/utils"

interface Props {
  error?: unknown
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({ error, title, message, onRetry, className }: Props) {
  const limited = isRateLimited(error)
  const Icon = limited ? Clock : AlertCircle
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center rounded-xl border border-border/60 bg-card px-6 py-12 text-center",
        className,
      )}
    >
      <span className="mb-4 inline-flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon aria-hidden="true" className="size-5" />
      </span>
      <h3 className="text-base font-semibold tracking-tight">{title ?? S.errors.loadFailedTitle}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-pretty text-muted-foreground">{message ?? describeError(error)}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className={btn("outline", "md", "mt-5")}>
          {S.common.retry}
        </button>
      ) : null}
    </div>
  )
}
