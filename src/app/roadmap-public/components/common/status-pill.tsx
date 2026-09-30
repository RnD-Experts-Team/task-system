import { safeColor, tint, tintText } from "../../lib/format"
import { cn } from "@/lib/utils"

interface Props {
  name: string
  color: string
  className?: string
}

/** Status label tinted from the status colour: 14% background, readable text in both themes. */
export function StatusPill({ name, color, className }: Props) {
  const c = safeColor(color)
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium leading-5",
        className,
      )}
      style={{ backgroundColor: tint(c, 14), color: tintText(c) }}
    >
      <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: c }} />
      <span className="truncate">{name}</span>
    </span>
  )
}
