import type { ReactNode } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DateInput } from "@/components/ui/date-input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { STATUS_LABELS, type WorkSessionStatus } from "../types"

type StatusFilter = WorkSessionStatus | "all"

export type SessionFilterValues = {
  startDate: string
  endDate: string
  status: StatusFilter
}

type SessionFiltersProps = SessionFilterValues & {
  onChange: (patch: Partial<SessionFilterValues>) => void
  /** Extra controls rendered between the status select and the Clear button (e.g. user picker) */
  extra?: ReactNode
}

const statusOptions: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "open", label: STATUS_LABELS.open },
  { value: "confirmed", label: STATUS_LABELS.confirmed },
]

/** Date range + status filter row shared by History and admin session lists */
export function SessionFilters({ startDate, endDate, status, onChange, extra }: SessionFiltersProps) {
  const hasActiveFilter = !!startDate || !!endDate || status !== "all"

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      {/* From date — capped by the "to" date */}
      <div className="flex items-center gap-1.5">
        <span className="w-10 shrink-0 text-xs text-muted-foreground sm:w-auto">From</span>
        <DateInput
          className="h-9 w-full text-sm sm:w-36"
          value={startDate}
          max={endDate || undefined}
          onChange={(e) => onChange({ startDate: e.target.value })}
        />
      </div>

      {/* To date — floored by the "from" date */}
      <div className="flex items-center gap-1.5">
        <span className="w-10 shrink-0 text-xs text-muted-foreground sm:w-auto">To</span>
        <DateInput
          className="h-9 w-full text-sm sm:w-36"
          value={endDate}
          min={startDate || undefined}
          onChange={(e) => onChange({ endDate: e.target.value })}
        />
      </div>

      {/* Status */}
      <Select value={status} onValueChange={(v) => onChange({ status: v as StatusFilter })}>
        <SelectTrigger className="h-9 w-full text-sm sm:w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {extra}

      {hasActiveFilter && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 self-start text-sm text-muted-foreground hover:text-foreground sm:self-auto"
          onClick={() => onChange({ startDate: "", endDate: "", status: "all" })}
        >
          <X className="size-3.5" />
          Clear
        </Button>
      )}
    </div>
  )
}
