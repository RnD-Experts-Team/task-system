import { cn } from "@/lib/utils"

// ─── Shared class recipes for the public site ──────────────────────
// Native elements + tokens (no shadcn Button/Input) so the public site keeps its own quiet look.

type BtnVariant = "primary" | "secondary" | "ghost" | "outline"
type BtnSize = "sm" | "md" | "lg"

const BASE_BTN =
  "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium " +
  "transition-[background-color,color,border-color,transform,box-shadow] duration-150 ease-out " +
  "motion-safe:active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50"

const BTN_VARIANT: Record<BtnVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-muted text-foreground hover:bg-muted/70",
  outline: "border border-border bg-card text-foreground hover:bg-muted/60",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
}

const BTN_SIZE: Record<BtnSize, string> = {
  sm: "h-8 px-3 text-[0.8125rem]",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-[0.9375rem]",
}

export function btn(variant: BtnVariant = "primary", size: BtnSize = "md", className?: string): string {
  return cn(BASE_BTN, BTN_VARIANT[variant], BTN_SIZE[size], className)
}

export const inputClass =
  "block w-full min-w-0 rounded-lg border border-border bg-background px-3 text-base text-foreground " +
  "placeholder:text-muted-foreground transition-[border-color,box-shadow] duration-150 ease-out " +
  "hover:border-foreground/25 focus-visible:border-(--ring) disabled:cursor-not-allowed disabled:opacity-60 " +
  "aria-invalid:border-destructive sm:text-sm"

export const inputSize = "h-10"
export const textareaClass = cn(inputClass, "min-h-24 resize-y py-2.5 leading-relaxed")

/** Card surface: quiet 1px border, token radius. */
export const cardClass = "rounded-xl border border-border/60 bg-card text-card-foreground"

/** Subtle hover lift for interactive cards. */
export const liftClass =
  "transition-[transform,box-shadow,border-color] duration-150 ease-out " +
  "hover:border-border motion-safe:hover:-translate-y-px hover:shadow-[0_1px_2px_rgb(0_0_0/0.04),0_6px_16px_-8px_rgb(0_0_0/0.10)]"

/** Layout container. */
export const containerClass = "mx-auto w-full max-w-6xl px-4 sm:px-6"

export const eyebrowClass = "text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
