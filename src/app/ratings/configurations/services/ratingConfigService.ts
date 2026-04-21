import { apiClient } from "@/services/api"
import type {
  ApiRatingConfig,
  ApiRatingConfigType,
  RatingConfigPagination,
  RatingConfigsListBody,
  CreateRatingConfigPayload,
  UpdateRatingConfigPayload,
} from "../types"

// ─── Service ──────────────────────────────────────────────────────────────────
// Thin wrapper around apiClient for all /rating-configs endpoints.
// Each method maps 1-to-1 with a backend route.

class RatingConfigService {
  /**
   * GET /rating-configs
   * List all rating configs (paginated, default 15 per page).
   * The backend returns { success, data: [...], pagination: {...}, message }
   * which includes `pagination` outside the standard ApiResponse wrapper,
   * so we cast and destructure it manually.
   */
  async getAll(): Promise<{ configs: ApiRatingConfig[]; pagination: RatingConfigPagination }> {
    // apiClient.get returns response.data (the full HTTP body) typed as ApiResponse<unknown>
    // At runtime the body shape is RatingConfigsListBody, so we cast to access both fields
    const raw = (await apiClient.get<unknown>("/rating-configs")) as unknown as RatingConfigsListBody
    return { configs: raw.data, pagination: raw.pagination }
  }

  /**
   * GET /rating-configs/{id}
   * Fetch a single rating config by its numeric ID.
   * Returns the standard ApiResponse<ApiRatingConfig> shape.
   */
  async getById(id: number): Promise<ApiRatingConfig> {
    const response = await apiClient.get<ApiRatingConfig>(`/rating-configs/${id}`)
    return response.data
  }

  /**
   * GET /rating-configs/type/{type}
   * Fetch all configs filtered by type (task_rating | stakeholder_rating).
   * Same pagination response shape as getAll().
   */
  async getByType(
    type: ApiRatingConfigType,
  ): Promise<{ configs: ApiRatingConfig[]; pagination: RatingConfigPagination }> {
    const raw = (await apiClient.get<unknown>(
      `/rating-configs/type/${type}`,
    )) as unknown as RatingConfigsListBody
    return { configs: raw.data, pagination: raw.pagination }
  }

  /**
   * GET /rating-configs/type/{type}/active
   * Fetch only the active configs of the given type.
   * Used by the task rating form to populate the config selector.
   */
  async getActiveByType(
    type: ApiRatingConfigType,
  ): Promise<{ configs: ApiRatingConfig[]; pagination: RatingConfigPagination }> {
    const raw = (await apiClient.get<unknown>(
      `/rating-configs/type/${type}/active`,
    )) as unknown as RatingConfigsListBody
    return { configs: raw.data, pagination: raw.pagination }
  }

  /**
   * DELETE /rating-configs/{id}
   * Permanently delete a rating config.
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/rating-configs/${id}`)
  }

  /**
   * POST /rating-configs
   * Create a new rating config.
   * Returns the full created ApiRatingConfig (201 response).
   */
  async create(payload: CreateRatingConfigPayload): Promise<ApiRatingConfig> {
    const response = await apiClient.post<ApiRatingConfig>("/rating-configs", payload)
    return response.data
  }

  /**
   * PUT /rating-configs/{id}
   * Update an existing rating config by ID.
   * Returns the updated ApiRatingConfig (200 response).
   */
  async update(id: number, payload: UpdateRatingConfigPayload): Promise<ApiRatingConfig> {
    const response = await apiClient.put<ApiRatingConfig>(`/rating-configs/${id}`, payload)
    return response.data
  }
}

// Export a singleton so the store and hooks share the same instance
export const ratingConfigService = new RatingConfigService()
