import { useEffect, useState } from "react"
import { apiClient } from "@/services/api"

// Minimal user shape needed for the assignees filter dropdown
export interface FilterUser {
  id: number
  name: string
  avatar_url: string | null
}

// Raw API response shape from GET /users
interface UsersApiResponse {
  success: boolean
  data: FilterUser[]
  pagination: { last_page: number }
}

/**
 * useAllUsers — fetches all users (up to 100) once on mount.
 * Used to populate the assignees filter dropdown on the tasks page.
 * Returns: users array, loading flag, and any error message.
 */
export function useAllUsers() {
  const [users, setUsers] = useState<FilterUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchUsers() {
      setLoading(true)
      setError(null)
      try {
        // Fetch up to 100 users in one request — sufficient for filter dropdown
        const raw = (await apiClient.get<never>("/users", {
          params: { per_page: 100, page: 1 },
        })) as unknown as UsersApiResponse

        if (!cancelled) {
          setUsers(raw.data)
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load users.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchUsers()

    // Cleanup: if the component unmounts before the fetch finishes, discard the result
    return () => {
      cancelled = true
    }
  }, []) // Empty deps — only fetch once when the filter mounts

  return { users, loading, error }
}
