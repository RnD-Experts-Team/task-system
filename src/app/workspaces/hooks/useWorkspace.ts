import { useEffect } from "react"
import { useWorkspaceStore } from "../store/workspaceStore"

/**
 * Hook to fetch and access a single workspace by ID.
 * Fetches on mount (when id changes), clears on unmount.
 */
export function useWorkspace(id: number | null) {
  const selectedWorkspace = useWorkspaceStore((s) => s.selectedWorkspace)
  const selectedLoading = useWorkspaceStore((s) => s.selectedLoading)
  const selectedError = useWorkspaceStore((s) => s.selectedError)
  const fetchWorkspace = useWorkspaceStore((s) => s.fetchWorkspace)
  const clearSelectedWorkspace = useWorkspaceStore((s) => s.clearSelectedWorkspace)

  useEffect(() => {
    // Fetch workspace data when a valid id is provided
    if (id !== null) {
      fetchWorkspace(id)
    }
    // Clean up workspace data when the component unmounts
    return () => clearSelectedWorkspace()
  }, [id, fetchWorkspace, clearSelectedWorkspace])

  return {
    workspace: selectedWorkspace,
    loading: selectedLoading,
    error: selectedError,
  }
}
