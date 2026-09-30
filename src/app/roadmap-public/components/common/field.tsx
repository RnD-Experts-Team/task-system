import type { ReactNode } from "react"
import { S } from "../../lib/strings"
import { cn } from "@/lib/utils"

interface Props {
  id: string
  label: string
  optional?: boolean
  hint?: string
  error?: string
  /** e.g. "12/5000" */
  counter?: string
  className?: string
  children: ReactNode
}

export function Field({ id, label, optional, hint, error, counter, className, children }: Props) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
          {optional ? <span className="ms-1.5 text-xs font-normal text-muted-foreground">{S.common.optional}</span> : null}
        </label>
        {counter ? <span className="text-xs tabular-nums text-muted-foreground">{counter}</span> : null}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[0.8125rem] text-destructive">
          {error}
        </p>
      ) : null}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-[0.8125rem] text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
