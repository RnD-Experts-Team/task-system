import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useBoards } from "../hooks/useBoards"

const ALL = "all"

type BoardSelectProps = {
  value: number | null
  onChange: (boardId: number | null) => void
  /** Label of the "no board" option; pass null to hide it (board required) */
  allLabel?: string | null
  className?: string
  disabled?: boolean
  id?: string
  includeArchived?: boolean
}

/** Board picker fed by the cached boards list. */
export function BoardSelect({ value, onChange, allLabel = "All boards", className, disabled, id, includeArchived = false }: BoardSelectProps) {
  const { boards, loading } = useBoards()
  const visible = boards.filter((b) => includeArchived || !b.is_archived || b.id === value)

  return (
    <Select
      value={value === null ? (allLabel === null ? "" : ALL) : String(value)}
      onValueChange={(next) => onChange(next === ALL ? null : Number(next))}
      disabled={disabled || loading}
    >
      <SelectTrigger id={id} className={cn("w-full sm:w-48", className)} aria-label="Board">
        <SelectValue placeholder={loading ? "Loading boards…" : "Select a board"} />
      </SelectTrigger>
      <SelectContent>
        {allLabel !== null && <SelectItem value={ALL}>{allLabel}</SelectItem>}
        {visible.map((board) => (
          <SelectItem key={board.id} value={String(board.id)}>
            {board.name}
            {board.is_archived ? " (archived)" : ""}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
