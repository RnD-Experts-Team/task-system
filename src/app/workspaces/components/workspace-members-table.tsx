import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import type { WorkspaceMember } from "../types"

/**
 * Generates initials from a name (first letter of first two words).
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Maps the pivot role to a badge variant for visual distinction.
 */
function roleBadgeVariant(role: string): "default" | "secondary" | "outline" {
  switch (role) {
    case "owner":
      return "default"
    case "editor":
      return "secondary"
    default:
      return "outline"
  }
}

type Props = {
  members: WorkspaceMember[]
  /** Called when the user clicks "Change Role" on a member row */
  onChangeRole?: (member: WorkspaceMember) => void
  /** Called when the user clicks "Remove" on a member row */
  onRemove?: (member: WorkspaceMember) => void
}

/**
 * WorkspaceMembersTable — displays workspace members with their pivot roles.
 * Each row has an actions dropdown for changing role and removing the member.
 * Owner members show a disabled actions button since their role cannot be changed via API.
 */
export function WorkspaceMembersTable({ members, onChangeRole, onRemove }: Props) {
  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
        <p className="text-muted-foreground">No members in this workspace yet.</p>
      </div>
    )
  }

  return (
    /* overflow-x-auto ensures the table scrolls horizontally on small screens */
    <div className="overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            {/* Hide email column on very small screens to keep layout clean */}
            <TableHead className="hidden sm:table-cell">Email</TableHead>
            <TableHead>Role</TableHead>
            {/* Actions column — only shown if at least one handler is provided */}
            {(onChangeRole || onRemove) && (
              <TableHead className="w-12 text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id} className="group">
              {/* Avatar + name */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar size="sm">
                    <AvatarFallback className="text-xs font-bold">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <span className="block truncate font-medium">{member.name}</span>
                    {/* Show email below name on small screens where the email column is hidden */}
                    <span className="block truncate text-xs text-muted-foreground sm:hidden">
                      {member.email}
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* Email — hidden on xs screens */}
              <TableCell className="hidden text-muted-foreground sm:table-cell">
                {member.email}
              </TableCell>

              {/* Role badge from the user_workspace pivot table */}
              <TableCell>
                <Badge variant={roleBadgeVariant(member.pivot.role)}>
                  {member.pivot.role}
                </Badge>
              </TableCell>

              {/* Actions dropdown — shown if handlers are provided */}
              {(onChangeRole || onRemove) && (
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label={`Actions for ${member.name}`}
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {/* Change role — available to all non-owner members */}
                      {onChangeRole && (
                        <DropdownMenuItem
                          onClick={() => onChangeRole(member)}
                          disabled={member.pivot.role === "owner"}
                        >
                          <Pencil className="mr-2 size-4" />
                          Change Role
                        </DropdownMenuItem>
                      )}
                      {/* Remove member */}
                      {onRemove && (
                        <DropdownMenuItem
                          onClick={() => onRemove(member)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" />
                          Remove
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

