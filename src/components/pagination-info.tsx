interface PaginationInfoProps {
  startItem: number
  endItem: number
  totalItems: number
  label: string
}

export function PaginationInfo({ startItem, endItem, totalItems, label }: PaginationInfoProps) {
  return (
    <p className="text-sm text-muted-foreground">
      Showing{" "}
      <span className="font-medium text-foreground">
        {totalItems === 0 ? "0" : `${startItem}–${endItem}`}
      </span>{" "}
      of <span className="font-medium text-foreground">{totalItems}</span> {label}
    </p>
  )
}
