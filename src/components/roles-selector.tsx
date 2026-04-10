import { Checkbox } from "@/components/ui/checkbox"
import type { Role } from "@/types"

type RolesSelectorProps = {
  /** All available roles in the system */
  availableRoles: Role[]
  /** Currently selected role names */
  selectedRoles: string[]
  /** Toggle a role selection */
  onToggleRole: (roleName: string) => void
  /** Disable all interactions */
  disabled?: boolean
}

export function RolesSelector({
  availableRoles,
  selectedRoles,
  onToggleRole,
  disabled = false,
}: RolesSelectorProps) {
  if (availableRoles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No roles available.</p>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {availableRoles.map((role) => {
        const isSelected = selectedRoles.includes(role.name)
        return (
          <label
            key={role.id}
            className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
              isSelected
                ? "border-primary/30 bg-primary/5"
                : "border-border hover:bg-muted/50"
            } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onToggleRole(role.name)}
              disabled={disabled}
            />
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{role.name}</span>
              <span className="text-xs text-muted-foreground">
                {role.permissions?.length ?? 0} permission
                {(role.permissions?.length ?? 0) !== 1 ? "s" : ""}
              </span>
            </div>
          </label>
        )
      })}
    </div>
  )
}
