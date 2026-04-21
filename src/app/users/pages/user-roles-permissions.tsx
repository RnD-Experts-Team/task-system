import { useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertCircle,
  Loader2,
  Pencil,
  X,
  Save,
  Shield,
  KeyRound,
} from "lucide-react"
import { useRolesPermissions } from "@/hooks/useRolesPermissions"
import { usePermissions } from "@/hooks/usePermissions"
import { RolesSelector } from "@/components/roles-selector"
import { PermissionsSelector } from "@/components/permissions-selector"
import type { Permission } from "@/types"

// ─── Props ───────────────────────────────────────────────────────────────────
type UserRolesPermissionsProps = {
  /** The user id to fetch/sync roles & permissions for */
  userId: string
  /**
   * Whether the current viewer holds "edit users" permission.
   * When false the Edit button is hidden and the panel is fully read-only.
   */
  canEdit?: boolean
}

// ─── Component ───────────────────────────────────────────────────────────────
export function UserRolesPermissions({ userId, canEdit = true }: UserRolesPermissionsProps) {
  const {
    availableRoles,
    availablePermissions,
    currentRoles,
    currentPermissions,
    inheritedPermissions,
    isDirty,
    rolesAndPermissions,
    loading,
    availableLoading,
    error,
    syncing,
    toggleRole,
    togglePermission,
    saveChanges,
    reset,
    fetchAvailable,
    refetchUserData,
    clearError,
  } = useRolesPermissions({ userId, fetchAvailableOnMount: false })

  // Check whether the viewer can see the permission sections.
  // "view permissions" is required by the backend for GET /permissions.
  // We derive it from the auth store so the UI matches the API guard.
  const { hasPermission } = usePermissions()
  const canViewPermissions = hasPermission("view permissions")

  // ── Edit mode toggle ────────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false)

  const enterEditMode = useCallback(() => {
    fetchAvailable()
    clearError()
    setEditing(true)
  }, [fetchAvailable, clearError])

  const cancelEdit = useCallback(() => {
    reset()
    clearError()
    setEditing(false)
  }, [reset, clearError])

  // ── Save handler — uses smart sync (only changed endpoints) ────────────────
  const handleSave = useCallback(async () => {
    if (!isDirty) {
      setEditing(false)
      return
    }
    const success = await saveChanges(userId)
    if (success) setEditing(false)
  }, [userId, isDirty, saveChanges])

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading && !rolesAndPermissions) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-5 w-24" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-5 w-32 mt-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  // ── Fetch error state ──────────────────────────────────────────────────────
  if (error && !rolesAndPermissions) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <AlertCircle className="size-8 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={refetchUserData}
        >
          Retry
        </Button>
      </div>
    )
  }

  if (!rolesAndPermissions) return null

  // ── Derived helpers ────────────────────────────────────────────────────────
  const { roles, direct_permissions, all_permissions } = rolesAndPermissions

  return (
    <div className="space-y-6">
      {/* ── Section header with edit/cancel/save buttons ─────────────────── */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Roles & Permissions
        </h3>
        {editing ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={syncing}>
              <X className="size-4" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
            {/* Save — guarded by "edit users" permission (canEdit prop) */}
            <Button size="sm" onClick={handleSave} disabled={syncing || !isDirty}>
              {syncing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              <span className="hidden sm:inline">
                {syncing ? "Saving…" : "Save"}
              </span>
            </Button>
          </div>
        ) : (
          // Edit button — only shown when the viewer holds "edit users" permission
          canEdit && (
            <Button variant="ghost" size="sm" onClick={enterEditMode}>
              <Pencil className="size-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          )
        )}
      </div>

      {/* ── Error banner (shown inline) ─────────────────────────────────── */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <AlertCircle className="size-4 mt-0.5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* ─── ROLES SECTION ─────────────────────────────────────────────── */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-primary" />
          <h4 className="text-sm font-medium">Roles</h4>
          {!editing && (
            <Badge variant="secondary" className="ml-auto text-xs">
              {roles.length}
            </Badge>
          )}
        </div>

        {editing ? (
          availableLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>
          ) : (
            <RolesSelector
              availableRoles={availableRoles}
              selectedRoles={currentRoles}
              onToggleRole={toggleRole}
              disabled={syncing}
            />
          )
        ) : (
          <div className="flex flex-wrap gap-2">
            {roles.length > 0 ? (
              roles.map((role) => (
                <Badge key={role.id} variant="secondary" className="text-xs">
                  {role.name}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No roles assigned.</p>
            )}
          </div>
        )}
      </section>

      <Separator />

      {/* ─── DIRECT PERMISSIONS SECTION ────────────────────────────────── */}
      {/* Only visible to users who hold "view permissions" — the backend
          requires this permission for GET /permissions. Hide the section
          entirely instead of showing a confusing empty or errored state. */}
      {canViewPermissions && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <KeyRound className="size-4 text-primary" />
            <h4 className="text-sm font-medium">Direct Permissions</h4>
            {!editing && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {direct_permissions.length}
              </Badge>
            )}
          </div>

          {editing ? (
            availableLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 rounded-lg" />
                ))}
              </div>
            ) : (
              <PermissionsSelector
                availablePermissions={availablePermissions}
                selectedPermissions={currentPermissions}
                onTogglePermission={togglePermission}
                inheritedPermissions={inheritedPermissions}
                disabled={syncing}
              />
            )
          ) : (
            <div className="flex flex-wrap gap-2">
              {direct_permissions.length > 0 ? (
                direct_permissions.map((perm: Permission) => (
                  <Badge key={perm.id} variant="outline" className="text-xs">
                    {perm.name}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No direct permissions assigned.
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* ─── ALL PERMISSIONS (read-only, shows inherited + direct) ──────── */}
      {/* Only visible to users who hold "view permissions". Shown only
          outside edit mode and only when the user actually has permissions. */}
      {canViewPermissions && !editing && all_permissions.length > 0 && (
        <>
          <Separator />
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <KeyRound className="size-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">All Effective Permissions</h4>
              <Badge variant="secondary" className="ml-auto text-xs">
                {all_permissions.length}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {all_permissions.map((perm: Permission) => {
                const isDirect = direct_permissions.some(
                  (dp: Permission) => dp.id === perm.id,
                )
                return (
                  <Badge
                    key={perm.id}
                    variant={isDirect ? "default" : "outline"}
                    className="text-xs"
                  >
                    {perm.name}
                    {isDirect && (
                      <span className="ml-1 opacity-60">(direct)</span>
                    )}
                  </Badge>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
