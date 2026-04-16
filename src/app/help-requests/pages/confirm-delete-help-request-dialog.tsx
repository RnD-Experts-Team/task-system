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
import { Loader2 } from "lucide-react"
// Use API-aligned type instead of mock data type
import type { HelpRequest } from "@/app/help-requests/types"

type ConfirmDeleteHelpRequestDialogProps = {
  request: HelpRequest | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  /** Shows a spinner on the delete button while the API call is in-flight */
  confirming?: boolean
}

export function ConfirmDeleteHelpRequestDialog({
  request,
  open,
  onOpenChange,
  onConfirm,
  confirming = false,
}: ConfirmDeleteHelpRequestDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Help Request</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this help request from{" "}
            <span className="font-semibold text-foreground">{request?.requester.name}</span>?
            This action is permanent and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Prevent closing while delete is in-flight */}
          <AlertDialogCancel disabled={confirming}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
            disabled={confirming}
          >
            {confirming && <Loader2 className="size-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
