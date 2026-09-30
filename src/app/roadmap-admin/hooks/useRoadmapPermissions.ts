// src/app/roadmap-admin/hooks/useRoadmapPermissions.ts
// Permission flags for the roadmap console: the admin role always passes, otherwise the
// matching roadmap permission is required (mirrors the backend's role_or_permission).

import { usePermissions } from "@/hooks/usePermissions"
import { ADMIN_PERMISSIONS } from "../types"

export function useRoadmapPermissions() {
  const { hasRole, hasPermission } = usePermissions()
  const isAdmin = hasRole("admin")
  return {
    /** Boards, statuses, tags, posts (write), roadmap board */
    canManage: isAdmin || hasPermission(ADMIN_PERMISSIONS.manage),
    /** Moderation queue, visitors, abuse tools */
    canModerate: isAdmin || hasPermission(ADMIN_PERMISSIONS.moderate),
    /** Branding, site copy, limits */
    canManageSettings: isAdmin || hasPermission(ADMIN_PERMISSIONS.settings),
    /** Changelog */
    canManageChangelog: isAdmin || hasPermission(ADMIN_PERMISSIONS.changelog),
  } as const
}
