import { useState, useMemo } from "react"

interface UsePaginationOptions {
  itemsPerPage?: number
}

interface UsePaginationReturn<T> {
  page: number
  totalPages: number
  paged: T[]
  startItem: number
  endItem: number
  totalItems: number
  setPage: (page: number) => void
  resetPage: () => void
}

export function usePagination<T>(
  items: T[],
  options: UsePaginationOptions = {}
): UsePaginationReturn<T> {
  const { itemsPerPage = 10 } = options
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage))
  const page = Math.min(currentPage, totalPages)

  const paged = useMemo(
    () => items.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [items, page, itemsPerPage]
  )

  const startItem = items.length === 0 ? 0 : (page - 1) * itemsPerPage + 1
  const endItem = Math.min(page * itemsPerPage, items.length)

  function setPage(p: number) {
    setCurrentPage(Math.max(1, Math.min(p, totalPages)))
  }

  function resetPage() {
    setCurrentPage(1)
  }

  return {
    page,
    totalPages,
    paged,
    startItem,
    endItem,
    totalItems: items.length,
    setPage,
    resetPage,
  }
}
