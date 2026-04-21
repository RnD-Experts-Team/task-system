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
import type { ApiFinalRatingConfig } from "@/app/ratings/final-ratings/types"

// ─── Props ────────────────────────────────────────────────────────────────────

type ConfirmDeleteFinalRatingDialogProps = {
  /** The config to delete; null when the dialog is closed */
  config: ApiFinalRatingConfig | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called when the user confirms deletion (API call happens in parent via the hook) */
  onConfirm: () => void
  /** Shows a spinner on the Delete button while the DELETE request is in flight */
  deleting?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ConfirmDeleteFinalRatingDialog({
  config,
  open,
  onOpenChange,
  onConfirm,
  deleting = false,
}: ConfirmDeleteFinalRatingDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Configuration</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{config?.name}</span>? This action is
            permanent and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Prevent closing while delete is in progress */}
          <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
            {deleting ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
