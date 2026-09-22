// src/app/work-sessions/services/workSessionService.ts
// Wraps every /work-sessions endpoint. One method per backend route.
// Mutations pass a { toast: { success } } config so the axios interceptor
// shows a success toast; errors are toasted automatically by the interceptor.

import { apiClient } from "@/services/api"
import type {
  AssignableTask,
  ByTaskReport,
  ByTaskReportParams,
  ConfirmSessionPayload,
  CreateItemPayload,
  ExportMonthlyPdfPayload,
  MonthlyRatingRow,
  OverviewReport,
  RatingAveragePayload,
  RatingAverageResponse,
  ReportParams,
  SessionListApiResponse,
  SessionListParams,
  SessionUser,
  SetOutcomePayload,
  StartSessionPayload,
  TodayPayload,
  UpdateItemPayload,
  UpsertRatingPayload,
  UserMonthlyRating,
  WorkSession,
  WorkSessionItem,
} from "../types"

const BASE = "/work-sessions"
const ADMIN = `${BASE}/admin`

// Strip "all"/undefined/empty values and map arrays to Laravel's "key[]" form
function buildParams(params: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === "all") continue
    if (Array.isArray(value)) {
      if (value.length > 0) out[`${key}[]`] = value
      continue
    }
    if (typeof value === "boolean") {
      out[key] = value ? 1 : 0
      continue
    }
    out[key] = value
  }
  return out
}

class WorkSessionService {
  // ─── Employee: session lifecycle ──────────────────────────────────

  // GET /work-sessions/today — today's session (or null) + carry-over candidates
  async getToday(): Promise<TodayPayload> {
    const response = await apiClient.get<TodayPayload>(`${BASE}/today`)
    return response.data
  }

  // POST /work-sessions — start today's session, optionally carrying items over
  async start(payload: StartSessionPayload = {}): Promise<WorkSession> {
    const response = await apiClient.post<WorkSession>(BASE, payload, {
      toast: { success: "Your day has started" },
    } as never)
    return response.data
  }

  // GET /work-sessions — my sessions (paginated, sibling "pagination" block)
  async listMine(params: SessionListParams = {}): Promise<SessionListApiResponse> {
    const raw = (await apiClient.get<unknown>(BASE, {
      params: buildParams(params as Record<string, unknown>),
    })) as unknown as SessionListApiResponse
    return raw
  }

  // GET /work-sessions/{id} — one of my sessions with items
  async getMine(id: number): Promise<WorkSession> {
    const response = await apiClient.get<WorkSession>(`${BASE}/${id}`)
    return response.data
  }

  // PUT /work-sessions/{id} — update the end-of-day summary note (silent, debounced)
  async updateSummary(id: number, summary_note: string | null): Promise<WorkSession> {
    const response = await apiClient.put<WorkSession>(`${BASE}/${id}`, { summary_note })
    return response.data
  }

  // POST /work-sessions/{id}/confirm — lock the day with every item's outcome
  async confirm(id: number, payload: ConfirmSessionPayload): Promise<WorkSession> {
    const response = await apiClient.post<WorkSession>(`${BASE}/${id}/confirm`, payload, {
      toast: { success: "Day confirmed" },
    } as never)
    return response.data
  }

  // GET /work-sessions/assignable-tasks — my open project tasks for the optional link
  async getAssignableTasks(search?: string): Promise<AssignableTask[]> {
    const response = await apiClient.get<AssignableTask[]>(`${BASE}/assignable-tasks`, {
      params: buildParams({ search }),
    })
    return response.data
  }

  // ─── Employee: items ──────────────────────────────────────────────

  // POST /work-sessions/{id}/items
  async addItem(sessionId: number, payload: CreateItemPayload): Promise<WorkSessionItem> {
    const response = await apiClient.post<WorkSessionItem>(`${BASE}/${sessionId}/items`, payload, {
      toast: { success: "Item added" },
    } as never)
    return response.data
  }

  // PUT /work-sessions/{id}/items/{item}
  async updateItem(sessionId: number, itemId: number, payload: UpdateItemPayload): Promise<WorkSessionItem> {
    const response = await apiClient.put<WorkSessionItem>(`${BASE}/${sessionId}/items/${itemId}`, payload, {
      toast: { success: "Item updated" },
    } as never)
    return response.data
  }

  // DELETE /work-sessions/{id}/items/{item}
  async deleteItem(sessionId: number, itemId: number): Promise<void> {
    await apiClient.delete(`${BASE}/${sessionId}/items/${itemId}`, {
      toast: { success: "Item removed" },
    } as never)
  }

  // PUT /work-sessions/{id}/items/reorder — body { item_ids: number[] } (silent)
  async reorderItems(sessionId: number, itemIds: number[]): Promise<WorkSessionItem[]> {
    const response = await apiClient.put<WorkSessionItem[]>(`${BASE}/${sessionId}/items/reorder`, {
      item_ids: itemIds,
    })
    return response.data
  }

  // PUT /work-sessions/{id}/items/{item}/outcome (silent quick-toggle)
  async setOutcome(sessionId: number, itemId: number, payload: SetOutcomePayload): Promise<WorkSessionItem> {
    const response = await apiClient.put<WorkSessionItem>(
      `${BASE}/${sessionId}/items/${itemId}/outcome`,
      payload
    )
    return response.data
  }

  // ─── Admin: sessions ──────────────────────────────────────────────

  // GET /work-sessions/admin/users — all users (id, name, email, avatar_url) for pickers
  async adminUsers(): Promise<SessionUser[]> {
    const response = await apiClient.get<SessionUser[]>(`${ADMIN}/users`)
    return response.data
  }

  // GET /work-sessions/admin/sessions — sessions across users (paginated)
  async adminList(params: SessionListParams = {}): Promise<SessionListApiResponse> {
    const raw = (await apiClient.get<unknown>(`${ADMIN}/sessions`, {
      params: buildParams(params as Record<string, unknown>),
    })) as unknown as SessionListApiResponse
    return raw
  }

  // GET /work-sessions/admin/sessions/{id}
  async adminGet(id: number): Promise<WorkSession> {
    const response = await apiClient.get<WorkSession>(`${ADMIN}/sessions/${id}`)
    return response.data
  }

  // POST /work-sessions/admin/sessions/{id}/reopen — unlock a confirmed session
  async adminReopen(id: number): Promise<WorkSession> {
    const response = await apiClient.post<WorkSession>(`${ADMIN}/sessions/${id}/reopen`, {}, {
      toast: { success: "Session reopened" },
    } as never)
    return response.data
  }

  // ─── Admin: reports ───────────────────────────────────────────────

  // GET /work-sessions/admin/reports/overview
  async overview(params: ReportParams): Promise<OverviewReport> {
    const response = await apiClient.get<OverviewReport>(`${ADMIN}/reports/overview`, {
      params: buildParams(params as unknown as Record<string, unknown>),
    })
    return response.data
  }

  // GET /work-sessions/admin/reports/by-task
  async byTask(params: ByTaskReportParams): Promise<ByTaskReport> {
    const response = await apiClient.get<ByTaskReport>(`${ADMIN}/reports/by-task`, {
      params: buildParams(params as unknown as Record<string, unknown>),
    })
    return response.data
  }

  // POST /work-sessions/admin/reports/export-pdf — downloads a zip of PDFs
  async exportMonthlyPdf(payload: ExportMonthlyPdfPayload): Promise<void> {
    await apiClient.downloadFilePost(`${ADMIN}/reports/export-pdf`, payload)
  }

  // ─── Admin: monthly ratings ───────────────────────────────────────

  // GET /work-sessions/admin/ratings?year&month — every user with rating + stats
  async listRatings(year: number, month: number): Promise<MonthlyRatingRow[]> {
    const response = await apiClient.get<MonthlyRatingRow[]>(`${ADMIN}/ratings`, {
      params: { year, month },
    })
    return response.data
  }

  // PUT /work-sessions/admin/ratings/{user}/{year}/{month} — create or update
  async upsertRating(
    userId: number,
    year: number,
    month: number,
    payload: UpsertRatingPayload
  ): Promise<UserMonthlyRating> {
    const response = await apiClient.put<UserMonthlyRating>(
      `${ADMIN}/ratings/${userId}/${year}/${month}`,
      payload,
      { toast: { success: "Rating saved" } } as never
    )
    return response.data
  }

  // DELETE /work-sessions/admin/ratings/{user}/{year}/{month}
  async deleteRating(userId: number, year: number, month: number): Promise<void> {
    await apiClient.delete(`${ADMIN}/ratings/${userId}/${year}/${month}`, {
      toast: { success: "Rating cleared" },
    } as never)
  }

  // POST /work-sessions/admin/ratings/average — per-user + overall average over a month range
  async ratingAverage(payload: RatingAveragePayload): Promise<RatingAverageResponse> {
    const response = await apiClient.post<RatingAverageResponse>(`${ADMIN}/ratings/average`, payload)
    return response.data
  }
}

// Singleton used across the module
export const workSessionService = new WorkSessionService()
