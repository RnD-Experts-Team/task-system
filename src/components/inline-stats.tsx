
type StatItem = { label: string; value: string | number }

export default function InlineStats({ items }: { items: StatItem[] }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
      {items.map((it, idx) => (
        <div key={it.label} className="flex items-baseline gap-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {it.label}
          </span>
          <span className="font-semibold text-foreground">{it.value}</span>
          {idx < items.length - 1 && (
            <span className="mx-2 hidden sm:inline text-muted-foreground">•</span>
          )}
        </div>
      ))}
    </div>
  )
}
