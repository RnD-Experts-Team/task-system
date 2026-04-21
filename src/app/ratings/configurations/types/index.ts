// ─── API Types for Rating Configurations ────────────────────────────────────
// These types mirror the backend Laravel model / controller responses

/** A single scoring field inside a rating config's config_data */
export type ApiRatingConfigField = {
  id: number
  name: string
  description?: string
  max_value: number // backend uses snake_case
}

/** The two config types supported by the backend enum RatingConfigType */
export type ApiRatingConfigType = "task_rating" | "stakeholder_rating"

/** The creator (User) embedded inside a rating config response */
export type ApiRatingConfigCreator = {
  id: number
  name: string
  email: string
  avatar_url: string | null
  avatar_path: string | null
}

/**
 * Full rating config object returned from the API.
 * Key differences from the legacy local type:
 *  - type uses snake_case: "task_rating" | "stakeholder_rating"
 *  - status is `is_active: boolean` (not "ACTIVE" | "INACTIVE")
 *  - fields live inside `config_data.fields`
 *  - dates are ISO strings named `created_at` / `updated_at`
 *  - id is a number (not a string)
 */
export type ApiRatingConfig = {
  id: number
  name: string
  description: string | null
  type: ApiRatingConfigType
  config_data: {
    fields?: ApiRatingConfigField[]
    expression?: string
    variables?: Record<string, unknown>[]
  }
  is_active: boolean
  created_by: number
  creator: ApiRatingConfigCreator
  created_at: string
  updated_at: string
}

/** Pagination metadata returned alongside paginated list endpoints */
export type RatingConfigPagination = {
  current_page: number
  total: number
  per_page: number
  last_page: number
  from: number | null
  to: number | null
}

/**
 * Raw HTTP body shape returned by paginated list endpoints.
 * The backend returns { success, data: [...], pagination: {...}, message }
 * which differs from the standard ApiResponse<T> shape (no pagination).
 */
export type RatingConfigsListBody = {
  success: boolean
  data: ApiRatingConfig[]
  pagination: RatingConfigPagination
  message: string
}

// ─── Payload Types for Mutations ─────────────────────────────────────────────

/**
 * A single scoring field sent inside config_data when creating/updating.
 * `max_value` mirrors the backend snake_case field name.
 */
export type RatingConfigFieldPayload = {
  name: string
  description?: string | null
  max_value: number
}

/**
 * POST /rating-configs — request body.
 * All fields are sent at the top level (not nested under config_data).
 * `config_data` holds the array of scoring fields.
 */
export type CreateRatingConfigPayload = {
  name: string
  type: ApiRatingConfigType
  description?: string | null
  is_active?: boolean
  config_data: {
    fields: RatingConfigFieldPayload[]
  }
}

/**
 * PUT /rating-configs/{id} — request body.
 * All fields are optional (partial update).
 */
export type UpdateRatingConfigPayload = {
  name?: string
  type?: ApiRatingConfigType
  description?: string | null
  is_active?: boolean
  config_data?: {
    fields: RatingConfigFieldPayload[]
  }
}
