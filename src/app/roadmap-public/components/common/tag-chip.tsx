import { cn } from "@/lib/utils"

export function TagChip({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium leading-5 text-muted-foreground",
        className,
      )}
    >
      {name}
    </span>
  )
}
