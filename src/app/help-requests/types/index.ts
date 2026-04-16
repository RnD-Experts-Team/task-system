// ─── Help Request API Types ───────────────────────────────────────────────────
// These types map directly to the backend API responses for the help-requests
// endpoints: GET /help-requests, GET /help-requests/available, GET /help-requests/{id}

// ── Rating enum ──────────────────────────────────────────────────────────────
// Matches the backend HelpRequestRating enum (penalty categories).
// null means the request has not been completed/rated yet.
export type HelpRequestRatingValue =
  | "legitimate_learning"
  | "basic_skill_gap"
  | "careless_mistake"
  | "fixing_own_mistakes"

// Human-readable labels for each rating value shown in the UI
export const helpRequestRatingLabel: Record<HelpRequestRatingValue, string> = {
  legitimate_learning: "Legitimate Learning",
  basic_skill_gap: "Basic Skill Gap",
  careless_mistake: "Careless Mistake",
  fixing_own_mistakes: "Fixing Own Mistakes",
}

// ── Nested user shape ────────────────────────────────────────────────────────
// Returned as `requester` and `helper` inside each help request
export interface HelpRequestUser {
  id: number
  name: string
  email: string
  avatar_url: string | null
  avatar_path?: string | null
}

// ── Nested task section (for available requests that eager-load section.project) ──
export interface HelpRequestTaskSection {
  id: number
  name: string
  project?: {
    id: number
    name: string
  }
}

// ── Nested task shape ────────────────────────────────────────────────────────
// The task that the help request belongs to
export interface HelpRequestTask {
  id: number
  name: string
  section?: HelpRequestTaskSection | null
}

// ── Main help request object ─────────────────────────────────────────────────
// Maps to the backend HelpRequest model with its computed attributes appended.
export interface HelpRequest {
  id: number
  description: string
  task_id: number
  requester_id: number
  helper_id: number | null
  /** Rating category set when the request was completed; null until then */
  rating: HelpRequestRatingValue | null
  is_completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
  /** Computed by backend: true when helper_id is not null */
  is_claimed: boolean
  /** Computed by backend: true when not yet claimed and not yet completed */
  is_available: boolean
  /** Task this help request belongs to (may include section.project) */
  task: HelpRequestTask | null
  requester: HelpRequestUser
  helper: HelpRequestUser | null
}

// ── Pagination metadata ──────────────────────────────────────────────────────
// Returned alongside all paginated list responses
export interface HelpRequestPagination {
  current_page: number
  total: number
  per_page: number
  last_page: number
  from: number | null
  to: number | null
}

// ── API response shapes ──────────────────────────────────────────────────────

// Response for GET /help-requests and GET /help-requests/available
export interface HelpRequestListApiResponse {
  success: boolean
  data: HelpRequest[]
  pagination: HelpRequestPagination
  message: string
}

// Response for GET /help-requests/{id}
export interface HelpRequestSingleApiResponse {
  success: boolean
  data: HelpRequest
  message: string
}

// ── Mutation payloads ────────────────────────────────────────────────────────

/** Body sent to POST /help-requests to create a new help request */
export interface CreateHelpRequestPayload {
  description: string
  task_id: number
  helper_id?: number | null
}

/** Body sent to PUT /help-requests/{id} to update an existing help request */
export interface UpdateHelpRequestPayload {
  description?: string
  helper_id?: number | null
}

/** Body sent to POST /help-requests/{id}/complete */
export interface CompleteHelpRequestPayload {
  rating: HelpRequestRatingValue
}

// ── List query params ────────────────────────────────────────────────────────
// Supported query parameters for GET /help-requests and GET /help-requests/available
export interface HelpRequestListParams {
  page?: number
  per_page?: number
  search?: string
}

// ── Derived status helper ────────────────────────────────────────────────────
// The API does not return a single `status` string — instead it exposes
// `is_completed` and `is_claimed` booleans.  This helper maps them to a
// display-friendly string for the UI.
export type HelpRequestDisplayStatus = "open" | "claimed" | "completed"

export function getDisplayStatus(request: HelpRequest): HelpRequestDisplayStatus {
  if (request.is_completed) return "completed"
  if (request.is_claimed) return "claimed"
  return "open"
}
