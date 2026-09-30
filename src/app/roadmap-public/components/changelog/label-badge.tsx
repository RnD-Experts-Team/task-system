import { safeColor, tint, tintText } from "../../lib/format"
import { S } from "../../lib/strings"
import type { ChangelogLabel } from "../../types"
import { cn } from "@/lib/utils"

const LABEL_COLOR: Record<ChangelogLabel, string> = {
  new: "#10b981",
  improved: "#6366f1",
  fixed: "#f59e0b",
}

export function LabelBadge({ label, className }: { label: ChangelogLabel; className?: string }) {
  const c = safeColor(LABEL_COLOR[label])
  return (
    <span
      className={cn("inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-semibold leading-5", className)}
      style={{ backgroundColor: tint(c, 14), color: tintText(c) }}
    >
      {S.changelog.label[label]}
    </span>
  )
}
