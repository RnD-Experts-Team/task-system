import { apiClient } from "@/services/api"
import { isCancel } from "axios"
import type { Role, Permission } from "@/types"

// ─── Response shapes ─────────────────────────────────────────────────────────

/** GET /roles → paginated list of all roles */
interface RolesRawResponse {
  success: boolean
  data: Role[]
  pagination: {
    current_page: number
    total: number
    per_page: number
    last_page: number
    from: number | null
    to: number | null
  }
  message: string
}

/**
 * GET /permissions → flat list of ALL permissions (no pagination).
 * Requires the caller to have the "view permissions" permission on the backend.
 */
interface PermissionsRawResponse {
  success: boolean
  data: Permission[]
  message: string
}

/**
 * GET /permissions/{id} → single permission object.
 * Returns null in data when not found (404 from the server).
 * Requires the caller to have the "view permissions" permission on the backend.
 */
interface PermissionByIdRawResponse {
  success: boolean
  data: Permission | null
  message: string
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const rolesService = {
  /**
   * GET /roles
   * Fetches every role defined in the system.
   * Sends a large per_page so we get everything in one request.
   */
  getAll: async (): Promise<Role[]> => {
    const raw = (await apiClient.get<never>("/roles", {
      params: { per_page: 100 },
    })) as unknown as RolesRawResponse
    return raw.data
  },

  /**
   * GET /permissions
   * Returns every permission defined in the system as a flat list.
   * Only succeeds for users who hold the "view permissions" permission.
   * Cancellation errors are re-thrown so callers can ignore them;
   * all other errors propagate so the UI can display a message.
   */
  getAllPermissions: async (): Promise<Permission[]> => {
    try {
      const raw = (await apiClient.get<never>(
        "/permissions",
      )) as unknown as PermissionsRawResponse
      return raw.data
    } catch (err) {
      // Re-throw cancellation so callers can silently ignore it
      if (isCancel(err)) throw err
      // For any real error (403 forbidden, network down, etc.) re-throw
      // so the calling hook can set its error state and show it in the UI.
      throw err
    }
  },

  /**
   * GET /permissions/{id}
   * Fetches a single permission by its numeric id.
   * Returns null if the permission was not found (404).
   * Only succeeds for users who hold the "view permissions" permission.
   * Cancellation errors are re-thrown so callers can ignore them.
   */
  getPermissionById: async (id: number): Promise<Permission | null> => {
    try {
      const raw = (await apiClient.get<never>(
        `/permissions/${id}`,
      )) as unknown as PermissionByIdRawResponse
      // Backend returns null in data when not found
      return raw.data
    } catch (err) {
      // Re-throw cancellation so callers can silently ignore it
      if (isCancel(err)) throw err
      // Re-throw real errors so the UI can show an error message
      throw err
    }
  },
}
