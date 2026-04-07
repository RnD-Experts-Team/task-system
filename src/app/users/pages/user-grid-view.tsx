import type { User } from "@/app/users/data"
import { UserCard } from "@/app/users/pages/user-card"

type UserGridViewProps = {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onSelect: (user: User) => void
}

export function UserGridView({ users, onEdit, onDelete, onSelect }: UserGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
