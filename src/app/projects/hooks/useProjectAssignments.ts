// Hook to fetch all user assignments for a given project.
// Calls GET /projects/{projectId}/assignments and returns the list of
// assigned users, each with their tasks and percentage allocation.
//
// Follows the same cancel-safe pattern as useSectionTasks / useKanban.

import { useCallback, useEffect, useState } from "react"
import { isCancel } from "axios"
import { projectService } from "../services/projectService"
import type { ProjectAssignedUser } from "../types"

// Backend may return snake_case relation names (assigned_tasks).
// Normalize response users so the UI can always rely on `assignedTasks`.
function normalizeAssignedUsers(input: unknown): ProjectAssignedUser[] {
  if (!Array.isArray(input)) return []

  return input.map((rawUser) => {
    const user = (rawUser ?? {}) as Record<string, unknown>

    const tasks = Array.isArray(user.assignedTasks)
      ? user.assignedTasks
      : Array.isArray(user.assigned_tasks)
      ? user.assigned_tasks
      : []

    return {
      id: Number(user.id ?? 0),
      name: String(user.name ?? "Unknown User"),
      email: String(user.email ?? ""),
      avatar_path: (user.avatar_path as string | null) ?? null,
      avatar_url: (user.avatar_url as string | null) ?? null,
      assignedTasks: tasks as ProjectAssignedUser["assignedTasks"],
    }
  })
}

export function useProjectAssignments(projectId: number | null) {
  const [assignedUsers, setAssignedUsers] = useState<ProjectAssignedUser[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stable fetch function — safe to include in effect deps
  const fetchAssignments = useCallback(async () => {
    if (projectId === null) return

    setLoading(true)
    setError(null)

    try {
      const data = await projectService.getAssignments(projectId)
      const normalizedUsers = normalizeAssignedUsers(data.assigned_users)

      setAssignedUsers(normalizedUsers)
      setTotalCount(data.total_assigned_users ?? normalizedUsers.length)
    } catch (err) {
      // Ignore axios cancel errors (triggered on component unmount cleanup)
      if (!isCancel(err)) {
        setError("Failed to load team assignments.")
      }
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // Fetch on mount and whenever projectId changes
  useEffect(() => {
    fetchAssignments()
  }, [fetchAssignments])

  return {
    assignedUsers,
    /** Total number of distinct users assigned in this project */
    totalCount,
    loading,
    error,
    /** Reload data without remounting — call after task assignment mutations */
    refetch: fetchAssignments,
  }
}
