import { cn } from "@/lib/utils"
import { pillStyle } from "../utils/palette"

type StatusPillProps = {
  name: string
  color: string
  className?: string
}

/** Status pill tinted with the status colour via color-mix (works in light and dark). */
export function StatusPill({ name, color, className }: StatusPillProps) {
  return (
    <span
      style={pillStyle(color)}
      className={cn(
        "inline-flex h-5 max-w-full shrink-0 items-center gap-1.5 rounded-full border px-2 text-[0.625rem] font-medium whitespace-nowrap",
        className
      )}
    >
      <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      <span className="truncate">{name}</span>
    </span>
  )
}

/** Tag chip — same tint as the status pill, no dot. */
export function TagChip({ name, color, className }: StatusPillProps) {
  return (
    <span
      style={pillStyle(color)}
      className={cn(
        "inline-flex h-5 max-w-full shrink-0 items-center rounded-md border px-1.5 text-[0.625rem] font-medium whitespace-nowrap",
        className
      )}
    >
      <span className="truncate">{name}</span>
    </span>
  )
}
