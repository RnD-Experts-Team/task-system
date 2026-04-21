// src/services/clockingService.ts
// Service for all clocking API calls (clock in/out, breaks, initial data, records, export, corrections)

import { apiClient } from "./api"
import type {
  ClockingSessionResponse,
  ClockRecordApiItem,
  ClockRecordsPagination,
  PendingCorrectionApiItem,
  CorrectionRequestPayload,
} from "@/app/clocking/data"
import type { ApiResponse } from "@/types"

/**
 * Clocking service — talks to /clocking/* endpoints.
 * Every method returns the unwrapped `data` from ApiResponse<ClockingSessionResponse>.
 */
export const clockingService = {
  // ── GET /clocking/initial-data ─────────────────────────────────
  // Fetches the user's active session (if any), timezone & server time
  async getInitialData(): Promise<ClockingSessionResponse> {
    const res: ApiResponse<ClockingSessionResponse> = await apiClient.get(
      "/clocking/initial-data"
    )
    return res.data
  },

  // ── POST /clocking/clock-in ────────────────────────────────────
  // Starts a new clocking session for the authenticated user
  async clockIn(): Promise<ClockingSessionResponse> {
    const res: ApiResponse<ClockingSessionResponse> = await apiClient.post(
      "/clocking/clock-in",
      undefined,
      { toast: { success: "Clocked in successfully" } } as any
    )
    return res.data
  },

  // ── POST /clocking/clock-out ───────────────────────────────────
  // Ends the active session (auto-ends any active break)
  async clockOut(): Promise<ClockingSessionResponse> {
    const res: ApiResponse<ClockingSessionResponse> = await apiClient.post(
      "/clocking/clock-out",
      undefined,
      { toast: { success: "Clocked out successfully" } } as any
    )
    return res.data
  },

  // ── POST /clocking/break/start ─────────────────────────────────
  // Starts a break within the active session
  async startBreak(): Promise<ClockingSessionResponse> {
    const res: ApiResponse<ClockingSessionResponse> = await apiClient.post(
      "/clocking/break/start",
      undefined,
      { toast: { success: "Break started" } } as any
    )
    return res.data
  },

  // ── POST /clocking/break/end ───────────────────────────────────
  // Ends the active break, optional description (max 1000 chars)
  async endBreak(description?: string | null): Promise<ClockingSessionResponse> {
    const res: ApiResponse<ClockingSessionResponse> = await apiClient.post(
      "/clocking/break/end",
      { description: description ?? null },
      { toast: { success: "Break ended" } } as any
    )
    return res.data
  },

  // ── GET /clocking/records ──────────────────────────────────────
  // Fetches paginated clocking sessions for the authenticated user.
  // Supports date range and session-status filters, plus pagination params.
  async getRecords(params?: {
    start_date?: string | null
    end_date?: string | null
    status?: string | null // "active" | "on_break" | "completed"
    per_page?: number
    page?: number
  }): Promise<{ records: ClockRecordApiItem[]; pagination: ClockRecordsPagination }> {
    // Backend returns { success, data: [...sessions], pagination: {...}, message }
    // ApiResponse<T> only types `data`, so we cast to access `pagination` at top level
    const res = await apiClient.get<ClockRecordApiItem[]>("/clocking/records", { params })
    const raw = res as unknown as { data: ClockRecordApiItem[]; pagination: ClockRecordsPagination }
    return { records: raw.data, pagination: raw.pagination }
  },

  // ── POST /clocking/export ──────────────────────────────────────
  // Triggers a ZIP file download for the authenticated user's clocking records.
  // Optionally scoped to a date range (RFC 3339 date format, e.g. "2017-07-21").
  async exportRecords(body: {
    start_date?: string | null
    end_date?: string | null
  }): Promise<void> {
    // downloadFilePost POSTs the request and triggers a browser file download
    await apiClient.downloadFilePost("/clocking/export", body)
  },

  // ── POST /clocking/correction-request ─────────────────────────
  // Submits a time-correction request for a clock session or break record.
  // Returns the newly created PendingCorrectionApiItem (201 response).
  async requestCorrection(payload: CorrectionRequestPayload): Promise<PendingCorrectionApiItem> {
    const res: ApiResponse<PendingCorrectionApiItem> = await apiClient.post(
      "/clocking/correction-request",
      payload,
      { toast: { success: "Correction request submitted" } } as any
    )
    return res.data
  },

  // ── GET /clocking/pending-corrections ─────────────────────────
  // Returns all correction requests submitted by the authenticated user.
  // Includes both pending and already-handled (approved/rejected) entries.
  async getPendingCorrections(): Promise<PendingCorrectionApiItem[]> {
    const res: ApiResponse<PendingCorrectionApiItem[]> = await apiClient.get(
      "/clocking/pending-corrections"
    )
    return res.data
  },
}
