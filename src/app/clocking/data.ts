// ─── API Response Types (match backend ClockingService responses) ─────

/** Status values the backend uses for a clock session */
export type ClockSessionStatus = "active" | "on_break" | "completed"

/** Status values the backend uses for a break record */
export type BreakRecordStatus = "active" | "completed"

/** A single break record from the API */
export interface BreakRecord {
  id: number
  clock_session_id: number
  break_start_utc: string // ISO 8601
  break_end_utc: string | null // ISO 8601 or null if still active
  description: string | null
  status: BreakRecordStatus
  created_at: string
  updated_at: string
}

/** The user object nested inside a session */
export interface SessionUser {
  id: number
  name: string
  email: string
  avatar_url: string | null
}

/** A clock session from the API */
export interface ClockSession {
  id: number
  user_id: number
  clock_in_utc: string // ISO 8601
  clock_out_utc: string | null // ISO 8601 or null if active
  session_date: string // YYYY-MM-DD
  status: ClockSessionStatus
  crosses_midnight: boolean
  break_records: BreakRecord[]
  user: SessionUser
  created_at: string
  updated_at: string
}

/** Shape returned by every clocking endpoint (initial-data, clock-in, etc.) */
export interface ClockingSessionResponse {
  session: ClockSession | null
  company_timezone: string
  server_time_utc: string // ISO 8601
}

// ─── UI Types ────────────────────────────────────────────────────

export type ClockingStatus = "working" | "on-break" | "clocked-out"

export type ClockingRecordStatus = "verified" | "discrepancy" | "pending"

export type CorrectionType = "CLOCK_IN" | "CLOCK_OUT"

export type CorrectionRequestStatus = "pending" | "approved" | "rejected"

export interface Employee {
  id: string
  name: string
  role: string
  avatar: string
  status: ClockingStatus
  clockInTime: string
  workTime: string
  breakTime: string
  breaksUsed: number
  breaksAllowed: number
  starred?: boolean
}

export interface ClockingRecord {
  id: string
  date: string
  dayOfWeek: string
  clockIn: string
  clockOut: string
  workTime: string
  breakTime: string
  breaks: number
  status: ClockingRecordStatus
}

export interface SessionEvent {
  type: "clock-in" | "break" | "clock-out"
  label: string
  detail: string
  duration?: string
}

export interface ActivityEvent {
  time: string
  message: string
  highlight: string
  detail?: string
  color: "primary" | "secondary"
}

export interface CorrectionRequest {
  id: string
  refId: string
  avatar?: string
  initial: string
  name: string
  email: string
  type: CorrectionType
  originalTime: string
  requestedDate: string
  requestedTime: string
  reason: string
  status: CorrectionRequestStatus
}

// ─── API Types for Records Endpoint ─────────────────────────────

/**
 * A single record item returned by GET /clocking/records.
 * Alias of ClockSession — backend returns the model directly.
 */
export type ClockRecordApiItem = ClockSession

/** Pagination metadata returned alongside GET /clocking/records */
export interface ClockRecordsPagination {
  current_page: number
  total: number
  per_page: number
  last_page: number
  from: number | null
  to: number | null
}

/**
 * Correction type values accepted by POST /clocking/correction-request.
 * clock_in / clock_out refer to the session start/end.
 * break_in / break_out refer to a specific break record start/end.
 */
export type ApiCorrectionType = "clock_in" | "clock_out" | "break_in" | "break_out"

/** Payload shape for POST /clocking/correction-request */
export interface CorrectionRequestPayload {
  correction_type: ApiCorrectionType
  reason: string
  /** UTC timestamp — must match ^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$ */
  requested_time_utc: string
  break_record_id?: number | null
  clock_session_id?: number | null
}

/**
 * A correction request returned by:
 *   - POST /clocking/correction-request (201 response)
 *   - GET  /clocking/pending-corrections (array items)
 */
export interface PendingCorrectionApiItem {
  id: number
  user_id: number
  clock_session_id: number | null
  break_record_id: number | null
  correction_type: ApiCorrectionType
  original_time_utc: string
  requested_time_utc: string
  reason: string
  /** pending → awaiting manager review; approved/rejected → handled */
  status: "pending" | "approved" | "rejected"
  admin_notes: string | null
  approved_by: number | null
  approved_at: string | null
  clock_session: ClockSession | null
  break_record: BreakRecord | null
  created_at: string
  updated_at: string
}

// ─── Mock Data ──────────────────────────────────────────────────

export const employees: Employee[] = [
  {
    id: "1",
    name: "Alexei Vanchuk",
    role: "Lead Developer",
    avatar: "/avatars/alexei.jpg",
    status: "working",
    clockInTime: "08:45 AM",
    workTime: "6h 12m",
    breakTime: "45m",
    breaksUsed: 2,
    breaksAllowed: 3,
  },
  {
    id: "2",
    name: "Elena Rodriguez",
    role: "Senior Designer",
    avatar: "/avatars/elena.jpg",
    status: "on-break",
    clockInTime: "09:12 AM",
    workTime: "5h 38m",
    breakTime: "12m",
    breaksUsed: 1,
    breaksAllowed: 3,
  },
  {
    id: "3",
    name: "Marcus Thorne",
    role: "Project Manager",
    avatar: "/avatars/marcus.jpg",
    status: "working",
    clockInTime: "08:30 AM",
    workTime: "6h 54m",
    breakTime: "30m",
    breaksUsed: 3,
    breaksAllowed: 3,
  },
  {
    id: "4",
    name: "Sarah Jenkins",
    role: "HR Director",
    avatar: "/avatars/sarah.jpg",
    status: "working",
    clockInTime: "10:15 AM",
    workTime: "4h 22m",
    breakTime: "0m",
    breaksUsed: 0,
    breaksAllowed: 2,
    starred: true,
  },
  {
    id: "5",
    name: "David Chen",
    role: "Technical Support",
    avatar: "/avatars/david.jpg",
    status: "working",
    clockInTime: "07:55 AM",
    workTime: "7h 48m",
    breakTime: "50m",
    breaksUsed: 2,
    breaksAllowed: 2,
  },
  {
    id: "6",
    name: "Isabel Wu",
    role: "Legal Counsel",
    avatar: "/avatars/isabel.jpg",
    status: "on-break",
    clockInTime: "08:20 AM",
    workTime: "7h 12m",
    breakTime: "25m",
    breaksUsed: 2,
    breaksAllowed: 2,
  },
  {
    id: "7",
    name: "Liam O'Connell",
    role: "System Architect",
    avatar: "/avatars/liam.jpg",
    status: "working",
    clockInTime: "11:30 AM",
    workTime: "3h 05m",
    breakTime: "0m",
    breaksUsed: 0,
    breaksAllowed: 2,
    starred: true,
  },
  {
    id: "8",
    name: "Yuna Kim",
    role: "Operations Manager",
    avatar: "/avatars/yuna.jpg",
    status: "working",
    clockInTime: "09:00 AM",
    workTime: "5h 32m",
    breakTime: "20m",
    breaksUsed: 1,
    breaksAllowed: 2,
  },
]

export const clockingRecords: ClockingRecord[] = [
  {
    id: "1",
    date: "Oct 24, 2023",
    dayOfWeek: "Tuesday",
    clockIn: "08:54 AM",
    clockOut: "05:32 PM",
    workTime: "8h 38m",
    breakTime: "45m",
    breaks: 1,
    status: "verified",
  },
  {
    id: "2",
    date: "Oct 23, 2023",
    dayOfWeek: "Monday",
    clockIn: "09:02 AM",
    clockOut: "06:15 PM",
    workTime: "9h 13m",
    breakTime: "1h 05m",
    breaks: 2,
    status: "verified",
  },
  {
    id: "3",
    date: "Oct 20, 2023",
    dayOfWeek: "Friday",
    clockIn: "08:45 AM",
    clockOut: "04:30 PM",
    workTime: "7h 45m",
    breakTime: "30m",
    breaks: 1,
    status: "discrepancy",
  },
  {
    id: "4",
    date: "Oct 19, 2023",
    dayOfWeek: "Thursday",
    clockIn: "09:00 AM",
    clockOut: "05:00 PM",
    workTime: "8h 00m",
    breakTime: "1h 00m",
    breaks: 1,
    status: "verified",
  },
  {
    id: "5",
    date: "Oct 18, 2023",
    dayOfWeek: "Wednesday",
    clockIn: "08:30 AM",
    clockOut: "05:45 PM",
    workTime: "9h 15m",
    breakTime: "50m",
    breaks: 2,
    status: "verified",
  },
  {
    id: "6",
    date: "Oct 17, 2023",
    dayOfWeek: "Tuesday",
    clockIn: "09:15 AM",
    clockOut: "06:00 PM",
    workTime: "8h 45m",
    breakTime: "40m",
    breaks: 1,
    status: "pending",
  },
  {
    id: "7",
    date: "Oct 16, 2023",
    dayOfWeek: "Monday",
    clockIn: "08:50 AM",
    clockOut: "05:20 PM",
    workTime: "8h 30m",
    breakTime: "35m",
    breaks: 1,
    status: "verified",
  },
  {
    id: "8",
    date: "Oct 13, 2023",
    dayOfWeek: "Friday",
    clockIn: "09:10 AM",
    clockOut: "04:45 PM",
    workTime: "7h 35m",
    breakTime: "25m",
    breaks: 1,
    status: "verified",
  },
  {
    id: "9",
    date: "Oct 12, 2023",
    dayOfWeek: "Thursday",
    clockIn: "08:40 AM",
    clockOut: "05:50 PM",
    workTime: "9h 10m",
    breakTime: "55m",
    breaks: 2,
    status: "discrepancy",
  },
  {
    id: "10",
    date: "Oct 11, 2023",
    dayOfWeek: "Wednesday",
    clockIn: "09:05 AM",
    clockOut: "05:30 PM",
    workTime: "8h 25m",
    breakTime: "45m",
    breaks: 1,
    status: "verified",
  },
]

export const activityEvents: ActivityEvent[] = [
  {
    time: "14:32 PM",
    message: "Alexei Vanchuk",
    highlight: "returned from lunch break.",
    detail: "Duration: 45 minutes",
    color: "primary",
  },
  {
    time: "14:28 PM",
    message: "Elena Rodriguez",
    highlight: 'started break: "Coffee & Refresh".',
    color: "secondary",
  },
  {
    time: "14:15 PM",
    message: "New Active Session",
    highlight: "initiated by Sarah Jenkins.",
    color: "primary",
  },
]

export const correctionRequests: CorrectionRequest[] = [
  {
    id: "1",
    refId: "CHR-992-XC",
    initial: "K",
    name: "Kami",
    email: "kami@pneunited.com",
    type: "CLOCK_OUT",
    originalTime: "04/03/2026, 11:14:30 PM",
    requestedDate: "2026-03-04",
    requestedTime: "23:14",
    reason: "System froze during clock-out attempt. I was actually done by 11:00 PM but the application took an extra 14 minutes to register.",
    status: "pending",
  },
  {
    id: "2",
    refId: "CHR-993-AB",
    initial: "A",
    name: "Alexei Vanchuk",
    email: "alexei@pneunited.com",
    type: "CLOCK_IN",
    originalTime: "04/02/2026, 09:15:00 AM",
    requestedDate: "2026-04-02",
    requestedTime: "08:45",
    reason: "I arrived at 8:45 AM but forgot to clock in until 9:15 AM. Was in a morning standup meeting.",
    status: "pending",
  },
  {
    id: "3",
    refId: "CHR-994-CD",
    initial: "E",
    name: "Elena Rodriguez",
    email: "elena@pneunited.com",
    type: "CLOCK_OUT",
    originalTime: "04/01/2026, 05:30:00 PM",
    requestedDate: "2026-04-01",
    requestedTime: "18:00",
    reason: "Left office at 6 PM but clocked out early by accident while packing up.",
    status: "pending",
  },
]
