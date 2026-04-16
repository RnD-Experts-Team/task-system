// ─── Assign Ticket Dialog ─────────────────────────────────────────────────────
// Modal dialog for assigning a ticket to a specific user.
// Calls POST /tickets/{id}/assign/{userId} via the store action.
// Loads the users list from GET /users when opened.

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AlertCircle } from "lucide-react"
// Users service provides the list for the dropdown
import { usersService } from "@/services/usersService"
import type { ApiTicket } from "@/app/tickets/types"

type AssignTicketDialogProps = {
  /** The ticket being assigned; null means the dialog is closed */
  ticket: ApiTicket | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with the selected user ID when the user clicks Assign */
  onAssign: (ticket: ApiTicket, userId: number) => void
  /** Whether the assign action is in-flight (disables buttons) */
  submitting?: boolean
  /** Error message from a failed assign attempt */
  error?: string | null
}

export function AssignTicketDialog({
  ticket,
  open,
  onOpenChange,
  onAssign,
  submitting = false,
  error,
}: AssignTicketDialogProps) {
  // Selected user ID (stored as string for the Select component)
  const [selectedUserId, setSelectedUserId] = useState("")

  // Users fetched from GET /users for the dropdown
  const [users,        setUsers]        = useState<{ id: number; name: string; email: string; avatarUrl?: string }[]>([])
  const [usersLoading, setUsersLoading] = useState(false)

  // Fetch users whenever the dialog opens
  useEffect(() => {
    if (!open) return
    let cancelled = false

    setUsersLoading(true)
    // We fetch a larger per_page or just page 1 for the dropdown.
    // If the backend doesn't support per_page, it might only return 15.
    usersService
      .getAll(1)
      .then(({ users: list }) => {
        if (!cancelled) {
          // usersService.getAll maps id to string; convert back to number for the API
          // Ensure avatarUrl null becomes undefined to match the component state type
          setUsers(list.map((u) => ({ id: parseInt(u.id, 10), name: u.name, email: u.email, avatarUrl: u.avatarUrl ?? undefined })))
        }
      })
      .catch(() => {
        // Non-critical — dropdown stays empty and the user sees the skeleton
      })
      .finally(() => { if (!cancelled) setUsersLoading(false) })

    return () => { cancelled = true }
  }, [open])

  // Pre-select the current assignee so the user sees who's already assigned
  useEffect(() => {
    if (open && ticket?.assigned_to != null) {
      setSelectedUserId(String(ticket.assigned_to))
    } else if (!open) {
      setSelectedUserId("")
    }
  }, [open, ticket])

  function handleConfirm() {
    if (!ticket || !selectedUserId) return
    onAssign(ticket, parseInt(selectedUserId, 10))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-6 p-6 rounded-2xl border-border/50 shadow-2xl">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-xl tracking-tight">Assign Ticket</DialogTitle>
          <DialogDescription className="text-[15px]">
            {ticket
              ? `Select a user to assign ticket #${ticket.id} to.`
              : "Select a user to assign this ticket to."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assign To</Label>
            {usersLoading ? (
              <Skeleton className="h-12 w-full rounded-xl" />
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger className="w-full h-12 rounded-xl transition-shadow focus:ring-primary/20 [&>span]:w-full">
                  <SelectValue placeholder={<span className="text-muted-foreground ml-1">Select a user...</span>} />
                </SelectTrigger>
                <SelectContent className="rounded-xl max-h-[300px]">
                  {users.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)} className="rounded-lg cursor-pointer">
                      <div className="flex items-center gap-3 py-1">
                        <Avatar className="h-8 w-8 border ring-1 ring-border">
                          {u.avatarUrl ? (
                            <AvatarImage src={u.avatarUrl} alt={u.name} />
                          ) : null}
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium tracking-tight uppercase">
                            {u.name.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium leading-none mb-1 text-foreground">{u.name}</span>
                          <span className="text-xs text-muted-foreground leading-none">{u.email}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Error banner for failed assign attempts */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="rounded-xl h-11 px-5 border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedUserId || submitting || usersLoading}
            className="rounded-xl h-11 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all font-medium"
          >
            {submitting ? "Assigning..." : "Assign"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
