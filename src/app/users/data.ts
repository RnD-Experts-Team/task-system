// ─── UI-facing User types ─────────────────────────────────────────────────────
// These types describe the shape used by all view components.
// The actual data is fetched from GET /users and mapped in usersService.ts.
// The static `users` array has been removed — data now comes from useUsers().

export type UserStatus = "active" | "away" | "suspended"

export type User = {
  id: string
  name: string
  email: string
  /** First assigned role name, mapped from the API's `roles` array */
  role: string
  /** Defaults to "active" since the backend has no status field yet */
  status: UserStatus
  /** Resolved from avatar_url; `null` means no picture (use initials) */
  avatarUrl: string | null
  /** Formatted from the ISO created_at timestamp, e.g. "Oct 12, 2023" */
  createdAt: string
}
