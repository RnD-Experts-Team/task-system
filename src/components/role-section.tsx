import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { KeyRound } from "lucide-react"
import { PermissionsPreview } from "@/components/permissions-preview"
import type { Role } from "@/types"

type RoleSectionProps = {
  /** All available roles fetched from the API */
  availableRoles: Role[]
  /** Currently selected role name — empty string means none */
  selectedRole: string
  /** Called when the user picks a different role */
  onSelectRole: (roleName: string) => void
  /** Disable all interactions (e.g. while a request is in-flight) */
  disabled?: boolean
  /** True while available roles are still loading */
  loading?: boolean
}

/**
 * Form section that lets the user pick a single primary role via a Select
 * and shows a read-only preview of the permissions that role grants.
 *
 * Placement: directly below the "Personal Information" section, above
 * the "Direct Permissions" section.
 */
export function RoleSection({
  availableRoles,
  selectedRole,
  onSelectRole,
  disabled = false,
  loading = false,
}: RoleSectionProps) {
  const selectedRoleObj = useMemo(
    () => availableRoles.find((r) => r.name === selectedRole) ?? null,
    [availableRoles, selectedRole],
  )

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold uppercase tracking-widest text-muted-foreground">
          Role
        </h3>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-12 w-full" />
          <div className="md:col-span-2 rounded-lg border border-border bg-muted/30 p-4 space-y-2">
            <Skeleton className="h-4 w-48" />
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-20 rounded-full" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Role selector */}
          <div className="space-y-2">
            <Label htmlFor="role-select">Primary Role</Label>
            <Select
              value={selectedRole}
              onValueChange={onSelectRole}
              disabled={disabled || availableRoles.length === 0}
            >
              <SelectTrigger
                id="role-select"
                className="h-12 w-full text-sm"
              >
                <SelectValue placeholder="Select a role…" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.id} value={role.name}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Permissions preview for the selected role */}
          {selectedRoleObj !== null && (
            <div className="md:col-span-2 rounded-lg border border-border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <KeyRound className="size-4 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  Permissions granted by this role
                </p>
              </div>
              <PermissionsPreview permissions={selectedRoleObj.permissions} />
            </div>
          )}
        </div>
      )}
    </section>
  )
}
