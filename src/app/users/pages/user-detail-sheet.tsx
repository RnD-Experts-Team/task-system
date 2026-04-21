import { useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pencil, Shield, Code } from "lucide-react"
import type { User } from "@/app/users/data"
import { useUsers } from "@/hooks/useUsers"
import { usePermissions } from "@/hooks/usePermissions"
import { UserRolesPermissions } from "@/app/users/pages/user-roles-permissions"
// Sections rendered inside the Overview tab
import { UserProjects }                from "@/app/users/pages/user-projects"
import { UserTaskAssignments }         from "@/app/users/pages/user-task-assignments"
// Two help-request sections: submitted by this user and requests where they assist
import { UserRequestedHelpRequests }   from "@/app/users/pages/user-requested-help-requests"
import { UserHelperHelpRequests }      from "@/app/users/pages/user-helper-help-requests"
// Two ticket sections: tickets submitted by this user and tickets assigned to them
import { UserRequestedTickets }        from "@/app/users/pages/user-requested-tickets"
import { UserAssignedTickets }         from "@/app/users/pages/user-assigned-tickets"

type UserDetailSheetProps = {
  /** The user whose details should be fetched (only `id` is needed) */
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (user: User) => void
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return ""
  if (parts.length === 1) return parts[0][0].toUpperCase()
  const first = parts[0][0]
  const last = parts[parts.length - 1][0]
  return `${first}${last}`.toUpperCase()
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

export function UserDetailSheet({ user, open, onOpenChange, onEdit }: UserDetailSheetProps) {
  const {
    selectedUser,
    selectedLoading,
    getUser,
    clearUserProjects,
    clearUserTaskAssignments,
    // Actions to clear help-request slices on sheet close
    clearUserRequestedHelpRequests,
    clearUserHelperHelpRequests,
    // Actions to clear ticket slices on sheet close
    clearUserRequestedTickets,
    clearUserAssignedTickets,
  } = useUsers()

  // Read the current user's permissions to control sheet sections.
  const { hasPermission } = usePermissions()
  // "edit users" controls the Edit button visibility inside the sheet.
  const canEditUsers = hasPermission("edit users")

  // Fetch full details whenever the sheet opens with a user
  useEffect(() => {
    if (open && user?.id) {
      getUser(user.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.id])

  // When the sheet closes, clear all per-user data so the next user
  // always starts with a fresh fetch (no stale rows from the previous user).
  useEffect(() => {
    if (!open) {
      clearUserProjects()
      clearUserTaskAssignments()
      clearUserRequestedHelpRequests()
      clearUserHelperHelpRequests()
      // Also clear ticket sections to avoid showing previous user's tickets
      clearUserRequestedTickets()
      clearUserAssignedTickets()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Use the fetched detail when available, otherwise fall back to the row data
  const detail = selectedUser ?? user
  if (!detail) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="data-[side=right]:sm:max-w-full overflow-y-auto themed-scrollbar">
        {/* Loading skeleton while the detail request is in-flight */}
        {selectedLoading ? (
          <div className="flex flex-col items-center gap-4 py-10 px-8">
            <Skeleton className="size-28 rounded-full" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
            <div className="grid grid-cols-2 gap-3 w-full mt-6">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
          </div>
        ) : (
          <>
            <SheetHeader className="items-center text-center gap-3">
              {/* Avatar with role overlay icon */}
              <Avatar size="lg" className="size-28 ring-2 ring-primary/20 relative">
                {detail.avatarUrl ? (
                  <AvatarImage src={detail.avatarUrl} alt={detail.name} />
                ) : (
                  <AvatarFallback>{getInitials(detail.name)}</AvatarFallback>
                )}

                {detail.role?.toLowerCase().includes("admin") ? (
                  <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 ring-2 ring-background text-white">
                    <Shield className="size-4" />
                  </span>
                ) : detail.role?.toLowerCase().includes("developer") ? (
                  <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 ring-2 ring-background text-white">
                    <Code className="size-4" />
                  </span>
                ) : null}
              </Avatar>
              <SheetTitle className="text-2xl">{detail.name}</SheetTitle>
              <SheetDescription className="text-sm">{detail.email}</SheetDescription>
              <div className="flex items-center gap-2 pt-1">
                <Badge variant={statusVariant[detail.status] ?? "outline"}>
                  {statusLabel[detail.status] ?? detail.status}
                </Badge>
                <Badge variant="secondary">{detail.role}</Badge>
              </div>
            </SheetHeader>

              <div className="px-8 pb-10 space-y-8">
              {/* Tabs: Overview and Roles & Permissions */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
                    <TabsTrigger value="roles" className="flex-1">Roles & Permissions</TabsTrigger>
                  </TabsList>

                  {/* ── Overview tab ─────────────────────────────────────────── */}
                  <TabsContent value="overview" className="space-y-6 pt-4">
                    {/* Quick Info cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                          Joined
                        </p>
                        <p className="text-sm font-medium">{detail.createdAt}</p>
                      </div>
                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                          Status
                        </p>
                        <p className="text-sm font-medium flex items-center gap-2">
                          <span
                            className={`size-3 rounded-full ${
                              detail.status === "active"
                                ? "bg-primary"
                                : detail.status === "away"
                                  ? "bg-yellow-500"
                                  : "bg-destructive"
                            }`}
                          />
                          {statusLabel[detail.status] ?? detail.status}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Projects where this user is the stakeholder — always renders */}
                    <UserProjects userId={detail.id} />

                    {/* The sections below each manage their own leading <Separator />.
                        They render nothing (null) when the user has no data for that
                        category, keeping the sheet clean.                           */}

                    {/* Tasks assigned to this user */}
                    <UserTaskAssignments userId={detail.id} />

                    {/* Help requests submitted by this user (they are the requester) */}
                    <UserRequestedHelpRequests userId={detail.id} />

                    {/* Help requests where this user is the assigned helper */}
                    <UserHelperHelpRequests userId={detail.id} />

                    {/* Support tickets submitted by this user */}
                    <UserRequestedTickets userId={detail.id} />

                    {/* Support tickets currently assigned to this user */}
                    <UserAssignedTickets userId={detail.id} />

                    <Separator />

                    {/* Edit User button — only shown when onEdit is provided AND
                        the current user holds the "edit users" permission */}
                    {onEdit && canEditUsers && (
                      <Button variant="secondary" size="lg" className="w-full" onClick={() => onEdit(detail)}>
                        <Pencil />
                        Edit User
                      </Button>
                    )}
                  </TabsContent>

                  {/* ── Roles & Permissions tab ──────────────────────────────── */}
                  <TabsContent value="roles" className="pt-4">
                    {/* Pass canEdit so UserRolesPermissions can guard its save buttons */}
                    <UserRolesPermissions userId={detail.id} canEdit={canEditUsers} />
                  </TabsContent>
                </Tabs>
              </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
