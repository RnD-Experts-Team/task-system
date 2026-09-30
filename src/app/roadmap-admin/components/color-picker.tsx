// Curated swatch palette + hex input. Emits normalised "#rrggbb" values only.

import { useId, useState } from "react"
import { Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { isHexColor, normalizeHex } from "../utils/palette"

type ColorPickerProps = {
  value: string
  onChange: (hex: string) => void
  palette: readonly string[]
  label?: string
  error?: string | null
  disabled?: boolean
  /** Compact swatches for dense forms (status/tag dialogs) */
  compact?: boolean
  className?: string
}

export function ColorPicker({ value, onChange, palette, label, error, disabled, compact, className }: ColorPickerProps) {
  const inputId = useId()
  // Local text so half-typed hex values don't fight the controlled value
  const [draft, setDraft] = useState<string | null>(null)
  const text = draft ?? value

  function commit(next: string) {
    setDraft(next)
    const hex = normalizeHex(next)
    if (hex) onChange(hex)
  }

  const invalid = Boolean(error) || (draft !== null && !normalizeHex(draft))

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <div role="group" aria-label={label ?? "Colour swatches"} className="flex flex-wrap gap-1.5">
        {palette.map((hex) => {
          const selected = hex.toLowerCase() === value.toLowerCase()
          return (
            <button
              key={hex}
              type="button"
              disabled={disabled}
              aria-label={hex}
              aria-pressed={selected}
              title={hex}
              onClick={() => {
                setDraft(null)
                onChange(hex)
              }}
              style={{ backgroundColor: hex }}
              className={cn(
                "flex items-center justify-center rounded-full ring-offset-2 ring-offset-background transition-transform outline-none hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 motion-reduce:transition-none",
                compact ? "size-5" : "size-7",
                selected && "ring-2 ring-foreground"
              )}
            >
              {selected && <Check className={cn("text-white drop-shadow", compact ? "size-3" : "size-4")} />}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-2">
        <span
          className="size-7 shrink-0 rounded-md border"
          style={{ backgroundColor: isHexColor(value) ? value : "transparent" }}
          aria-hidden
        />
        <Input
          id={inputId}
          value={text}
          disabled={disabled}
          maxLength={7}
          spellCheck={false}
          autoCapitalize="off"
          placeholder="#e11d48"
          aria-invalid={invalid || undefined}
          onChange={(e) => commit(e.target.value)}
          onBlur={() => setDraft(null)}
          className="w-28 font-mono"
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
