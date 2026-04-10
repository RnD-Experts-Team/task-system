import { apiClient } from "@/services/api"
import type { Role, Permission } from "@/types"
import type { RoleFormData } from "@/app/roles/types"

// ─── Response shapes ─────────────────────────────────────────────────────────

interface RolesListResponse {
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

interface SingleRoleResponse {
  success: boolean
  data: Role
  message: string
}

interface PermissionsResponse {
  success: boolean
  data: Permission[]
  message: string
}

/** Pagination info exposed to the store */
export interface RolesPaginationMeta {
  current_page: number
  total: number
  per_page: number
  last_page: number
  from: number | null
  to: number | null
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const rolesService = {
  /** GET /roles — fetch paginated roles */
  getAll: async (page = 1, perPage = 15): Promise<{ roles: Role[]; pagination: RolesPaginationMeta }> => {
    const raw = (await apiClient.get<never>("/roles", {
      params: { page, per_page: perPage },
    })) as unknown as RolesListResponse

    return { roles: raw.data, pagination: raw.pagination }
  },

  /** GET /roles/{id} — fetch a single role */
  getById: async (id: number): Promise<Role> => {
    const raw = (await apiClient.get<never>(`/roles/${id}`)) as unknown as SingleRoleResponse
    return raw.data
  },

  /** POST /roles — create a new role */
  create: async (payload: RoleFormData): Promise<Role> => {
    const raw = (await apiClient.post<never>("/roles", payload, {
      toast: { success: "Role created successfully" },
    } as never)) as unknown as SingleRoleResponse
    return raw.data
  },

  /** PUT /roles/{id} — update an existing role */
  update: async (id: number, payload: RoleFormData): Promise<Role> => {
    const raw = (await apiClient.put<never>(`/roles/${id}`, payload, {
      toast: { success: "Role updated successfully" },
    } as never)) as unknown as SingleRoleResponse
    return raw.data
  },

  /** DELETE /roles/{id} — delete a role */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/roles/${id}`, {
      toast: { success: "Role deleted successfully" },
    } as never)
  },

  /** GET /permissions — fetch all available permissions */
  getAllPermissions: async (): Promise<Permission[]> => {
    const raw = (await apiClient.get<never>("/permissions")) as unknown as PermissionsResponse
    return raw.data
  },
}
