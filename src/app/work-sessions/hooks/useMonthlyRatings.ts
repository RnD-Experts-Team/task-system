// src/app/work-sessions/hooks/useMonthlyRatings.ts
// Loads every user's rating + activity stats for a given month and exposes
// save / remove mutations that patch the matching row locally on success.

import { useCallback, useEffect, useState } from "react"
import { isCancel } from "axios"
import { workSessionService } from "../services/workSessionService"
import { extractErrorMessage } from "../utils/format"
import type { MonthlyRatingRow, UpsertRatingPayload, YearMonth } from "../types"

export function useMonthlyRatings({ year, month }: YearMonth) {
  const [rows, setRows] = useState<MonthlyRatingRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // User id whose save/clear request is in flight (one at a time per row)
  const [savingUserId, setSavingUserId] = useState<number | null>(null)

  // ── Fetch ──────────────────────────────────────────────────────
  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await workSessionService.listRatings(year, month)
      setRows(data)
    } catch (err) {
      if (!isCancel(err)) {
        setError(extractErrorMessage(err, "Failed to load monthly ratings."))
      }
    } finally {
      setLoading(false)
    }
  }, [year, month])

  useEffect(() => {
    refetch()
  }, [refetch])

  // ── Save (create or update) ────────────────────────────────────
  const save = useCallback(
    async (userId: number, payload: UpsertRatingPayload): Promise<boolean> => {
      setSavingUserId(userId)
      try {
        const rating = await workSessionService.upsertRating(userId, year, month, payload)
        // Patch the row in place so the table reflects the new score immediately
        setRows((prev) => prev.map((r) => (r.user.id === userId ? { ...r, rating } : r)))
        return true
      } catch {
        // Errors are toasted by the axios interceptor; the row keeps its draft
        return false
      } finally {
        setSavingUserId(null)
      }
    },
    [year, month]
  )

  // ── Remove ─────────────────────────────────────────────────────
  const remove = useCallback(
    async (userId: number): Promise<boolean> => {
      setSavingUserId(userId)
      try {
        await workSessionService.deleteRating(userId, year, month)
        setRows((prev) => prev.map((r) => (r.user.id === userId ? { ...r, rating: null } : r)))
        return true
      } catch {
        return false
      } finally {
        setSavingUserId(null)
      }
    },
    [year, month]
  )

  const clearError = useCallback(() => setError(null), [])

  return { rows, loading, error, refetch, save, remove, savingUserId, clearError }
}
