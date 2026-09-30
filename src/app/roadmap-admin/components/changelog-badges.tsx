import { Clock, FileEdit, Globe } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { AdminChangelogEntry, ChangelogLabel } from "../types"

const LABELS: Record<ChangelogLabel, { text: string; className: string }> = {
  new: { text: "New", className: "border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  improved: { text: "Improved", className: "border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  fixed: { text: "Fixed", className: "border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400" },
}

export function ChangelogLabelBadge({ label }: { label: ChangelogLabel }) {
  const style = LABELS[label]
  return (
    <Badge variant="outline" className={cn(style.className)}>
      {style.text}
    </Badge>
  )
}

/** Draft / Scheduled / Published. */
export function ChangelogStatusBadge({ entry }: { entry: Pick<AdminChangelogEntry, "status" | "is_scheduled"> }) {
  if (entry.status === "draft") {
    return (
      <Badge variant="secondary" className="gap-1">
        <FileEdit />
        Draft
      </Badge>
    )
  }
  if (entry.is_scheduled) {
    return (
      <Badge variant="outline" className="gap-1 border-sky-500/30 bg-sky-500/15 text-sky-700 dark:text-sky-400">
        <Clock />
        Scheduled
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
      <Globe />
      Published
    </Badge>
  )
}
