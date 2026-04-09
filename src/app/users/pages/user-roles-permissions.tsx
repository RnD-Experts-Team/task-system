import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { useUsers } from "@/hooks/useUsers"
import type { Role, Permission } from "@/types"

// ─── Props ───────────────────────────────────────────────────────────────────
type UserRolesPermissionsProps = {
  /** The user id to fetch/sync roles & permissions for */
  userId: string
}

// ─── Component ───────────────────────────────────────────────────────────────
export function UserRolesPermissions({ userId }: UserRolesPermissionsProps) {
  const {
    rolesAndPermissions,
    rolesPermissionsLoading,
    rolesPermissionsError,
    syncingRolesPermissions,
    fetchRolesAndPermissions,
    syncRolesAndPermissions,
    clearRolesPermissionsError,
  } = useUsers()

  // ── Edit mode toggle ────────────────────────────────────────────────────────
  const [editing, setEditing] = useState(false)

  // ── Local draft state (only used while editing) ─────────────────────────────
  const [draftRoles, setDraftRoles] = useState<string[]>([])
  const [draftPermissions, setDraftPermissions] = useState<string[]>([])

  // Fetch data when userId changes
  useEffect(() => {
    if (userId) {
      fetchRolesAndPermissions(userId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // ── Initialise drafts from fetched data when entering edit mode ─────────────
  const enterEditMode = useCallback(() => {
    if (!rolesAndPermissions) return
    // Pre-fill draft with current role/permission names
    setDraftRoles(rolesAndPermissions.roles.map((r: Role) => r.name))
    setDraftPermissions(
      rolesAndPermissions.direct_permissions.map((p: Permission) => p.name),
    )
    clearRolesPermissionsError()
    setEditing(true)
  }, [rolesAndPermissions, clearRolesPermissionsError])

  // Cancel editing — reset drafts
  const cancelEdit = useCallback(() => {
    setEditing(false)
    clearRolesPermissionsError()
  }, [clearRolesPermissionsError])

  // ── Save handler — syncs both roles and permissions in one call ─────────────
  const handleSave = useCallback(async () => {
    const success = await syncRolesAndPermissions(userId, draftRoles, draftPermissions)
    if (success) setEditing(false)
  }, [userId, draftRoles, draftPermissions, syncRolesAndPermissions])

  // ── Toggle a role in the draft ──────────────────────────────────────────────
  const toggleRole = (roleName: string) => {
    setDraftRoles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName],
    )
  }

  // ── Toggle a permission in the draft ────────────────────────────────────────
  const togglePermission = (permName: string) => {
    setDraftPermissions((prev) =>
      prev.includes(permName)
        ? prev.filter((p) => p !== permName)
        : [...prev, permName],
    )
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (rolesPermissionsLoading) {
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
  if (rolesPermissionsError && !rolesAndPermissions) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <AlertCircle className="size-8 text-destructive" />
        <p className="text-sm text-destructive">{rolesPermissionsError}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchRolesAndPermissions(userId)}
        >
          Retry
        </Button>
      </div>
    )
  }

  if (!rolesAndPermissions) return null

  // ── Derived helpers ────────────────────────────────────────────────────────
  const { roles, direct_permissions, all_permissions } = rolesAndPermissions

  // Permissions that come from roles (not directly assigned)
  const inheritedPermissionNames = all_permissions
    .filter((ap: Permission) => !direct_permissions.some((dp: Permission) => dp.id === ap.id))
    .map((p: Permission) => p.name)

  // All unique permission names (for the checkbox list in edit mode)
  const allPermissionNames = [...new Set(all_permissions.map((p: Permission) => p.name))]

  // All unique role names from the roles attached to user + roles in system
  // We use the roles the user currently has, plus show them during editing
  const userRoleNames = roles.map((r: Role) => r.name)

  // All role names from roles that exist in the data (we need them for the edit checkboxes)
  // The GET response includes role objects with their permissions — use them
  const availableRoles = roles as Role[]

  return (
    <div className="space-y-6">
      {/* ── Section header with edit/cancel/save buttons ─────────────────── */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Roles & Permissions
        </h3>
        {editing ? (
          <div className="flex items-center gap-2">
            {/* Cancel button */}
            <Button variant="ghost" size="sm" onClick={cancelEdit} disabled={syncingRolesPermissions}>
              <X className="size-4" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
            {/* Save button */}
            <Button size="sm" onClick={handleSave} disabled={syncingRolesPermissions}>
              {syncingRolesPermissions ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              <span className="hidden sm:inline">
                {syncingRolesPermissions ? "Saving…" : "Save"}
              </span>
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={enterEditMode}>
            <Pencil className="size-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
        )}
      </div>

      {/* ── Error banner (shown inline, only during editing) ────────────── */}
      {rolesPermissionsError && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3">
          <AlertCircle className="size-4 mt-0.5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">{rolesPermissionsError}</p>
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
          /* ── Edit mode: checkboxes for each available role ──────────── */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableRoles.map((role: Role) => (
              <label
                key={role.id}
                className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                  draftRoles.includes(role.name)
                    ? "border-primary/30 bg-primary/5"
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <Checkbox
                  checked={draftRoles.includes(role.name)}
                  onCheckedChange={() => toggleRole(role.name)}
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{role.name}</span>
                  {/* Show how many permissions this role grants */}
                  <span className="text-xs text-muted-foreground">
                    {role.permissions?.length ?? 0} permission{(role.permissions?.length ?? 0) !== 1 ? "s" : ""}
                  </span>
                </div>
              </label>
            ))}
            {availableRoles.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full">
                No roles available.
              </p>
            )}
          </div>
        ) : (
          /* ── Read mode: badge list of assigned roles ────────────────── */
          <div className="flex flex-wrap gap-2">
            {roles.length > 0 ? (
              roles.map((role: Role) => (
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
          /* ── Edit mode: checkboxes for all known permissions ─────────── */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {allPermissionNames.map((permName: string) => {
              const isInherited = inheritedPermissionNames.includes(permName)
              const isDirect = draftPermissions.includes(permName)
              return (
                <label
                  key={permName}
                  className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                    isDirect
                      ? "border-primary/30 bg-primary/5"
                      : isInherited
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-border hover:bg-muted/50"
                  }`}
                >
                  <Checkbox
                    checked={isDirect}
                    onCheckedChange={() => togglePermission(permName)}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{permName}</span>
                    {/* Indicate if this permission is inherited from a role */}
                    {isInherited && !isDirect && (
                      <span className="text-xs text-amber-600">
                        Inherited from role
                      </span>
                    )}
                  </div>
                </label>
              )
            })}
            {allPermissionNames.length === 0 && (
              <p className="text-sm text-muted-foreground col-span-full">
                No permissions available.
              </p>
            )}
          </div>
        ) : (
          /* ── Read mode: badge list of direct permissions ────────────── */
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

      {/* ─── ALL PERMISSIONS (read-only, shows inherited + direct) ──────── */}
      {!editing && all_permissions.length > 0 && (
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
                // Highlight direct vs inherited permissions
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
