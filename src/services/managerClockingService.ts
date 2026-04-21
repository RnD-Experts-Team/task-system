// src/services/managerClockingService.ts
// Service for all MANAGER clocking API calls.
// These endpoints are protected server-side — the UI does not enforce roles here.

import { apiClient } from "./api"
import type {
  ClockSession,
  ClockRecordApiItem,
  ClockRecordsPagination,
  PendingCorrectionApiItem,
} from "@/app/clocking/data"
import type { ApiResponse } from "@/types"

// ─── Manager-specific response types ─────────────────────────────

/**
 * Response shape for GET /clocking/manager/initial-data
 * The backend returns an array of ALL currently active sessions (all employees).
 */
export interface ManagerInitialData {
  /** All active/on-break sessions across every employee */
  sessions: Array<{
    session: ClockSession
    company_timezone: string
    server_time_utc: string
  }>
  company_timezone: string
  server_time_utc: string
}

/** Payload for POST /clocking/manager/correction/{id}/handle */
export interface HandleCorrectionPayload {
  action: "approve" | "reject"
  admin_notes?: string | null
}

/** Body for POST /clocking/manager/export-all */
export interface ExportAllPayload {
  start_date?: string | null
  end_date?: string | null
}

/** Body for PUT /clocking/manager/session/{id}/edit */
export interface EditSessionPayload {
  clock_in_utc?: string | null   // format: YYYY-MM-DDTHH:mm:ssZ
  clock_out_utc?: string | null  // format: YYYY-MM-DDTHH:mm:ssZ
}

/** Body for PUT /clocking/manager/break/{id}/edit */
export interface EditBreakPayload {
  break_start_utc?: string | null  // format: YYYY-MM-DDTHH:mm:ssZ
  break_end_utc?: string | null    // format: YYYY-MM-DDTHH:mm:ssZ
}

// ─── Service ──────────────────────────────────────────────────────

export const managerClockingService = {

  // ── GET /clocking/manager/initial-data ────────────────────────
  // Returns all currently active/on-break sessions for every employee.
  // Used to populate the Live Dashboard tab.
  async getInitialData(): Promise<ManagerInitialData> {
    const res: ApiResponse<ManagerInitialData> = await apiClient.get(
      "/clocking/manager/initial-data"
    )
    return res.data
  },

  // ── GET /clocking/manager/pending-corrections ─────────────────
  // Returns ALL pending correction requests across all employees.
  async getPendingCorrections(): Promise<PendingCorrectionApiItem[]> {
    const res: ApiResponse<PendingCorrectionApiItem[]> = await apiClient.get(
      "/clocking/manager/pending-corrections"
    )
    return res.data
  },

  // ── POST /clocking/manager/correction/{id}/handle ─────────────
  // Approve or reject a correction request.
  // admin_notes is optional (max 500 chars).
  async handleCorrection(
    correctionId: number,
    payload: HandleCorrectionPayload
  ): Promise<PendingCorrectionApiItem> {
    const res: ApiResponse<PendingCorrectionApiItem> = await apiClient.post(
      `/clocking/manager/correction/${correctionId}/handle`,
      payload,
      {
        toast: {
          success: payload.action === "approve"
            ? "Correction approved"
            : "Correction rejected",
        },
      } as any
    )
    return res.data
  },

  // ── GET /clocking/manager/all-records ─────────────────────────
  // Returns paginated clocking records for ALL employees.
  // Supports date range, status, and user_id filters.
  async getAllRecords(params?: {
    start_date?: string | null
    end_date?: string | null
    status?: string | null   // "active" | "on_break" | "completed"
    user_id?: number | null
    per_page?: number
    page?: number
  }): Promise<{ records: ClockRecordApiItem[]; pagination: ClockRecordsPagination }> {
    // Cast the raw response to access the top-level pagination object
    const res = await apiClient.get<ClockRecordApiItem[]>(
      "/clocking/manager/all-records",
      { params }
    )
    const raw = res as unknown as {
      data: ClockRecordApiItem[]
      pagination: ClockRecordsPagination
    }
    return { records: raw.data, pagination: raw.pagination }
  },

  // ── POST /clocking/manager/export-all ─────────────────────────
  // Generates a ZIP file with clocking PDFs for all employees and downloads it.
  async exportAll(body: ExportAllPayload): Promise<void> {
    await apiClient.downloadFilePost("/clocking/manager/export-all", body)
  },

  // ── PUT /clocking/manager/session/{id}/edit ───────────────────
  // Directly edit a clock session's clock_in / clock_out timestamps.
  async editSession(
    sessionId: number,
    payload: EditSessionPayload
  ): Promise<ClockRecordApiItem> {
    const res: ApiResponse<ClockRecordApiItem> = await apiClient.put(
      `/clocking/manager/session/${sessionId}/edit`,
      payload,
      { toast: { success: "Session updated successfully" } } as any
    )
    return res.data
  },

  // ── PUT /clocking/manager/break/{id}/edit ────────────────────
  // Directly edit a break record's start / end timestamps.
  async editBreak(
    breakId: number,
    payload: EditBreakPayload
  ): Promise<import("@/app/clocking/data").BreakRecord> {
    const res: ApiResponse<import("@/app/clocking/data").BreakRecord> = await apiClient.put(
      `/clocking/manager/break/${breakId}/edit`,
      payload,
      { toast: { success: "Break updated successfully" } } as any
    )
    return res.data
  },
}
