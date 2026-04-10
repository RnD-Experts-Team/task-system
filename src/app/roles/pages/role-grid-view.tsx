import type { Role } from "@/types"
import { RoleCard } from "@/app/roles/pages/role-card"

type RoleGridViewProps = {
  roles: Role[]
  onSelect: (role: Role) => void
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}

export function RoleGridView({ roles, onSelect, onEdit, onDelete }: RoleGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {roles.map((role) => (
        <RoleCard
          key={role.id}
          role={role}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
