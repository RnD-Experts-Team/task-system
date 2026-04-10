import { apiClient } from "@/services/api"
import type { Role, Permission } from "@/types"

// ─── Response shapes ─────────────────────────────────────────────────────────

/** GET /roles returns paginated data */
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

/** GET /permissions returns all permissions (no pagination) */
interface PermissionsRawResponse {
  success: boolean
  data: Permission[]
  message: string
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const rolesService = {
  /**
   * GET /roles — fetch all available roles in the system.
   * Uses a large per_page to get all roles in a single request.
   */
  getAll: async (): Promise<Role[]> => {
    const raw = (await apiClient.get<never>("/roles", {
      params: { per_page: 100 },
    })) as unknown as RolesRawResponse
    return raw.data
  },

  /**
   * GET /permissions — fetch all available permissions in the system.
   */
  getAllPermissions: async (): Promise<Permission[]> => {
    const raw = (await apiClient.get<never>(
      "/permissions",
    )) as unknown as PermissionsRawResponse
    return raw.data
  },
}
