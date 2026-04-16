// ─── AssignHelpRequestDialog ──────────────────────────────────────────────────
// Dialog that lets an admin assign a specific user as the helper for a help request.
// Calls POST /help-requests/{id}/assign/{userId} on confirm.
// Fetches the user list from GET /users on open to populate the selector.
//
// Props:
//   request  — the help request being assigned (used only to show the description)
//   open     — controls dialog visibility
//   onOpenChange — called when the dialog should open/close
//   onAssign — called with (requestId, userId) when the user confirms; parent triggers the API call

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle, Loader2, Search, UserCheck } from "lucide-react"
// usersService.getAll() returns the paginated list of users from GET /users
import { usersService } from "@/services/usersService"
import type { User } from "@/app/users/data"
import type { HelpRequest } from "@/app/help-requests/types"

type AssignHelpRequestDialogProps = {
  request: HelpRequest | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called when the user confirms; parent should call assignHelpRequest(requestId, userId) */
  onAssign: (requestId: number, userId: number) => Promise<void>
  /** True while the assign API call is in-flight — disables buttons */
  assigning?: boolean
}

// Extract two uppercase initials from a full name (for avatar fallback)
function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export function AssignHelpRequestDialog({
  request,
  open,
  onOpenChange,
  onAssign,
  assigning = false,
}: AssignHelpRequestDialogProps) {
  // ── Local state ────────────────────────────────────────────────────────────
  const [users, setUsers]             = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userError, setUserError]     = useState<string | null>(null)
  const [search, setSearch]           = useState("")
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  // ── Fetch users when dialog opens ──────────────────────────────────────────
  // We load all users (page 1, default per_page) so the list is available immediately.
  // The list is short enough that client-side filtering is sufficient.
  useEffect(() => {
    if (!open) {
      // Reset selections when the dialog closes
      setSearch("")
      setSelectedUserId(null)
      return
    }
    setLoadingUsers(true)
    setUserError(null)
    usersService.getAll(1)
      .then(({ users: list }) => setUsers(list))
      .catch(() => setUserError("Failed to load users."))
      .finally(() => setLoadingUsers(false))
  }, [open])

  // ── Client-side search filter ─────────────────────────────────────────────
  // Filters by name or email; applied instantly without an API call.
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase()
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
  })

  // ── Handle confirm ────────────────────────────────────────────────────────
  async function handleConfirm() {
    if (!request || selectedUserId === null) return
    await onAssign(request.id, selectedUserId)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[480px] p-4 md:p-6 rounded-2xl md:rounded-3xl border border-border/40 shadow-xl bg-background/95 backdrop-blur">
        <DialogHeader className="space-y-3 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <UserCheck className="size-5" />
            Assign Help Request
          </DialogTitle>
          {/* Show a short excerpt of the request description for context */}
          {request && (
            <DialogDescription className="text-left text-sm sm:text-base text-foreground/80 leading-relaxed font-medium">
              {request.description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* ── User search container ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-border/50 bg-card overflow-hidden my-4 shadow-sm flex flex-col h-[350px]">
          {/* Search Header */}
          <div className="relative border-b border-border/50 bg-background/40">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground/70" />
            <Input
              placeholder="Search users..."
              className="pl-11 border-0 rounded-none bg-transparent h-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* ── User list ────────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            {/* Loading skeleton while users are being fetched */}
            {loadingUsers && (
              <div className="flex items-center justify-center h-full gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <span>Loading users...</span>
              </div>
            )}

            {/* Error message if the users fetch fails */}
            {!loadingUsers && userError && (
              <div className="flex items-center justify-center h-full gap-2 p-4 text-sm text-destructive bg-destructive/5 m-4 rounded-xl">
                <AlertCircle className="size-5 shrink-0" />
                {userError}
              </div>
            )}

            {/* Empty state when search yields no results */}
            {!loadingUsers && !userError && filteredUsers.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground space-y-2">
                <Search className="size-8 opacity-20" />
                <p className="text-sm">No users found.</p>
              </div>
            )}

            {/* User items */}
            <div className="flex flex-col p-2 space-y-1">
              {!loadingUsers && !userError && filteredUsers.map((user) => {
                const userId = parseInt(user.id, 10)
                const isSelected = selectedUserId === userId
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => setSelectedUserId(userId)}
                    className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-all rounded-xl border border-transparent
                      ${isSelected 
                        ? "bg-accent/40 border-accent/60 shadow-sm" 
                        : "hover:bg-accent/20"
                      }
                    `}
                  >
                    <Avatar className="size-11 shrink-0 ring-1 ring-border/50">
                      <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                      <AvatarFallback className="text-sm font-medium bg-muted text-muted-foreground">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className={`text-base font-semibold truncate transition-colors ${isSelected ? "text-foreground" : "text-foreground/90"}`}>
                        {user.name}
                      </p>
                      <p className="text-sm text-muted-foreground/80 truncate">{user.email}</p>
                    </div>
                    {/* Checkmark indicator for the selected user */}
                    <div className={`shrink-0 transition-opacity duration-200 ${isSelected ? "opacity-100" : "opacity-0"}`}>
                      <div className="bg-primary/10 p-1.5 rounded-full">
                        <UserCheck className="size-4 text-primary" />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 sm:pt-6">
          {/* Cancel — disabled while assigning */}
          <Button variant="ghost" className="rounded-full px-6" onClick={() => onOpenChange(false)} disabled={assigning}>
            Cancel
          </Button>
          {/* Confirm — disabled until a user is selected or while in-flight */}
          <Button
            variant="destructive"
            className="rounded-full px-6"
            onClick={handleConfirm}
            disabled={selectedUserId === null || assigning}
          >
            {assigning && <Loader2 className="size-4 animate-spin mr-2" />}
            Assign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
