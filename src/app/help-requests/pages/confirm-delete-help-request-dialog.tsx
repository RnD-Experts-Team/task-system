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
import type { HelpRequest } from "@/app/help-requests/data"

type ConfirmDeleteHelpRequestDialogProps = {
  request: HelpRequest | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function ConfirmDeleteHelpRequestDialog({
  request,
  open,
  onOpenChange,
  onConfirm,
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
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
