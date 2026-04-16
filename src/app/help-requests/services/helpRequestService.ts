// ─── Help Request Service ─────────────────────────────────────────────────────
// Wraps all help-request API endpoints used by this module:
//   - GET    /help-requests            → getAll()
//   - GET    /help-requests/available  → getAvailable()
//   - GET    /help-requests/{id}       → getById()
//   - POST   /help-requests            → create()
//   - PUT    /help-requests/{id}       → update()
//   - POST   /help-requests/{id}/claim → claim()
//   - POST   /help-requests/{id}/unclaim → unclaim()
//   - DELETE /help-requests/{id}       → delete()

import { apiClient } from "@/services/api"
import type {
  HelpRequest,
  HelpRequestListApiResponse,
  HelpRequestListParams,
  CreateHelpRequestPayload,
  UpdateHelpRequestPayload,
  CompleteHelpRequestPayload,
} from "../types"

// Builds the plain query-param object from HelpRequestListParams,
// omitting undefined / empty values so Axios doesn't send empty keys.
function buildParams(params: HelpRequestListParams): Record<string, unknown> {
  const p: Record<string, unknown> = {}
  if (params.page !== undefined) p.page = params.page
  if (params.per_page !== undefined) p.per_page = params.per_page
  if (params.search?.trim()) p.search = params.search.trim()
  return p
}

class HelpRequestService {
  /**
   * GET /help-requests
   * Returns all help requests (paginated).
   */
  async getAll(params: HelpRequestListParams = {}): Promise<HelpRequestListApiResponse> {
    // The API returns { success, data, pagination, message } — cast through unknown
    // because apiClient.get<T> extracts response.data which nests the outer shape.
    return (await apiClient.get<unknown>("/help-requests", {
      params: buildParams(params),
    })) as unknown as HelpRequestListApiResponse
  }

  /**
   * GET /help-requests/available
   * Returns only unclaimed, not-yet-completed help requests (paginated).
   */
  async getAvailable(params: HelpRequestListParams = {}): Promise<HelpRequestListApiResponse> {
    return (await apiClient.get<unknown>("/help-requests/available", {
      params: buildParams(params),
    })) as unknown as HelpRequestListApiResponse
  }

  /**
   * GET /help-requests/{id}
   * Returns a single help request with all relationships loaded.
   */
  async getById(id: number): Promise<HelpRequest> {
    const response = await apiClient.get<{ data: HelpRequest }>(`/help-requests/${id}`)
    // The API wraps the result in { success, data, message } — pull out data
    return (response as unknown as { data: HelpRequest }).data
  }

  /**
   * POST /help-requests
   * Creates a new help request. Returns the newly created record.
   */
  async create(payload: CreateHelpRequestPayload): Promise<HelpRequest> {
    const response = await apiClient.post<{ data: HelpRequest }>("/help-requests", payload, {
      // Show a toast on success via the interceptor
      toast: { success: "Help request created successfully." },
    } as never)
    return (response as unknown as { data: HelpRequest }).data
  }

  /**
   * PUT /help-requests/{id}
   * Updates description and/or helper for an existing help request.
   * Returns the updated record.
   */
  async update(id: number, payload: UpdateHelpRequestPayload): Promise<HelpRequest> {
    const response = await apiClient.put<{ data: HelpRequest }>(
      `/help-requests/${id}`,
      payload,
      { toast: { success: "Help request updated successfully." } } as never,
    )
    return (response as unknown as { data: HelpRequest }).data
  }

  /**
   * POST /help-requests/{id}/claim
   * Assigns the current authenticated user as helper.
   * Returns the updated help request.
   */
  async claim(id: number): Promise<HelpRequest> {
    const response = await apiClient.post<{ data: HelpRequest }>(
      `/help-requests/${id}/claim`,
      {},
      { toast: { success: "Help request claimed." } } as never,
    )
    return (response as unknown as { data: HelpRequest }).data
  }

  /**
   * POST /help-requests/{id}/unclaim
   * Removes the helper assignment from a help request.
   * Returns the updated help request.
   */
  async unclaim(id: number): Promise<HelpRequest> {
    const response = await apiClient.post<{ data: HelpRequest }>(
      `/help-requests/${id}/unclaim`,
      {},
      { toast: { success: "Help request unclaimed." } } as never,
    )
    return (response as unknown as { data: HelpRequest }).data
  }

  /**
   * POST /help-requests/{id}/assign/{userId}
   * Assigns a specific user as the helper for this help request.
   * Returns the updated help request.
   */
  async assign(id: number, userId: number): Promise<HelpRequest> {
    const response = await apiClient.post<{ data: HelpRequest }>(
      `/help-requests/${id}/assign/${userId}`,
      {},
      { toast: { success: "Help request assigned." } } as never,
    )
    return (response as unknown as { data: HelpRequest }).data
  }

  /**
   * POST /help-requests/{id}/complete
   * Marks a help request as completed with a rating category.
   * Returns the updated help request.
   */
  async complete(id: number, payload: CompleteHelpRequestPayload): Promise<HelpRequest> {
    const response = await apiClient.post<{ data: HelpRequest }>(
      `/help-requests/${id}/complete`,
      payload,
      { toast: { success: "Help request completed." } } as never,
    )
    return (response as unknown as { data: HelpRequest }).data
  }

  /**
   * DELETE /help-requests/{id}
   * Permanently removes a help request.
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/help-requests/${id}`, {
      toast: { success: "Help request deleted." },
    } as never)
  }
}

// Export a singleton instance — import this in hooks and components
export const helpRequestService = new HelpRequestService()
