// Hook to fetch all tasks for a given section.
// Follows the same cancel-safe pattern as useKanban / useSections.

import { useEffect, useState } from "react"
import { isCancel } from "axios"
import { sectionService } from "../section-service"
import type { SectionTask } from "../types"

export function useSectionTasks(sectionId: number | null) {
  const [tasks, setTasks] = useState<SectionTask[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sectionId === null) return

    let cancelled = false
    setLoading(true)
    setError(null)

    sectionService
      .getTasksBySection(sectionId)
      .then((data) => {
        if (!cancelled) setTasks(data)
      })
      .catch((err) => {
        if (!cancelled && !isCancel(err)) {
          setError("Failed to load tasks.")
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [sectionId])

  return { tasks, loading, error }
}
