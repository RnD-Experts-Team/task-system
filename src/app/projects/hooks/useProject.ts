import { useEffect } from "react"
import { useProjectsStore } from "../store/projectStore"

// Fetches a single project by ID and cleans up on unmount
export function useProject(id: number | null) {
  const selectedProject = useProjectsStore((s) => s.selectedProject)
  const selectedLoading = useProjectsStore((s) => s.selectedLoading)
  const error = useProjectsStore((s) => s.error)
  const getProject = useProjectsStore((s) => s.getProject)
  const clearSelectedProject = useProjectsStore((s) => s.clearSelectedProject)

  useEffect(() => {
    if (id !== null) {
      getProject(id)
    }
    return () => clearSelectedProject()
  }, [id, getProject, clearSelectedProject])

  return { project: selectedProject, loading: selectedLoading, error }
}
