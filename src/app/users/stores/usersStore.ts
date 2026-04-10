import { create } from "zustand"
import { isCancel, AxiosError } from "axios"
import {
  usersService,
  type UsersPaginationMeta,
  type CreateUserPayload,
  type UpdateUserPayload,
  type UserRolesAndPermissions,
} from "@/services/usersService"
import type { User } from "@/app/users/data"
import type { ApiValidationError } from "@/types"

// ─── Helper: extract a user-friendly error from Axios errors ──────────────────
function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiValidationError | undefined
    // If the backend returned validation errors, join them into one string
    if (data?.errors) {
      return Object.values(data.errors).flat().join(". ")
    }
    // Otherwise use the top-level message
    if (data?.message) return data.message
  }
  return fallback
}

// ─── State shape ──────────────────────────────────────────────────────────────

interface UsersState {
  /** Current page of users fetched from the API */
  users: User[]
  /** Pagination metadata from the last successful fetch */
  pagination: UsersPaginationMeta | null
  /** True while fetchUsers is in-flight */
  loading: boolean
  /** Non-null when the last fetch failed (cancelled requests are ignored) */
  error: string | null
  /** True while a create / update / delete mutation is in-flight */
  submitting: boolean
  /** Non-null when the last mutation failed */
  submitError: string | null
  /** The single user loaded by getById (for the detail sheet) */
  selectedUser: User | null
  /** True while getById is loading */
  selectedLoading: boolean

  // ── Roles & Permissions state ────────────────────────────────────────────
  /** Data returned from GET /users/{id}/roles-and-permissions */
  rolesAndPermissions: UserRolesAndPermissions | null
  /** True while fetching roles-and-permissions */
  rolesPermissionsLoading: boolean
  /** Error from roles-and-permissions fetch or sync */
  rolesPermissionsError: string | null
  /** True while a sync (roles/permissions/both) is in-flight */
  syncingRolesPermissions: boolean
}

// ─── Actions shape ────────────────────────────────────────────────────────────

interface UsersActions {
  /** Fetch a page of users from GET /users */
  fetchUsers: (page?: number) => Promise<void>
  /** Fetch a single user by id */
  getUser: (id: string) => Promise<void>
  /** Create a new user via POST /users — returns the created user on success */
  createUser: (payload: CreateUserPayload) => Promise<User | null>
  /** Update an existing user via PUT /users/{id} */
  updateUser: (id: string, payload: UpdateUserPayload) => Promise<boolean>
  /** Delete a user via DELETE /users/{id} */
  deleteUser: (id: string) => Promise<boolean>
  /** Clear the list-level error */
  clearError: () => void
  /** Clear the mutation-level error */
  clearSubmitError: () => void

  // ── Roles & Permissions actions ──────────────────────────────────────────
  /** Fetch roles-and-permissions for a user */
  fetchRolesAndPermissions: (userId: string) => Promise<void>
  /** Sync only the user's roles */
  syncRoles: (userId: string, roles: string[]) => Promise<boolean>
  /** Sync only the user's direct permissions */
  syncPermissions: (userId: string, permissions: string[]) => Promise<boolean>
  /** Sync both roles and permissions at once */
  syncRolesAndPermissions: (userId: string, roles: string[], permissions: string[]) => Promise<boolean>
  /** Clear roles-and-permissions error */
  clearRolesPermissionsError: () => void
}

type UsersStore = UsersState & UsersActions

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUsersStore = create<UsersStore>()((set, get) => ({
  // ── initial state ──────────────────────────────────────────────────────────
  users: [],
  pagination: null,
  loading: false,
  error: null,
  submitting: false,
  submitError: null,
  selectedUser: null,
  selectedLoading: false,
  rolesAndPermissions: null,
  rolesPermissionsLoading: false,
  rolesPermissionsError: null,
  syncingRolesPermissions: false,

  // ── list action ────────────────────────────────────────────────────────────

  fetchUsers: async (page = 1) => {
    set({ loading: true, error: null })

    try {
      const { users, pagination } = await usersService.getAll(page)
      set({ users, pagination })
    } catch (err) {
      if (!isCancel(err)) {
        set({ error: "Failed to load users. Please check your connection and try again." })
      }
    } finally {
      set({ loading: false })
    }
  },

  // ── single-user action ─────────────────────────────────────────────────────

  getUser: async (id: string) => {
    set({ selectedLoading: true, selectedUser: null })

    try {
      const user = await usersService.getById(id)
      set({ selectedUser: user })
    } catch (err) {
      if (!isCancel(err)) {
        set({ error: "Failed to load user details." })
      }
    } finally {
      set({ selectedLoading: false })
    }
  },

  // ── create action ──────────────────────────────────────────────────────────
  // Returns true on success so the UI can navigate away from the form.

  createUser: async (payload: CreateUserPayload) => {
    set({ submitting: true, submitError: null })

    try {
      const user = await usersService.create(payload)
      // Refresh the current page so the new user appears in the list
      const currentPage = get().pagination?.current_page ?? 1
      await get().fetchUsers(currentPage)
      return user
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to create user.") })
      }
      return null
    } finally {
      set({ submitting: false })
    }
  },

  // ── update action ──────────────────────────────────────────────────────────

  updateUser: async (id: string, payload: UpdateUserPayload) => {
    set({ submitting: true, submitError: null })

    try {
      await usersService.update(id, payload)
      const currentPage = get().pagination?.current_page ?? 1
      await get().fetchUsers(currentPage)
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to update user.") })
      }
      return false
    } finally {
      set({ submitting: false })
    }
  },

  // ── delete action ──────────────────────────────────────────────────────────

  deleteUser: async (id: string) => {
    set({ submitting: true, submitError: null })

    try {
      await usersService.delete(id)
      const currentPage = get().pagination?.current_page ?? 1
      await get().fetchUsers(currentPage)
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ submitError: extractErrorMessage(err, "Failed to delete user.") })
      }
      return false
    } finally {
      set({ submitting: false })
    }
  },

  clearError: () => set({ error: null }),
  clearSubmitError: () => set({ submitError: null }),
  clearRolesPermissionsError: () => set({ rolesPermissionsError: null }),

  // ── Roles & Permissions actions ────────────────────────────────────────────

  fetchRolesAndPermissions: async (userId: string) => {
    set({ rolesPermissionsLoading: true, rolesPermissionsError: null, rolesAndPermissions: null })

    try {
      const data = await usersService.getRolesAndPermissions(userId)
      set({ rolesAndPermissions: data })
    } catch (err) {
      if (!isCancel(err)) {
        set({ rolesPermissionsError: extractErrorMessage(err, "Failed to load roles and permissions.") })
      }
    } finally {
      set({ rolesPermissionsLoading: false })
    }
  },

  // Sync only roles, then refresh the data
  syncRoles: async (userId: string, roles: string[]) => {
    set({ syncingRolesPermissions: true, rolesPermissionsError: null })

    try {
      await usersService.syncRoles(userId, roles)
      // Refresh roles-and-permissions after successful sync
      await get().fetchRolesAndPermissions(userId)
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ rolesPermissionsError: extractErrorMessage(err, "Failed to sync roles.") })
      }
      return false
    } finally {
      set({ syncingRolesPermissions: false })
    }
  },

  // Sync only permissions, then refresh the data
  syncPermissions: async (userId: string, permissions: string[]) => {
    set({ syncingRolesPermissions: true, rolesPermissionsError: null })

    try {
      await usersService.syncPermissions(userId, permissions)
      await get().fetchRolesAndPermissions(userId)
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ rolesPermissionsError: extractErrorMessage(err, "Failed to sync permissions.") })
      }
      return false
    } finally {
      set({ syncingRolesPermissions: false })
    }
  },

  // Sync both roles and permissions at once, then refresh
  syncRolesAndPermissions: async (userId: string, roles: string[], permissions: string[]) => {
    set({ syncingRolesPermissions: true, rolesPermissionsError: null })

    try {
      await usersService.syncRolesAndPermissions(userId, roles, permissions)
      await get().fetchRolesAndPermissions(userId)
      return true
    } catch (err) {
      if (!isCancel(err)) {
        set({ rolesPermissionsError: extractErrorMessage(err, "Failed to sync roles and permissions.") })
      }
      return false
    } finally {
      set({ syncingRolesPermissions: false })
    }
  },
}))
