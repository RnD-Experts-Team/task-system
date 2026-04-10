import { useEffect } from "react"
import { useProjectsStore } from "../store/projectStore"

// Fetches and returns the project list on mount
export function useProjects() {
  const projects = useProjectsStore((s) => s.projects)
  const loading = useProjectsStore((s) => s.loading)
  const error = useProjectsStore((s) => s.error)
  const fetchProjects = useProjectsStore((s) => s.fetchProjects)
  const clearError = useProjectsStore((s) => s.clearError)

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  return { projects, loading, error, refetch: fetchProjects, clearError }
}
