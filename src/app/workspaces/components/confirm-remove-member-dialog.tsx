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
import type { WorkspaceMember } from "../types"

type Props = {
  /** The member to remove — used to show their name in the confirmation */
  member: WorkspaceMember | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called when the user confirms removal */
  onConfirm: () => void
  submitting?: boolean
  /** Error message returned by the API after a failed removal */
  submitError?: string | null
}

/**
 * ConfirmRemoveMemberDialog — asks the user to confirm removing a member.
 * Maps to DELETE /workspaces/{workspaceId}/users/{userId}.
 */
export function ConfirmRemoveMemberDialog({
  member,
  open,
  onOpenChange,
  onConfirm,
  submitting = false,
  submitError,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove{" "}
            <span className="font-semibold text-foreground">{member?.name}</span> from
            this workspace? They will lose access immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* API error — shown if the removal fails */}
        {submitError && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={submitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
