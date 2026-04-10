import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import type { Permission } from "@/types"

/**
 * Group permissions by their resource name.
 * "view users" → resource "users", "create projects" → resource "projects".
 * Single-word permissions go into "other".
 * (Same algorithm as PermissionsSelector to keep grouping consistent.)
 */
function groupPermissions(
  permissions: Permission[],
): Record<string, Permission[]> {
  const groups: Record<string, Permission[]> = {}
  for (const perm of permissions) {
    const parts = perm.name.split(/\s+/)
    const resource = parts.length >= 2 ? parts.slice(1).join(" ") : "other"
    if (!groups[resource]) groups[resource] = []
    groups[resource].push(perm)
  }
  const sorted: Record<string, Permission[]> = {}
  for (const key of Object.keys(groups).sort()) {
    sorted[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name))
  }
  return sorted
}

type PermissionsPreviewProps = {
  /** Permissions to display (read-only) */
  permissions: Permission[]
}

/**
 * Read-only, grouped display of a set of permissions.
 * Used to preview the permissions that come with a selected role.
 */
export function PermissionsPreview({ permissions }: PermissionsPreviewProps) {
  const grouped = useMemo(() => groupPermissions(permissions), [permissions])
  const groupEntries = Object.entries(grouped)

  if (permissions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No permissions for this role.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {groupEntries.map(([resource, perms]) => (
        <div key={resource} className="space-y-1.5">
          <h5 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {resource}
          </h5>
          <div className="flex flex-wrap gap-1.5">
            {perms.map((perm) => (
              <Badge key={perm.id} variant="secondary" className="text-xs">
                {perm.name}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
