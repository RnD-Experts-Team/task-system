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
import { AlertCircle, Loader2 } from "lucide-react"
import type { WorkspaceTodo } from "../types"

type Props = {
  todo: WorkspaceTodo | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  submitting?: boolean
  // Server-side error to show inside the dialog
  submitError?: string | null
}

export function ConfirmDeleteTodoDialog({
  todo,
  open,
  onOpenChange,
  onConfirm,
  submitting = false,
  submitError,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg">Delete Todo</AlertDialogTitle>
          <AlertDialogDescription className="text-sm mt-1.5">
            Are you sure you want to delete the todo{" "}
            <span className="font-semibold text-foreground">"{todo?.title}"</span>?
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {/* Show server error if the delete fails */}
        {submitError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel disabled={submitting} className="min-w-20">Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={submitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 min-w-28"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
