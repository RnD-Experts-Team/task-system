import { CheckCircle2, Info, RotateCcw } from "lucide-react"
import type { WorkSession } from "../types"
import { formatDateTime } from "../utils/format"

type ConfirmedBannerProps = {
  session: WorkSession
}

/** Green banner shown once today's session is confirmed and locked */
export function ConfirmedBanner({ session }: ConfirmedBannerProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 sm:flex-row sm:items-start">
      <div className="rounded-lg bg-emerald-500/15 p-2">
        <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Day confirmed</p>
        <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
          Locked on <span className="font-medium">{formatDateTime(session.confirmed_at)}</span>. Your outcomes and
          summary are final.
        </p>
        {session.reopened_at && (
          <p className="flex items-center gap-1.5 text-xs text-emerald-800/80 dark:text-emerald-300/80">
            <RotateCcw className="size-3" />
            Previously reopened
            {session.reopened_by_user ? ` by ${session.reopened_by_user.name}` : ""} on{" "}
            {formatDateTime(session.reopened_at)}
          </p>
        )}
        <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
          <Info className="size-3" />
          Need a change? Ask an administrator to reopen this day.
        </p>
      </div>
    </div>
  )
}
