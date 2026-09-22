import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { completionTone, completionToneClasses } from "../utils/format"

/** Completion percentage pill — emerald ≥80, amber ≥60, red below; "No items" when null */
export function CompletionBadge({ pct }: { pct: number | null }) {
  const tone = completionTone(pct)
  return (
    <Badge variant="outline" className={cn("tabular-nums", completionToneClasses(tone))}>
      {pct === null ? "No items" : `${Math.round(pct)}%`}
    </Badge>
  )
}
