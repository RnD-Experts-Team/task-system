import * as React from "react"

import { cn } from "@/lib/utils"
import { CalendarDays } from "lucide-react"

const DateInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, forwardedRef) => {
    const innerRef = React.useRef<HTMLInputElement | null>(null)

    // Merge the internal ref with the forwarded ref (e.g. from react-hook-form register)
    const mergedRef = React.useCallback(
      (el: HTMLInputElement | null) => {
        innerRef.current = el
        if (typeof forwardedRef === "function") {
          forwardedRef(el)
        } else if (forwardedRef) {
          forwardedRef.current = el
        }
      },
      [forwardedRef],
    )

    function openPicker() {
      const el = innerRef.current
      if (!el) return
      // Modern browsers expose showPicker() for date inputs
      if (typeof (el as any).showPicker === "function") {
        ;(el as any).showPicker()
        return
      }
      // Fallback: focus + click
      el.focus()
      el.click()
    }

    return (
      <div className="relative">
        <input
          ref={mergedRef}
          type="date"
          className={cn(
            "h-10 w-full min-w-0 rounded-md border border-input bg-input/20 px-3 py-2 text-sm pr-10 transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-clear-button]:hidden",
            className
          )}
          {...props}
        />

        <button
          type="button"
          aria-label="Open date picker"
          onClick={openPicker}
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-md bg-muted/30 p-1.5"
        >
          <CalendarDays className="size-4 text-muted-foreground" />
        </button>
      </div>
    )
  },
)

DateInput.displayName = "DateInput"

export { DateInput }
