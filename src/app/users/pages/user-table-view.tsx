import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import type { User } from "@/app/users/data"

type UserTableViewProps = {
  users: User[]
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onSelect: (user: User) => void
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

const statusLabel: Record<string, string> = {
  active: "Active",
  away: "Away",
  suspended: "Suspended",
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  away: "outline",
  suspended: "destructive",
}

export function UserTableView({ users, onEdit, onDelete, onSelect }: UserTableViewProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} className="group">
            <TableCell className="py-3">
              <div className="flex items-center gap-4">
                <Avatar size="lg" className="size-12">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  className="font-medium text-foreground text-base sm:text-lg hover:text-primary hover:underline underline-offset-2 transition-colors text-left"
                  onClick={() => onSelect(user)}
                >
                  {user.name}
                </button>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground py-3 text-sm">{user.email}</TableCell>
            <TableCell className="py-3">
              <Badge variant="secondary">{user.role}</Badge>
            </TableCell>
            <TableCell className="py-3">
              <Badge variant={statusVariant[user.status] ?? "outline"}>
                {statusLabel[user.status] ?? user.status}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground py-3">{user.createdAt}</TableCell>
            <TableCell className="text-right py-3">
              <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon-lg" onClick={() => onEdit(user)}>
                  <Pencil />
                </Button>
                <Button variant="destructive" size="icon-lg" onClick={() => onDelete(user)}>
                  <Trash2 />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
