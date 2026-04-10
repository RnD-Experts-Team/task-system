import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Calendar } from "lucide-react"
import { useTilt } from "@/hooks/use-tilt"
import type { Role } from "@/types"

type RoleCardProps = {
  role: Role
  onSelect: (role: Role) => void
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
}

export function RoleCard({ role, onSelect, onEdit, onDelete }: RoleCardProps) {
  const { ref, style } = useTilt<HTMLDivElement>({ maxTilt: 5, scale: 1.015 })

  return (
    <Card ref={ref} style={style} className="flex flex-col">
      <CardContent className="flex flex-col gap-4 pt-4 px-4 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px]">
              {role.guard_name}
            </Badge>
            <Badge variant="secondary" className="text-[10px]">
              {role.permissions.length} perm{role.permissions.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs">
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(role)}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(role)}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex flex-col gap-1">
          <button
            type="button"
            className="text-lg font-semibold text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors text-left leading-tight"
            onClick={() => onSelect(role)}
          >
            {role.name}
          </button>
          <span className="text-xs text-muted-foreground">ID: {role.id}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="size-3" />
            {new Date(role.created_at).toLocaleDateString()}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex items-center gap-3 w-full mt-auto">
        <Button variant="secondary" size="lg" className="flex-1 py-2" onClick={() => onEdit(role)}>
          <Pencil className="size-3.5" />
          Edit
        </Button>
        <Button variant="destructive" size="icon-lg" onClick={() => onDelete(role)}>
          <Trash2 className="size-3.5" />
        </Button>
      </CardFooter>
    </Card>
  )
}
