// src/app/work-sessions/types/index.ts
// API-aligned types for the Daily Work Sessions module. Field names mirror the
// Laravel responses (snake_case). Timestamps are ISO-8601 UTC strings; work_date
// is a plain "YYYY-MM-DD" calendar day in the company timezone.

// ─── Enums ────────────────────────────────────────────────────────

export type WorkSessionStatus = "open" | "confirmed"
export type ItemOutcome = "pending" | "done" | "partial" | "not_done"
export type FinalItemOutcome = Exclude<ItemOutcome, "pending">
export type ItemPriority = "low" | "medium" | "high" | "critical"
export type WorkSessionRealtimeAction = "started" | "items_changed" | "confirmed" | "reopened"

export const STATUS_LABELS: Record<WorkSessionStatus, string> = {
  open: "Open",
  confirmed: "Confirmed",
}

export const OUTCOME_LABELS: Record<ItemOutcome, string> = {
  pending: "Pending",
  done: "Done",
  partial: "Partial",
  not_done: "Not done",
}

export const PRIORITY_LABELS: Record<ItemPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
}

export const PRIORITY_OPTIONS: ItemPriority[] = ["low", "medium", "high", "critical"]
export const FINAL_OUTCOMES: FinalItemOutcome[] = ["done", "partial", "not_done"]

// ─── Shared shapes ────────────────────────────────────────────────

/** Lightweight user embedded in session/report rows */
export interface SessionUser {
  id: number
  name: string
  email?: string
  avatar_url: string | null
}

/** Sibling pagination block returned by list endpoints */
export interface Pagination {
  current_page: number
  total: number
  per_page: number
  last_page: number
  from: number | null
  to: number | null
}

/** Minimal task shape embedded on an item (task may be null if deleted) */
export interface LinkedTask {
  id: number
  name: string
  status: string
  priority: string
}

// ─── Entities ─────────────────────────────────────────────────────

export interface WorkSessionItem {
  id: number
  work_session_id: number
  task_id: number | null
  title: string
  description: string | null
  priority: ItemPriority
  estimated_minutes: number | null
  sort_order: number
  outcome: ItemOutcome
  outcome_note: string | null
  completed_at: string | null
  carried_from_item_id: number | null
  created_at: string
  updated_at: string
  task?: LinkedTask | null
}

export interface WorkSession {
  id: number
  user_id: number
  /** "YYYY-MM-DD" in the company timezone */
  work_date: string
  status: WorkSessionStatus
  started_at: string
  confirmed_at: string | null
  reopened_at: string | null
  reopened_by: number | null
  summary_note: string | null
  created_at: string
  updated_at: string
  items?: WorkSessionItem[]
  user?: SessionUser
  reopened_by_user?: SessionUser | null
}

/** Session row with aggregate counts (list endpoints) */
export interface WorkSessionWithCounts extends WorkSession {
  items_count: number
  done_count: number
  partial_count: number
  not_done_count: number
  pending_count: number
  /** (done + 0.5 * partial) / items * 100, null when the session has no items */
  completion_pct: number | null
}

export interface CarryOverCandidate extends WorkSessionItem {
  /** work_date of the session the item comes from */
  source_work_date: string
}

/** GET /work-sessions/today */
export interface TodayPayload {
  today: string
  company_timezone: string
  session: WorkSession | null
  carry_over_candidates: CarryOverCandidate[]
  previous_open_sessions: { id: number; work_date: string }[]
}

/** GET /work-sessions/assignable-tasks */
export interface AssignableTask {
  id: number
  name: string
  priority: string
  status: string
  due_date: string | null
  project_name: string | null
}

// ─── Payloads ─────────────────────────────────────────────────────

export interface StartSessionPayload {
  carry_over_item_ids?: number[]
}

export interface CreateItemPayload {
  title: string
  description?: string | null
  priority?: ItemPriority
  estimated_minutes?: number | null
  task_id?: number | null
}

export type UpdateItemPayload = Partial<CreateItemPayload>

export interface SetOutcomePayload {
  outcome: ItemOutcome
  outcome_note?: string | null
}

export interface ConfirmSessionPayload {
  items: { id: number; outcome: FinalItemOutcome; outcome_note?: string | null }[]
  summary_note?: string | null
}

export interface SessionListParams {
  page?: number
  per_page?: number
  start_date?: string
  end_date?: string
  status?: WorkSessionStatus | "all"
  /** admin only */
  user_ids?: number[]
}

export interface SessionListApiResponse {
  success: boolean
  data: WorkSessionWithCounts[]
  pagination: Pagination
  message: string
}

// ─── Reports ──────────────────────────────────────────────────────

export interface ReportParams {
  start_date: string
  end_date: string
  user_ids?: number[]
  include_open?: boolean
}

export interface ReportCounts {
  items_total: number
  done: number
  partial: number
  not_done: number
  pending: number
  completion_pct: number | null
}

export interface ReportTotals extends ReportCounts {
  users: number
  sessions: number
  confirmed_sessions: number
  estimated_minutes_total: number
}

export interface PerUserReportRow extends ReportCounts {
  user_id: number
  user_name: string
  avatar_url: string | null
  sessions_count: number
  estimated_minutes_total: number
  last_work_date: string | null
}

export interface DailyReportRow extends ReportCounts {
  date: string
  sessions_count: number
}

export interface OverviewReport {
  period: { start_date: string; end_date: string; include_open: boolean }
  totals: ReportTotals
  per_user: PerUserReportRow[]
  daily: DailyReportRow[]
}

export type ByTaskGroupBy = "task" | "title"

export interface ByTaskReportParams extends ReportParams {
  group_by?: ByTaskGroupBy
}

export interface ByTaskRow {
  task_id: number | null
  task_name: string | null
  project_name: string | null
  /** normalized title when group_by = "title" */
  title: string | null
  occurrences: number
  sessions_count: number
  users: { user_id: number; user_name: string }[]
  done: number
  partial: number
  not_done: number
  pending: number
  completion_pct: number | null
  estimated_minutes_total: number
  first_date: string | null
  last_date: string | null
  carried_over_count: number
}

export interface ByTaskReport {
  group_by: ByTaskGroupBy
  rows: ByTaskRow[]
}

export interface ExportMonthlyPdfPayload {
  user_ids: number[]
  year: number
  month: number
}

// ─── Monthly ratings ──────────────────────────────────────────────

export interface YearMonth {
  year: number
  month: number
}

export interface UserMonthlyRating {
  id: number
  user_id: number
  year: number
  month: number
  /** decimal(5,2) serialized as a string by Laravel, e.g. "87.50" */
  score: string | number
  comment: string | null
  rated_by: number | null
  created_at: string
  updated_at: string
}

export interface MonthlyStats {
  sessions_count: number
  items_total: number
  done: number
  partial: number
  not_done: number
  completion_pct: number | null
}

/** One row per user from GET /work-sessions/admin/ratings */
export interface MonthlyRatingRow {
  user: SessionUser
  rating: UserMonthlyRating | null
  stats: MonthlyStats
}

export interface UpsertRatingPayload {
  score: number
  comment?: string | null
}

export interface RatingAveragePayload {
  user_ids: number[]
  from: YearMonth
  to: YearMonth
}

export interface PerUserAverage {
  user_id: number
  user_name: string
  avatar_url: string | null
  months_rated: number
  /** null when the user has no rating in the range */
  average_score: number | null
  ratings: { year: number; month: number; score: number }[]
}

export interface RatingAverageResponse {
  range: { from: string; to: string; months_in_range: number }
  per_user: PerUserAverage[]
  /** mean of non-null per-user averages */
  overall_average: number | null
  users_with_ratings: number
}

// ─── Realtime ─────────────────────────────────────────────────────

/** Payload of the "WorkSessionUpdated" event on channel "work-sessions.admin" */
export interface WorkSessionUpdatedPayload {
  action: WorkSessionRealtimeAction
  session_id: number
  user_id: number
  user_name: string
  avatar_url: string | null
  work_date: string
  status: WorkSessionStatus
  confirmed_at: string | null
  counts: { items: number; done: number; partial: number; not_done: number; pending: number }
  completion_pct: number | null
  server_time_utc: string
}
