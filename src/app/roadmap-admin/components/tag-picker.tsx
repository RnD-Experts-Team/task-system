import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AdminTag } from "../types"
import { pillStyle } from "../utils/palette"

type TagPickerProps = {
  tags: AdminTag[]
  selectedIds: number[]
  disabled?: boolean
  onToggle: (tagId: number) => void
}

/** Toggle chips for a board's tags. */
export function TagPicker({ tags, selectedIds, disabled, onToggle }: TagPickerProps) {
  if (tags.length === 0) return <p className="text-sm text-muted-foreground">This board has no tags yet.</p>
  return (
    <div role="group" aria-label="Tags" className="flex flex-wrap gap-1.5">
      {tags.map((tag) => {
        const selected = selectedIds.includes(tag.id)
        return (
          <button
            key={tag.id}
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onToggle(tag.id)}
            style={selected ? pillStyle(tag.color) : undefined}
            className={cn(
              "inline-flex h-6 items-center gap-1 rounded-md border px-2 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
              !selected && "border-dashed text-muted-foreground hover:bg-muted"
            )}
          >
            {selected && <Check className="size-3" />}
            {tag.name}
          </button>
        )
      })}
    </div>
  )
}
