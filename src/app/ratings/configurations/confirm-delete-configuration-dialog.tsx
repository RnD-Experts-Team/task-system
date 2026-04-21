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
// Use the real API type instead of the legacy local Configuration type
import type { ApiRatingConfig } from "@/app/ratings/configurations/types"

type ConfirmDeleteConfigurationDialogProps = {
  /** The config to delete; null when dialog is closed */
  configuration: ApiRatingConfig | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called when the user confirms deletion (API call happens in parent) */
  onConfirm: () => void
  /** Shows a spinner on the Delete button while the API request is in flight */
  deleting?: boolean
}

export function ConfirmDeleteConfigurationDialog({
  configuration,
  open,
  onOpenChange,
  onConfirm,
  deleting = false,
}: ConfirmDeleteConfigurationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Configuration</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{configuration?.name}</span>? This
            action is permanent and cannot be undone. All associated rating fields will be removed.
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
            {deleting ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

