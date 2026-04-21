import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Shield, Code } from "lucide-react"
import { useTilt } from "@/hooks/use-tilt"
import type { User } from "@/app/users/data"

type UserCardProps = {
  user: User
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onSelect: (user: User) => void
  /** Show the Edit button — true when caller has "edit users" permission */
  canEdit?: boolean
  /** Show the Delete button — true when caller has "delete users" permission */
  canDelete?: boolean
  /** Allow clicking the user name to open the detail sheet — true when caller has "view users" */
  canView?: boolean
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return ""
  if (parts.length === 1) return parts[0][0].toUpperCase()
  const first = parts[0][0]
  const last = parts[parts.length - 1][0]
  return `${first}${last}`.toUpperCase()
}

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  active: "default",
  away: "secondary",
  suspended: "destructive",
}

export function UserCard({ user, onEdit, onDelete, onSelect, canEdit = true, canDelete = true, canView = true }: UserCardProps) {
  const { ref, style } = useTilt<HTMLDivElement>({ maxTilt: 5, scale: 1.015 })

  return (
    <Card ref={ref} style={style} className="flex flex-col items-center text-center">
      <CardContent className="flex flex-col items-center gap-4 pt-4 px-4">
        {/* Avatar: if API provides an image use it, otherwise show initials.
            Also show a small overlay icon to distinguish Admin vs Developer. */}
        <Avatar size="lg" className="size-24 ring-2 ring-primary/20 rounded-xl relative">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.name} />
          ) : (
            <AvatarFallback className="rounded-xl">{getInitials(user.name)}</AvatarFallback>
          )}

          {/* Role overlay: amber shield for admins, sky code for developers */}
          {user.role?.toLowerCase().includes("admin") ? (
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 ring-2 ring-background text-white">
              <Shield className="size-3" />
            </span>
          ) : user.role?.toLowerCase().includes("developer") ? (
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 ring-2 ring-background text-white">
              <Code className="size-3" />
            </span>
          ) : null}
        </Avatar>

        <div className="flex flex-col items-center gap-2">
          {/* User name — clicking opens the detail sheet.
              Rendered as a plain span when the caller lacks "view users". */}
          {canView ? (
            <button
              type="button"
              className="text-lg font-semibold text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors"
              onClick={() => onSelect(user)}
            >
              {user.name}
            </button>
          ) : (
            <span className="text-lg font-semibold text-foreground">
              {user.name}
            </span>
          )}
          <Badge variant={statusVariant[user.status] ?? "secondary"} className="uppercase tracking-wider">
            {user.role}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground truncate w-full">{user.email}</p>
        <span className="text-sm text-muted-foreground/70">Joined {user.createdAt}</span>
      </CardContent>

      {/* Footer — only rendered when at least one action button is permitted */}
      {(canEdit || canDelete) && (
        <CardFooter className="flex items-center gap-3 w-full mt-auto">
          {/* Edit button — shown only with "edit users" permission */}
          {canEdit && (
            <Button variant="secondary" size="lg" className="flex-1 py-2" onClick={() => onEdit(user)}>
              <Pencil />
              Edit
            </Button>
          )}
          {/* Delete button — shown only with "delete users" permission */}
          {canDelete && (
            <Button variant="destructive" size="icon-lg" onClick={() => onDelete(user)}>
              <Trash2 />
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
