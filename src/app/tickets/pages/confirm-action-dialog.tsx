// ─── Confirm Action Dialog ────────────────────────────────────────────────────
// Reusable confirmation dialog for ticket quick actions like:
//   - Complete (POST /tickets/{id}/complete)
//   - Unassign (POST /tickets/{id}/unassign)
//   - Claim   (POST /tickets/{id}/claim)
// Shows a title, description, and confirm/cancel buttons.

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

type ConfirmActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called when user clicks the confirm button */
  onConfirm: () => void
  title: string
  description: string
  /** Label for the confirm button (default: "Confirm") */
  confirmLabel?: string
  /** Variant for the confirm button */
  confirmVariant?: "default" | "destructive"
  /** True while the action is in-flight — disables buttons */
  submitting?: boolean
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  confirmVariant = "default",
  submitting = false,
}: ConfirmActionDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? "Processing…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
