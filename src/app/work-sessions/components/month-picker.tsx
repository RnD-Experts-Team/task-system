// src/app/work-sessions/components/month-picker.tsx
// Year + month Select pair bound to a { year, month } value (month 1-based,
// matching the API).

import { useId, useMemo } from "react"
import { format } from "date-fns"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { YearMonth } from "../types"

type MonthPickerProps = {
  value: YearMonth
  onChange: (value: YearMonth) => void
  label?: string
  /** Defaults to current year - 3 */
  minYear?: number
  /** Defaults to current year + 1 */
  maxYear?: number
  disabled?: boolean
  className?: string
}

// "January" … "December" — built once from date-fns so locale formatting stays consistent
const MONTHS = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: format(new Date(2000, i, 1), "MMMM"),
}))

export function MonthPicker({
  value,
  onChange,
  label,
  minYear,
  maxYear,
  disabled = false,
  className,
}: MonthPickerProps) {
  const id = useId()
  const currentYear = new Date().getFullYear()
  const from = minYear ?? currentYear - 3
  const to = maxYear ?? currentYear + 1

  // Descending so the most recent years are on top; always include the
  // selected year even if it falls outside the configured range.
  const years = useMemo(() => {
    const list: number[] = []
    for (let y = to; y >= from; y--) list.push(y)
    if (!list.includes(value.year)) list.push(value.year)
    return list.sort((a, b) => b - a)
  }, [from, to, value.year])

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={`${id}-month`} className="text-xs">
          {label}
        </Label>
      )}
      <div className="flex items-center gap-2">
        <Select
          value={String(value.month)}
          onValueChange={(v) => onChange({ ...value, month: Number(v) })}
          disabled={disabled}
        >
          <SelectTrigger id={`${id}-month`} className="h-9 w-full text-sm sm:w-36" aria-label="Month">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(value.year)}
          onValueChange={(v) => onChange({ ...value, year: Number(v) })}
          disabled={disabled}
        >
          <SelectTrigger className="h-9 w-28 text-sm" aria-label="Year">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
