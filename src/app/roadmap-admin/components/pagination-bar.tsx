import { Pagination as PaginationControls } from "@/components/pagination"
import { PaginationInfo } from "@/components/pagination-info"
import type { Pagination } from "../types"

type PaginationBarProps = {
  pagination: Pagination | null
  label: string
  onPageChange: (page: number) => void
}

/** "Showing 1–20 of 84 posts" + page buttons. Renders nothing for a single empty page. */
export function PaginationBar({ pagination, label, onPageChange }: PaginationBarProps) {
  if (!pagination || pagination.total === 0) return null
  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <PaginationInfo
        startItem={pagination.from ?? 0}
        endItem={pagination.to ?? 0}
        totalItems={pagination.total}
        label={label}
      />
      {pagination.last_page > 1 && (
        <PaginationControls
          currentPage={pagination.current_page}
          totalPages={pagination.last_page}
          onPageChange={onPageChange}
        />
      )}
    </div>
  )
}
