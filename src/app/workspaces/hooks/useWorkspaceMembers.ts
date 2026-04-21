import { useEffect } from "react"
import { useWorkspaceStore } from "../store/workspaceStore"

/**
 * Hook to fetch and access workspace members.
 * Fetches on mount when workspaceId changes.
 */
export function useWorkspaceMembers(workspaceId: number | null) {
  const members = useWorkspaceStore((s) => s.members)
  const loading = useWorkspaceStore((s) => s.membersLoading)
  const error = useWorkspaceStore((s) => s.membersError)
  const fetchMembers = useWorkspaceStore((s) => s.fetchMembers)

  useEffect(() => {
    if (workspaceId !== null) {
      fetchMembers(workspaceId)
    }
  }, [workspaceId, fetchMembers])

  return {
    members,
    loading,
    error,
    refetch: () => workspaceId !== null && fetchMembers(workspaceId),
  }
}
