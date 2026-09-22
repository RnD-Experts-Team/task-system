// src/app/work-sessions/hooks/useAdminUsers.ts
// Cached user list for the admin pickers. Only fetches when the current user
// is an admin or holds "view all work sessions" — the endpoint 403s otherwise.

import { useEffect } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { useAdminWorkSessionStore } from "../store/adminWorkSessionStore"

export function useAdminUsers() {
  const { hasRole, hasPermission } = usePermissions()
  const enabled = hasRole("admin") || hasPermission("view all work sessions")

  const users = useAdminWorkSessionStore((s) => s.users)
  const loading = useAdminWorkSessionStore((s) => s.usersLoading)
  const error = useAdminWorkSessionStore((s) => s.usersError)
  const fetchUsers = useAdminWorkSessionStore((s) => s.fetchUsers)
  const clearError = useAdminWorkSessionStore((s) => s.clearUsersError)

  useEffect(() => {
    if (enabled) fetchUsers()
  }, [enabled, fetchUsers])

  return { users, loading, error, enabled, clearError }
}
