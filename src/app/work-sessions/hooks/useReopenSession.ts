// src/app/work-sessions/hooks/useReopenSession.ts
// Thin wrapper around the store's reopen mutation for the admin detail sheet.

import { useAdminWorkSessionStore } from "../store/adminWorkSessionStore"

export function useReopenSession() {
  const reopen = useAdminWorkSessionStore((s) => s.reopenSession)
  const reopening = useAdminWorkSessionStore((s) => s.reopening)
  const error = useAdminWorkSessionStore((s) => s.reopenError)
  const clearError = useAdminWorkSessionStore((s) => s.clearReopenError)

  return { reopen, reopening, error, clearError }
}
