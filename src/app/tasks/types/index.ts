// ─── Task API Types ───────────────────────────────────────────────
// These types map directly to the backend API response for tasks.
// Fields are snake_case to match the server response exactly.

// Task status values (match the backend enum)
export type TaskStatus = "pending" | "in_progress" | "done" | "rated"

// Task priority values (match the backend enum)
export type TaskPriority = "low" | "medium" | "high" | "critical"

// A user assigned to a task; includes the pivot percentage field
export interface AssignedUser {
  id: number
  name: string
  email: string
  avatar_path: string | null
  avatar_url: string | null
  pivot?: {
    task_id: number
    user_id: number
    percentage: number
  }
}

// A subtask belonging to a task
export interface Subtask {
  id: number
  name: string
  description: string | null
  due_date: string
  priority: TaskPriority
  is_complete: boolean
  task_id: number
  created_at: string
  updated_at: string
}

// The project nested inside the section relationship
export interface TaskProject {
  id: number
  name: string
  description: string | null
  status: string
}

// The section a task belongs to (includes the project it belongs to)
export interface TaskSection {
  id: number
  name: string
  description: string | null
  project_id: number
  created_at: string
  updated_at: string
  project?: TaskProject
}

// Task object matching the GET /tasks and GET /tasks/{id} API response
export interface Task {
  id: number
  name: string
  description: string | null
  weight: number
  due_date: string
  priority: TaskPriority
  status: TaskStatus
  section_id: number
  project_id: number
  completed_at: string | null
  created_at: string
  updated_at: string
  /** Latest final rating score (0–100), null if not yet rated */
  latest_final_rating: number | null
  section: TaskSection | null
  subtasks: Subtask[]
  assigned_users: AssignedUser[]
  /** Comments on this task — may be included in GET /tasks/{id} response */
  comments?: TaskComment[]
}

// Pagination metadata returned by the list endpoint
export interface TaskPagination {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

// The full shape of GET /tasks response (data array + separate pagination object)
export interface TaskListApiResponse {
  success: boolean
  data: Task[]
  pagination: TaskPagination
  message: string
}

// Query parameters supported by GET /tasks
export interface TaskListParams {
  page?: number
  per_page?: number
  /** Filter by status; use "all" to omit filtering */
  status?: TaskStatus | "all"
  /** Filter by priority; use "all" to omit filtering */
  priority?: TaskPriority | "all"
  project_id?: number
  /** Filter by one or more assignee user IDs */
  assignees?: number[]
  /** Filter tasks due from this date (YYYY-MM-DD) */
  due_from?: string
  /** Filter tasks due up to this date (YYYY-MM-DD) */
  due_to?: string
  search?: string
}

// ─── Mutation Payloads ────────────────────────────────────────────

// Body for POST /tasks — all required fields must be provided
export interface CreateTaskPayload {
  name: string
  description?: string | null
  weight: number
  due_date: string          // YYYY-MM-DD format (RFC 3339)
  priority: TaskPriority
  section_id: number
}

// Body for PUT /tasks/{id} — all fields are optional (only sent fields are updated)
export interface UpdateTaskPayload {
  name?: string
  description?: string | null
  weight?: number
  due_date?: string          // YYYY-MM-DD format
  priority?: TaskPriority
  section_id?: number
  status?: TaskStatus        // status can only be changed via PUT, not POST
}

// ─── Assignment Payloads ──────────────────────────────────────────

// A single assignment item used in bulk-assign requests
export interface AssignmentItem {
  user_id: number
  percentage: number  // float, min 0.01, max 100
}

// Body for POST /tasks/{id}/add-user — adds one user with a percentage
export interface AddUserPayload {
  user_id: number
  percentage: number  // float, min 0.01, max 100
}

// Body for POST /tasks/{id}/assign-users — replaces all assignments at once
// Total percentage across all entries must not exceed 100
export interface AssignUsersPayload {
  assignments: AssignmentItem[]
}

// Body for POST /tasks/{id}/status — changes task status only
export interface UpdateStatusPayload {
  status: TaskStatus
}

// Body for PUT /tasks/{id}/users/{userId}/assignment — updates a single user's allocation %
// Sent as JSON; percentage must be between 0.01 and 100 (float)
export interface UpdateAssignmentPayload {
  percentage: number  // float, min 0.01, max 100
}

// ─── Comment Types ────────────────────────────────────────────────

// The author of a comment (minimal user info embedded in the comment response)
export interface CommentUser {
  id: number
  name: string
  email: string
  avatar_url: string | null
}

// A single task comment returned by POST /tasks/{id}/comments and PUT /comments/{id}
export interface TaskComment {
  id: number
  task_id: number
  user_id: number
  content: string
  created_at: string
  updated_at: string
  // User relationship — may be included in the response
  user?: CommentUser
}

// Body for POST /tasks/{taskId}/comments and PUT /comments/{commentId}
export interface CommentPayload {
  content: string  // required, max 5000 characters
}

// ─── Help Request Types ────────────────────────────────────────────
// Maps to the backend HelpRequest model returned by GET /tasks/{taskId}/help-requests

// Rating enum matching the backend HelpRequestRating enum
export type HelpRequestRatingValue =
  | "legitimate_learning"
  | "basic_skill_gap"
  | "careless_mistake"
  | "fixing_own_mistakes"

// Human-readable labels for each rating value
export const helpRequestRatingLabel: Record<HelpRequestRatingValue, string> = {
  legitimate_learning: "Legitimate Learning",
  basic_skill_gap: "Basic Skill Gap",
  careless_mistake: "Careless Mistake",
  fixing_own_mistakes: "Fixing Own Mistakes",
}

// A user embedded in a help request (requester / helper)
export interface HelpRequestUser {
  id: number
  name: string
  email: string
  avatar_url: string | null
}

// A help request returned by the API for a specific task
export interface TaskHelpRequest {
  id: number
  description: string
  task_id: number
  requester_id: number
  helper_id: number | null
  /** Rating category assigned when the request was completed */
  rating: HelpRequestRatingValue | null
  is_completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
  /** Computed by backend: true when helper_id is not null */
  is_claimed: boolean
  /** Computed by backend: true when not yet claimed and not completed */
  is_available: boolean
  requester: HelpRequestUser
  helper: HelpRequestUser | null
}

// Paginated response shape for GET /tasks/{taskId}/help-requests
export interface TaskHelpRequestListApiResponse {
  success: boolean
  data: TaskHelpRequest[]
  pagination: TaskPagination
  message: string
}

// ─── Task Rating Types ─────────────────────────────────────────────
// Maps to the backend TaskRating model returned by GET /tasks/{taskId}/ratings

// The user who submitted the rating
export interface RaterUser {
  id: number
  name: string
  email: string
  avatar_url: string | null
}

// A rating record returned by the API for a specific task
export interface TaskRatingRecord {
  id: number
  task_id: number
  rater_id: number
  /** JSON object with field names as keys and numeric scores as values */
  rating_data: Record<string, number>
  /** Weighted final score 0–100 */
  final_rating: string | number
  /** Snapshot of the rating config used at the time of rating */
  config_snapshot: Record<string, unknown> | null
  rated_at: string | null
  created_at: string
  updated_at: string
  rater: RaterUser
}

// Paginated response shape for GET /tasks/{taskId}/ratings
export interface TaskRatingListApiResponse {
  success: boolean
  data: TaskRatingRecord[]
  pagination: TaskPagination
  message: string
}

// Paginated response shape for GET /tasks/{taskId}/subtasks
export interface TaskSubtaskListApiResponse {
  success: boolean
  data: Subtask[]
  pagination: TaskPagination
  message: string
}

// ─── Subtask Mutation Payloads ────────────────────────────────────

// Body for POST /subtasks — creates a new subtask linked to a task
export interface CreateSubtaskPayload {
  name: string
  description?: string | null
  due_date: string        // YYYY-MM-DD
  priority: TaskPriority
  task_id: number         // parent task must already exist
}

// Body for PUT /subtasks/{id} — all fields optional (only sent fields are changed)
export interface UpdateSubtaskPayload {
  name?: string
  description?: string | null
  due_date?: string
  priority?: TaskPriority
  /** Explicitly set completion state (alternative to the /toggle endpoint) */
  is_complete?: boolean
  /** Reassign to a different parent task */
  task_id?: number
}

// ─── Task Rating Mutation Payloads ────────────────────────────────

// Body for POST /task-ratings — creates a new task rating
// rating_data keys are field names from the rating config; values are numeric scores
export interface CreateTaskRatingPayload {
  task_id: number               // ID of the task being rated
  rating_config_id: number      // ID of the active task_rating config to use
  rating_data: Record<string, number>  // e.g. { "Code Quality": 85, "Delivery": 90 }
}

// Body for PUT /task-ratings/{id} — updates an existing task rating
// All fields are optional; only provided fields are updated
export interface UpdateTaskRatingPayload {
  rating_config_id?: number
  rating_data?: Record<string, number>
}
