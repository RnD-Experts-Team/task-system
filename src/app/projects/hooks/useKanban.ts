import { useEffect, useState } from "react"
import { isCancel } from "axios"
import { projectService } from "../services/projectService"
import type { KanbanData } from "../types"

// Fetches kanban board data for a project from the API
export function useKanban(projectId: number | null) {
  const [data, setData] = useState<KanbanData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (projectId === null) return

    let cancelled = false
    setLoading(true)
    setError(null)

    projectService
      .getKanban(projectId)
      .then((kanban) => {
        if (!cancelled) setData(kanban)
      })
      .catch((err) => {
        if (!cancelled && !isCancel(err)) {
          setError("Failed to load kanban board.")
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [projectId])

  return { data, loading, error }
}
