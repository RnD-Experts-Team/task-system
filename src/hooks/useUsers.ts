import { useEffect } from "react"
import { useUsersStore } from "@/app/users/stores/usersStore"

/**
 * Hook that connects a component to the users store.
 *
 * On first render it triggers `fetchUsers(initialPage)` automatically,
 * then exposes the full store slice (list + CRUD + detail) to the UI.
 *
 * @param initialPage - Which API page to load on mount (default: 1)
 */
export function useUsers(initialPage = 1) {
  const {
    users,
    pagination,
    loading,
    error,
    submitting,
    submitError,
    selectedUser,
    selectedLoading,
    // Roles & permissions state
    rolesAndPermissions,
    rolesPermissionsLoading,
    rolesPermissionsError,
    syncingRolesPermissions,
    // Actions
    fetchUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    clearError,
    clearSubmitError,
    // Roles & permissions actions
    fetchRolesAndPermissions,
    syncRoles,
    syncPermissions,
    syncRolesAndPermissions,
    clearRolesPermissionsError,
  } = useUsersStore()

  // Fetch on mount; re-runs only if initialPage changes
  useEffect(() => {
    fetchUsers(initialPage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPage])

  return {
    users,
    pagination,
    loading,
    error,
    /** True while a create / update / delete is in-flight */
    submitting,
    /** Error message from the last mutation */
    submitError,
    /** Single user loaded by getUser (for detail sheet) */
    selectedUser,
    /** True while getUser is loading */
    selectedLoading,
    /** Fetch a specific page of users */
    fetchUsers,
    /** Fetch a single user by id */
    getUser,
    /** Create a new user — returns true on success */
    createUser,
    /** Update a user — returns true on success */
    updateUser,
    /** Delete a user — returns true on success */
    deleteUser,
    /** Dismiss the list error banner */
    clearError,
    /** Dismiss the mutation error */
    clearSubmitError,
    // ── Roles & permissions ──────────────────────────────────────────────────
    /** Roles & permissions data for a user */
    rolesAndPermissions,
    /** True while loading roles-and-permissions */
    rolesPermissionsLoading,
    /** Error from roles-and-permissions operations */
    rolesPermissionsError,
    /** True while syncing roles/permissions */
    syncingRolesPermissions,
    /** Fetch roles-and-permissions by user id */
    fetchRolesAndPermissions,
    /** Sync user roles */
    syncRoles,
    /** Sync user permissions */
    syncPermissions,
    /** Sync both roles and permissions */
    syncRolesAndPermissions,
    /** Dismiss roles-permissions error */
    clearRolesPermissionsError,
  } as const
}
