// Hook to fetch all stakeholder ratings for a given project.
// Calls GET /projects/{projectId}/stakeholder-ratings and returns
// the paginated list of rating entries with their submitting stakeholder.
//
// Follows the same cancel-safe pattern as useSectionTasks / useProjectAssignments.

import { useCallback, useEffect, useState } from "react"
import { isCancel } from "axios"
import { projectService } from "../services/projectService"
import type { StakeholderRatingEntry } from "../types"

export function useStakeholderRatings(projectId: number | null) {
  const [ratings, setRatings] = useState<StakeholderRatingEntry[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Stable fetch function — safe to include in effect deps
  const fetchRatings = useCallback(async () => {
    if (projectId === null) return

    setLoading(true)
    setError(null)

    try {
      const response = await projectService.getStakeholderRatings(projectId)
      setRatings(response.data)
      setTotalCount(response.pagination?.total ?? response.data.length)
    } catch (err) {
      // Ignore axios cancel errors (triggered on component unmount cleanup)
      if (!isCancel(err)) {
        setError("Failed to load stakeholder ratings.")
      }
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // Fetch on mount and whenever projectId changes
  useEffect(() => {
    fetchRatings()
  }, [fetchRatings])

  return {
    ratings,
    /** Total number of rating entries from the paginator */
    totalCount,
    loading,
    error,
    /** Reload data without remounting — call after rating mutations */
    refetch: fetchRatings,
  }
}
