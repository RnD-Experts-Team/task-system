// ─── API Types for Final Rating Configurations ───────────────────────────────
// These types mirror the backend FinalRatingConfig model and controller responses.

// ── Nested config sub-types ───────────────────────────────────────────────────

/** Settings for the task_ratings component */
export type FinalRatingTaskRatings = {
  enabled: boolean
  include_task_weight?: boolean
  include_user_percentage?: boolean
  aggregation?: string // "sum" | "average"
}

/** Settings for the stakeholder_ratings component */
export type FinalRatingStakeholderRatings = {
  enabled: boolean
  include_project_percentage?: boolean
  include_task_weight?: boolean
  aggregation?: string
}

/** Settings for the help_requests_helper component */
export type FinalRatingHelpHelper = {
  enabled: boolean
  points_per_help?: number
  max_points?: number
}

/** Penalty values for help_requests_requester */
export type FinalRatingRequesterPenalties = {
  basic_skill_gap?: number
  fixing_own_mistakes?: number
  clarification?: number
  other?: number
}

/** Settings for the help_requests_requester component */
export type FinalRatingHelpRequester = {
  enabled: boolean
  penalties?: FinalRatingRequesterPenalties
}

/** Settings for the tickets_resolved component */
export type FinalRatingTickets = {
  enabled: boolean
  points_per_ticket?: number
  max_points?: number
}

/**
 * The nested `config` object stored in the database.
 * Each key maps to one rating component and its settings.
 */
export type FinalRatingConfigData = {
  task_ratings?: FinalRatingTaskRatings
  stakeholder_ratings?: FinalRatingStakeholderRatings
  help_requests_helper?: FinalRatingHelpHelper
  help_requests_requester?: FinalRatingHelpRequester
  tickets_resolved?: FinalRatingTickets
}

/**
 * Full FinalRatingConfig object returned from the API.
 * Corresponds to the backend FinalRatingConfig model.
 */
export type ApiFinalRatingConfig = {
  id: number
  name: string
  description: string | null
  is_active: boolean
  config: FinalRatingConfigData
  created_at: string
  updated_at: string
}

// ─── Payload Types for Mutations ─────────────────────────────────────────────

/**
 * Body sent to POST /final-ratings/configs.
 * `config` holds the component settings, `name` is required.
 */
export type CreateFinalRatingConfigPayload = {
  name: string
  description?: string | null
  config: FinalRatingConfigData
  is_active?: boolean
}

/**
 * Body sent to PUT /final-ratings/configs/{id}.
 * All fields are optional (partial update).
 */
export type UpdateFinalRatingConfigPayload = {
  name?: string
  description?: string | null
  config?: FinalRatingConfigData
  is_active?: boolean
}

/**
 * Raw HTTP body returned by GET /final-ratings/configs (array, no pagination).
 * The backend returns { success, data: [...] }
 */
export type FinalRatingConfigsListBody = {
  success: boolean
  data: ApiFinalRatingConfig[]
  message?: string
}

/**
 * Default config structure returned by GET /final-ratings/configs/default-structure.
 * Returns { success, data: FinalRatingConfigData }
 */
export type FinalRatingDefaultStructureBody = {
  success: boolean
  data: FinalRatingConfigData
}

// ─── Calculate & Export Types ─────────────────────────────────────────────────

/**
 * Body sent to POST /final-ratings/calculate and POST /final-ratings/export-pdf.
 * All three are required; config_id is optional (uses active config if omitted).
 */
export type CalculateFinalRatingsPayload = {
  period_start: string   // "YYYY-MM-DD"
  period_end: string     // "YYYY-MM-DD"
  max_points: number     // float, min 1
  config_id?: number | null
}

export type FinalRatingsExportFormat = "pdf" | "zip"

/**
 * One user's score breakdown returned inside the calculate response.
 * Mirrors the array built by FinalRatingCalculator::calculate().
 */
export type FinalRatingUserResult = {
  user_id: number
  user_name: string
  user_email: string
  avatar_url: string | null
  total_points: number
  max_points: number
  final_percentage: number
  breakdown: {
    task_ratings: { value: number; [key: string]: unknown }
    stakeholder_ratings: { value: number; [key: string]: unknown }
    help_requests: {
      helper: { value: number; [key: string]: unknown }
      requester: { value: number; [key: string]: unknown }
    }
    tickets_resolved: { value: number; [key: string]: unknown }
  }
}

/**
 * Full body returned by POST /final-ratings/calculate (200).
 * data.users is the ranked list of employee results.
 */
export type FinalRatingsCalculateResult = {
  period: { start: string; end: string }
  config: { id: number; name: string }
  max_points_for_100_percent: number
  calculated_at: string
  users: FinalRatingUserResult[]
}
