import { useState, useEffect, useCallback, useMemo } from "react"
import { rolesService } from "@/services/rolesService"
import { useUsersStore } from "@/app/users/stores/usersStore"
import type { Role, Permission } from "@/types"

// ─── Options ─────────────────────────────────────────────────────────────────

interface UseRolesPermissionsOptions {
  /** User id to fetch current roles/permissions for. Omit for create mode. */
  userId?: string
  /** Fetch all available roles/permissions on mount (default: true) */
  fetchAvailableOnMount?: boolean
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useRolesPermissions(options: UseRolesPermissionsOptions = {}) {
  const { userId, fetchAvailableOnMount = true } = options

  // ── Available roles/permissions from the system ────────────────────────────
  const [availableRoles, setAvailableRoles] = useState<Role[]>([])
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([])
  const [availableLoading, setAvailableLoading] = useState(false)
  const [availableError, setAvailableError] = useState<string | null>(null)

  // ── Current selections (mutable draft) ─────────────────────────────────────
  const [currentRoles, setCurrentRoles] = useState<string[]>([])
  const [currentPermissions, setCurrentPermissions] = useState<string[]>([])

  // ── Initial state snapshot (for dirty checking) ────────────────────────────
  const [initialRoles, setInitialRoles] = useState<string[]>([])
  const [initialPermissions, setInitialPermissions] = useState<string[]>([])

  // ── Store access ───────────────────────────────────────────────────────────
  const {
    rolesAndPermissions,
    rolesPermissionsLoading,
    rolesPermissionsError,
    syncingRolesPermissions,
    fetchRolesAndPermissions,
    syncRoles: storeSyncRoles,
    syncPermissions: storeSyncPermissions,
    syncRolesAndPermissions: storeSyncBoth,
    clearRolesPermissionsError,
  } = useUsersStore()

  // ── Fetch all available roles and permissions ──────────────────────────────

  const fetchAvailable = useCallback(async () => {
    setAvailableLoading(true)
    setAvailableError(null)
    try {
      const [roles, permissions] = await Promise.all([
        rolesService.getAll(),
        rolesService.getAllPermissions(),
      ])
      setAvailableRoles(roles)
      setAvailablePermissions(permissions)
    } catch {
      setAvailableError("Failed to load available roles and permissions.")
    } finally {
      setAvailableLoading(false)
    }
  }, [])

  useEffect(() => {
    if (fetchAvailableOnMount) fetchAvailable()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAvailableOnMount])

  // ── Fetch user data ────────────────────────────────────────────────────────

  useEffect(() => {
    if (userId) fetchRolesAndPermissions(userId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const refetchUserData = useCallback(() => {
    if (userId) fetchRolesAndPermissions(userId)
  }, [userId, fetchRolesAndPermissions])

  // ── Sync local state from store when data arrives for this user ────────────

  useEffect(() => {
    if (
      rolesAndPermissions &&
      userId &&
      String(rolesAndPermissions.user.id) === userId
    ) {
      const rNames = rolesAndPermissions.roles.map((r) => r.name)
      const pNames = rolesAndPermissions.direct_permissions.map((p) => p.name)
      setCurrentRoles(rNames)
      setCurrentPermissions(pNames)
      setInitialRoles(rNames)
      setInitialPermissions(pNames)
    }
  }, [rolesAndPermissions, userId])

  // ── Dirty tracking ────────────────────────────────────────────────────────

  const rolesChanged = useMemo(() => {
    const a = [...currentRoles].sort()
    const b = [...initialRoles].sort()
    return JSON.stringify(a) !== JSON.stringify(b)
  }, [currentRoles, initialRoles])

  const permissionsChanged = useMemo(() => {
    const a = [...currentPermissions].sort()
    const b = [...initialPermissions].sort()
    return JSON.stringify(a) !== JSON.stringify(b)
  }, [currentPermissions, initialPermissions])

  const isDirty = rolesChanged || permissionsChanged

  // ── Inherited permissions (from currently selected roles) ─────────────────

  const inheritedPermissions = useMemo(() => {
    const names = new Set<string>()
    for (const roleName of currentRoles) {
      const role = availableRoles.find((r) => r.name === roleName)
      if (role?.permissions) {
        for (const perm of role.permissions) names.add(perm.name)
      }
    }
    return [...names]
  }, [currentRoles, availableRoles])

  // ── Toggle helpers ────────────────────────────────────────────────────────

  const toggleRole = useCallback((name: string) => {
    setCurrentRoles((prev) =>
      prev.includes(name) ? prev.filter((r) => r !== name) : [...prev, name],
    )
  }, [])

  const togglePermission = useCallback((name: string) => {
    setCurrentPermissions((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name],
    )
  }, [])

  // ── Smart save — calls only the endpoint(s) that changed ──────────────────

  const saveChanges = useCallback(
    async (targetUserId: string): Promise<boolean> => {
      if (!rolesChanged && !permissionsChanged) return true

      if (rolesChanged && permissionsChanged) {
        return storeSyncBoth(targetUserId, currentRoles, currentPermissions)
      }
      if (rolesChanged) {
        return storeSyncRoles(targetUserId, currentRoles)
      }
      return storeSyncPermissions(targetUserId, currentPermissions)
    },
    [
      rolesChanged,
      permissionsChanged,
      currentRoles,
      currentPermissions,
      storeSyncRoles,
      storeSyncPermissions,
      storeSyncBoth,
    ],
  )

  // ── Reset to initial state ────────────────────────────────────────────────

  const reset = useCallback(() => {
    setCurrentRoles([...initialRoles])
    setCurrentPermissions([...initialPermissions])
  }, [initialRoles, initialPermissions])

  // ── Combined states ───────────────────────────────────────────────────────

  const loading = availableLoading || rolesPermissionsLoading
  const error = availableError || rolesPermissionsError
  const syncing = syncingRolesPermissions

  return {
    /** All roles available in the system */
    availableRoles,
    /** All permissions available in the system */
    availablePermissions,
    /** Currently selected role names */
    currentRoles,
    /** Currently selected permission names */
    currentPermissions,
    /** Snapshot of roles at load time */
    initialRoles,
    /** Snapshot of permissions at load time */
    initialPermissions,
    /** Permission names inherited from the currently selected roles */
    inheritedPermissions,
    /** Whether roles have been modified from initial */
    rolesChanged,
    /** Whether permissions have been modified from initial */
    permissionsChanged,
    /** Whether anything has been modified */
    isDirty,
    /** Combined loading state (available + user data) */
    loading,
    /** True while fetching available roles/permissions only */
    availableLoading,
    /** Combined error message */
    error,
    /** True while a sync operation is in-flight */
    syncing,
    /** Raw roles-and-permissions data from the store */
    rolesAndPermissions,
    /** Set selected roles directly */
    setCurrentRoles,
    /** Set selected permissions directly */
    setCurrentPermissions,
    /** Toggle a single role */
    toggleRole,
    /** Toggle a single permission */
    togglePermission,
    /** Save changes — calls only the endpoint(s) needed */
    saveChanges,
    /** Reset selections to initial state */
    reset,
    /** Manually fetch available roles/permissions */
    fetchAvailable,
    /** Re-fetch the user's current roles/permissions */
    refetchUserData,
    /** Clear the roles-permissions error */
    clearError: clearRolesPermissionsError,
  } as const
}
