import { useEffect } from "react"
import { useRolesStore } from "@/app/roles/stores/rolesStore"

/** Fetch roles on mount and expose store state */
export function useRoles(page = 1) {
  const {
    roles,
    pagination,
    loading,
    error,
    fetchRoles,
    fetchPermissions,
    clearError,
    availablePermissions,
    permissionsLoading,
    permissionsError,
  } = useRolesStore()

  useEffect(() => {
    fetchRoles(page)
  }, [page, fetchRoles])

  useEffect(() => {
    fetchPermissions()
  }, [fetchPermissions])

  const guardOptions = Array.from(
    new Set(availablePermissions.map((permission) => permission.guard_name)),
  )

  return {
    roles,
    pagination,
    loading,
    error,
    refetch: fetchRoles,
    clearError,
    availablePermissions,
    permissionsLoading,
    permissionsError,
    guardOptions,
  }
}

/** Fetch a single role by id */
export function useRole(id: number | null) {
  const { selectedRole, selectedLoading, error, getRole } = useRolesStore()

  useEffect(() => {
    if (id !== null) getRole(id)
  }, [id, getRole])

  return { role: selectedRole, loading: selectedLoading, error }
}

/** Create role mutation */
export function useCreateRole() {
  const { createRole, submitting, submitError, clearSubmitError } = useRolesStore()
  return { createRole, submitting, submitError, clearSubmitError }
}

/** Update role mutation */
export function useUpdateRole() {
  const { updateRole, submitting, submitError, clearSubmitError } = useRolesStore()
  return { updateRole, submitting, submitError, clearSubmitError }
}

/** Delete role mutation */
export function useDeleteRole() {
  const { deleteRole, submitting, submitError, clearSubmitError } = useRolesStore()
  return { deleteRole, submitting, submitError, clearSubmitError }
}
