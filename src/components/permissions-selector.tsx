import { useMemo } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import type { Permission } from "@/types"

type PermissionsSelectorProps = {
  /** All available permissions in the system */
  availablePermissions: Permission[]
  /** Currently selected permission names */
  selectedPermissions: string[]
  /** Toggle a permission selection */
  onTogglePermission: (permName: string) => void
  /** Permission names inherited from roles (shown with "inherited" label) */
  inheritedPermissions?: string[]
  /** Disable all interactions */
  disabled?: boolean
}

/**
 * Group permissions by their resource name.
 * "view users" → resource "users", "create projects" → resource "projects".
 * Single-word permissions go into "other".
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

  // Sort groups alphabetically and sort permissions within each group
  const sorted: Record<string, Permission[]> = {}
  for (const key of Object.keys(groups).sort()) {
    sorted[key] = groups[key].sort((a, b) => a.name.localeCompare(b.name))
  }
  return sorted
}

export function PermissionsSelector({
  availablePermissions,
  selectedPermissions,
  onTogglePermission,
  inheritedPermissions = [],
  disabled = false,
}: PermissionsSelectorProps) {
  const grouped = useMemo(
    () => groupPermissions(availablePermissions),
    [availablePermissions],
  )

  const groupEntries = Object.entries(grouped)

  if (groupEntries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No permissions available.
      </p>
    )
  }

  return (
    <div className="max-h-80 overflow-y-auto space-y-4 pr-1 themed-scrollbar">
      {groupEntries.map(([resource, perms]) => (
        <div key={resource} className="space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground capitalize">
            {resource}
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {perms.map((perm) => {
              const isSelected = selectedPermissions.includes(perm.name)
              const isInherited = inheritedPermissions.includes(perm.name)
              return (
                <label
                  key={perm.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    isSelected
                      ? "border-primary/30 bg-primary/5"
                      : isInherited
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-border hover:bg-muted/50"
                  } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onTogglePermission(perm.name)}
                    disabled={disabled}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">
                      {perm.name}
                    </span>
                    {isInherited && !isSelected && (
                      <span className="text-xs text-amber-600">
                        Inherited from role
                      </span>
                    )}
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
