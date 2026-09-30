import { initials } from "../../lib/format"
import { cn } from "@/lib/utils"

interface Props {
  name: string
  className?: string
}

/** Brand tile shown when no logo is configured. */
export function Monogram({ name, className }: Props) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold tracking-tight text-primary-foreground",
        className,
      )}
    >
      {initials(name).slice(0, 2)}
    </span>
  )
}
