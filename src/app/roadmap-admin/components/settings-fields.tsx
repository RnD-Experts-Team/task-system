// Small form primitives shared by the settings sections.
import { useId, useState, type ReactNode } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export function Field({ label, hint, error, htmlFor, children, className }: { label: string; hint?: ReactNode; error?: string | null; htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function ToggleField({ label, hint, checked, onChange, disabled }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border p-3">
      <label htmlFor={id} className="space-y-0.5">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  )
}

/** Integer input that tolerates an empty field while typing and commits valid numbers only. */
export function NumberField({ label, hint, value, onChange, min = 0, max, disabled, error, className }: { label: string; hint?: ReactNode; value: number; onChange: (n: number) => void; min?: number; max?: number; disabled?: boolean; error?: string | null; className?: string }) {
  const id = useId()
  const [draft, setDraft] = useState<string | null>(null)
  const text = draft ?? String(value)
  const invalid = draft !== null && (draft === "" || !/^\d+$/.test(draft) || Number(draft) < min || (max !== undefined && Number(draft) > max))

  return (
    <Field label={label} htmlFor={id} error={error ?? (invalid ? `Enter a whole number${max !== undefined ? ` from ${min} to ${max}` : ` of ${min} or more`}` : null)} hint={hint} className={className}>
      <Input
        id={id}
        inputMode="numeric"
        value={text}
        disabled={disabled}
        aria-invalid={invalid || undefined}
        onChange={(e) => {
          const v = e.target.value
          setDraft(v)
          if (/^\d+$/.test(v) && Number(v) >= min && (max === undefined || Number(v) <= max)) onChange(Number(v))
        }}
        onBlur={() => setDraft(null)}
        className="w-32 tabular-nums"
      />
    </Field>
  )
}

/** Chip input for the keyword blocklist (Enter or comma adds; max 500 entries of ≤60 chars). */
export function BlocklistInput({ value, onChange, disabled, max = 500, maxLength = 60 }: { value: string[]; onChange: (next: string[]) => void; disabled?: boolean; max?: number; maxLength?: number }) {
  const id = useId()
  const [text, setText] = useState("")
  const [notice, setNotice] = useState<string | null>(null)

  function add(raw: string) {
    const items = raw
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (items.length === 0) return
    const next = [...value]
    let skipped = 0
    for (const item of items) {
      if (item.length > maxLength || next.length >= max || next.some((x) => x.toLowerCase() === item.toLowerCase())) {
        skipped++
        continue
      }
      next.push(item)
    }
    onChange(next)
    setText("")
    setNotice(skipped ? `${skipped} skipped (duplicate, over ${maxLength} characters, or the list is full).` : null)
  }

  return (
    <div className="space-y-2">
      <Input
        id={id}
        value={text}
        disabled={disabled || value.length >= max}
        onChange={(e) => {
          if (e.target.value.includes(",")) add(e.target.value)
          else setText(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            add(text)
          } else if (e.key === "Backspace" && text === "" && value.length > 0) {
            onChange(value.slice(0, -1))
          }
        }}
        onBlur={() => add(text)}
        placeholder="Type a word or phrase, then press Enter"
        aria-describedby={`${id}-hint`}
      />
      <p id={`${id}-hint`} className="text-xs text-muted-foreground">
        {value.length} / {max}. Whole-word match, case-insensitive. Matching posts are stored as spam without notifying the visitor.
      </p>
      {notice && <p className="text-xs text-amber-700 dark:text-amber-400">{notice}</p>}
      {value.length > 0 && (
        <ul className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto" aria-label="Blocked words">
          {value.map((word) => (
            <li key={word}>
              <Badge variant="secondary" className="h-6 gap-1 ps-2 pe-1">
                {word}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(value.filter((w) => w !== word))}
                  aria-label={`Remove ${word}`}
                  className="rounded-full p-0.5 outline-none hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
