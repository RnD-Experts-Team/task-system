import { apiClient } from "@/services/api"

// ─── Request / Response Types ─────────────────────────────────────────────────

/**
 * Body sent to POST /final-ratings/calculate-weighted-ratings-sos.
 * All three fields are required by the backend.
 */
export type WeightedRatingsSOSPayload = {
  user_ids: number[]  // array of integer user IDs
  start_date: string  // "YYYY-MM-DD" (RFC 3339 full-date)
  end_date: string    // "YYYY-MM-DD" (RFC 3339 full-date)
}

/**
 * Single user entry in the SOS response array.
 * `rating` is null when the user has no rated tasks in the given date range.
 */
export type WeightedRatingsSOSUserResult = {
  user_name: string
  rating: number | null  // weighted average percentage (0–100), or null
}

// ─── Service ──────────────────────────────────────────────────────────────────

class WeightedRatingsService {
  /**
   * POST /final-ratings/calculate-weighted-ratings-sos
   *
   * Returns a raw JSON array (not wrapped in { success, data }).
   * Results are in the same order as the supplied user_ids array,
   * so callers can zip them by index with the original user list.
   */
  async calculateSOS(
    payload: WeightedRatingsSOSPayload,
  ): Promise<WeightedRatingsSOSUserResult[]> {
    // apiClient.post expects ApiResponse<T>, but this endpoint returns a plain
    // array — cast through unknown to reach the real runtime shape.
    const raw = (await apiClient.post<unknown>(
      "/final-ratings/calculate-weighted-ratings-sos",
      payload,
    )) as unknown as WeightedRatingsSOSUserResult[]

    return raw
  }
}

export const weightedRatingsService = new WeightedRatingsService()
