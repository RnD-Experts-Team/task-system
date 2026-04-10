import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, Shield, KeyRound } from "lucide-react"
import { RolesSelector } from "@/components/roles-selector"
import { PermissionsSelector } from "@/components/permissions-selector"
import type { Role, Permission } from "@/types"

type RolesPermissionsSectionProps = {
  /** All available roles */
  availableRoles: Role[]
  /** All available permissions */
  availablePermissions: Permission[]
  /** Currently selected role names */
  selectedRoles: string[]
  /** Currently selected permission names */
  selectedPermissions: string[]
  /** Permission names inherited from selected roles */
  inheritedPermissions?: string[]
  /** Toggle a role */
  onToggleRole: (roleName: string) => void
  /** Toggle a permission */
  onTogglePermission: (permName: string) => void
  /** Disable all interactions */
  disabled?: boolean
  /** True while loading available roles/permissions */
  loading?: boolean
  /** Error message */
  error?: string | null
  /** Retry callback for error state */
  onRetry?: () => void
  /** Hide the Roles sub-section (use when role is managed by RoleSection above) */
  hideRoles?: boolean
}

export function RolesPermissionsSection({
  availableRoles,
  availablePermissions,
  selectedRoles,
  selectedPermissions,
  inheritedPermissions = [],
  onToggleRole,
  onTogglePermission,
  disabled = false,
  loading = false,
  error,
  onRetry,
  hideRoles = false,
}: RolesPermissionsSectionProps) {
  // ── Loading skeleton ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold uppercase tracking-widest text-muted-foreground">
            {hideRoles ? "Permissions" : "Roles & Permissions"}
          </h3>
        </div>
        <div className="space-y-4">
          {!hideRoles && (
            <>
              <Skeleton className="h-5 w-24" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            </>
          )}
          <Skeleton className="h-5 w-32" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // ── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold uppercase tracking-widest text-muted-foreground">
            {hideRoles ? "Permissions" : "Roles & Permissions"}
          </h3>
        </div>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <AlertCircle className="size-8 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold uppercase tracking-widest text-muted-foreground">
          {hideRoles ? "Permissions" : "Roles & Permissions"}
        </h3>
      </div>

      {/* Roles — hidden when managed by RoleSection */}
      {!hideRoles && (
        <>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              <h4 className="text-sm font-medium">Roles</h4>
            </div>
            <RolesSelector
              availableRoles={availableRoles}
              selectedRoles={selectedRoles}
              onToggleRole={onToggleRole}
              disabled={disabled}
            />
          </div>
          <Separator />
        </>
      )}

      {/* Permissions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <KeyRound className="size-4 text-primary" />
          <h4 className="text-sm font-medium">Direct Permissions</h4>
        </div>
        <PermissionsSelector
          availablePermissions={availablePermissions}
          selectedPermissions={selectedPermissions}
          onTogglePermission={onTogglePermission}
          inheritedPermissions={inheritedPermissions}
          disabled={disabled}
        />
      </div>
    </section>
  )
}
