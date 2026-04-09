// ─── Domain Types ───────────────────────────────────────────────

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_path: string | null;
  avatar_url: string | null;
  email_verified_at: string | null;
  roles: Role[];
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

// ─── API Types ──────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedData<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// ─── API Error ──────────────────────────────────────────────────

export interface ApiValidationError {
  message: string;
  errors?: Record<string, string[]>;
}

// ─── Dashboard Types ────────────────────────────────────────────

/** Allowed period values for the analytics filter */
export type AnalyticsPeriod =
  | "today"
  | "yesterday"
  | "this_week"
  | "last_week"
  | "this_month"
  | "last_month"
  | "month_to_date";

/* ---------- Analytics (admin) ---------- */

export interface AnalyticsOverview {
  total_employees: number;
  active_projects: number;
  total_tasks: number;
  completed_tasks: number;
  pending_help_requests: number;
  open_tickets: number;
  average_task_completion_rate: number;
}

export interface ProjectStatusData {
  by_status: Record<string, number>;
  average_progress: number;
  at_risk: number;
}

export interface TaskDistribution {
  by_status: Record<string, number>;
  by_priority: Record<string, number>;
  overdue: number;
}

export interface TopHelper {
  user_id: number;
  user_name: string;
  avatar_url: string;
  help_count: number;
}

export interface HelpRequestsStats {
  total: number;
  completed: number;
  pending: number;
  average_resolution_time: number | null;
  top_helpers: TopHelper[];
}

export interface TicketsStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  by_type: Record<string, number>;
}

export interface UpcomingDeadline {
  id: number;
  name: string;
  due_date: string;
  days_until_due: number;
  priority: string;
  status: string;
  project: { id: number; name: string };
  assigned_users_count: number;
}

export interface TopPerformer {
  user_id: number;
  user_name: string;
  avatar_url: string;
  completed_tasks: number;
}

/** Full response data from GET /dashboard/analytics */
export interface AnalyticsData {
  overview: AnalyticsOverview;
  project_status: ProjectStatusData;
  task_distribution: TaskDistribution;
  help_requests_stats: HelpRequestsStats;
  tickets_stats: TicketsStats;
  upcoming_deadlines: UpcomingDeadline[];
  top_performers: TopPerformer[];
}

/* ---------- Employee ---------- */

export interface EmployeeTaskOverview {
  total: number;
  pending: number;
  in_progress: number;
  done: number;
  rated: number;
}

export interface EmployeeProjectOverview {
  total: number;
  as_stakeholder: number;
  as_contributor: number;
}

export interface EmployeeHelpOverview {
  requested: number;
  helped_others: number;
  pending: number;
}

export interface EmployeeTicketOverview {
  assigned: number;
  completed: number;
  in_progress: number;
}

export interface EmployeeOverview {
  assigned_tasks: EmployeeTaskOverview;
  projects: EmployeeProjectOverview;
  help_requests: EmployeeHelpOverview;
  tickets: EmployeeTicketOverview;
  this_week: { tasks_completed: number; helped_colleagues: number };
}

export interface UpcomingTask {
  id: number;
  name: string;
  due_date: string;
  days_until_due: number;
  priority: string;
  status: string;
  project: { id: number; name: string };
}

export interface RecentActivity {
  type: string;
  title: string;
  project: string;
  timestamp: string;
}

/** Full response data from GET /dashboard/employee */
export interface EmployeeData {
  overview: EmployeeOverview;
  upcoming_tasks: UpcomingTask[];
  recent_activity: RecentActivity[];
}
