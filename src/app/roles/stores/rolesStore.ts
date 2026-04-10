import { create } from "zustand"
import { isCancel, AxiosError } from "axios"
import { rolesService, type RolesPaginationMeta } from "@/app/roles/services/rolesService"
import type { Role, Permission, ApiValidationError } from "@/types"
import type { RoleFormData } from "@/app/roles/types"

// ─── Helper: extract user-friendly error from Axios ───────────────────────────
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiValidationError | undefined
    if (data?.errors) {
      return Object.values(data.errors).flat().join(". ")
    }
    if (data?.message) return data.message
  }
  return fallback
}

// ─── State shape ──────────────────────────────────────────────────────────────

interface RolesState {
  roles: Role[]
  pagination: RolesPaginationMeta | null
  loading: boolean
  error: string | null
  availablePermissions: Permission[]
  permissionsLoading: boolean
  permissionsError: string | null

  /** Currently selected role (for detail view) */
  selectedRole: Role | null
  selectedLoading: boolean

  /** Mutation state (create / update / delete) */
  submitting: boolean
  submitError: string | null
}

interface RolesActions {
  fetchRoles: (page?: number) => Promise<void>
  fetchPermissions: () => Promise<void>
  getRole: (id: number) => Promise<void>
  createRole: (payload: RoleFormData) => Promise<Role | null>
  updateRole: (id: number, payload: RoleFormData) => Promise<boolean>
  deleteRole: (id: number) => Promise<boolean>
  clearError: () => void
  clearSubmitError: () => void
}

type RolesStore = RolesState & RolesActions

// ─── Store ────────────────────────────────────────────────────────────────────

export const useRolesStore = create<RolesStore>()((set, get) => ({
  // ── Initial state ──
  roles: [],
  pagination: null,
  loading: false,
  error: null,
  availablePermissions: [],
  permissionsLoading: false,
  permissionsError: null,
  selectedRole: null,
  selectedLoading: false,
  submitting: false,
  submitError: null,

  // ── Fetch paginated list ──
  fetchRoles: async (page = 1) => {
    set({ loading: true, error: null })
    try {
      const { roles, pagination } = await rolesService.getAll(page)
      set({ roles, pagination })
    } catch (err) {
      if (!isCancel(err)) {
        set({ error: "Failed to load roles. Please try again." })
      }
    } finally {
      set({ loading: false })
    }
  },

  // ── Fetch permissions catalog for role form ──
  fetchPermissions: async () => {
    set({ permissionsLoading: true, permissionsError: null })
    try {
      const permissions = await rolesService.getAllPermissions()
      set({ availablePermissions: permissions })
    } catch (err) {
      if (!isCancel(err)) {
        set({ permissionsError: "Failed to load permissions." })
      }
    } finally {
      set({ permissionsLoading: false })
    }
  },

  // ── Fetch single role by id ──
  getRole: async (id: number) => {
    set({ selectedLoading: true, selectedRole: null })
    try {
      const role = await rolesService.getById(id)
      set({ selectedRole: role })
    } catch (err) {
      if (!isCancel(err)) {
        set({ error: "Failed to load role details." })
      }
    } finally {
      set({ selectedLoading: false })
    }
  },

  // ── Create role ──
  createRole: async (payload: RoleFormData) => {
    set({ submitting: true, submitError: null })
    try {
      const role = await rolesService.create(payload)
      // Refresh current page
      const currentPage = get().pagination?.current_page ?? 1
      await get().fetchRoles(currentPage)
      return role
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to create role.") })
      }
      return null
    } finally {
      set({ submitting: false })
    }
  },

  // ── Update role ──
  updateRole: async (id: number, payload: RoleFormData) => {
    set({ submitting: true, submitError: null })
    try {
      await rolesService.update(id, payload)
      const currentPage = get().pagination?.current_page ?? 1
      await get().fetchRoles(currentPage)
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to update role.") })
      }
      return false
    } finally {
      set({ submitting: false })
    }
  },

  // ── Delete role ──
  deleteRole: async (id: number) => {
    set({ submitting: true, submitError: null })
    try {
      await rolesService.delete(id)
      const currentPage = get().pagination?.current_page ?? 1
      await get().fetchRoles(currentPage)
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to delete role.") })
      }
      return false
    } finally {
      set({ submitting: false })
    }
  },

  clearError: () => set({ error: null }),
  clearSubmitError: () => set({ submitError: null }),
}))
