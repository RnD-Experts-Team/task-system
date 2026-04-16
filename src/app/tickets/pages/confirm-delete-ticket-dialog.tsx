import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
// Use the API-aligned type instead of the old mock Ticket type
import type { ApiTicket } from "@/app/tickets/types"

type ConfirmDeleteTicketDialogProps = {
  ticket: ApiTicket | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ConfirmDeleteTicketDialog({
  ticket,
  open,
  onOpenChange,
  onConfirm,
}: ConfirmDeleteTicketDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            {/* ticket.id is now a number from the backend */}
            <span className="font-semibold text-foreground">
              {ticket ? `#${ticket.id}` : "this ticket"}
            </span>?{" "}
            This action is permanent and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

