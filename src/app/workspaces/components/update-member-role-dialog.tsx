import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import type { WorkspaceMember, UpdateMemberRolePayload } from "../types"

// ─── Validation schema ────────────────────────────────────────────
// Only viewer or editor are assignable — owner cannot be set via API
const schema = z.object({
  role: z.enum(["viewer", "editor"] as const, { message: "Role is required" }),
})

type FormValues = z.infer<typeof schema>

type Props = {
  /** The member whose role is being updated */
  member: WorkspaceMember | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with the new role payload when the form is submitted */
  onSubmit: (payload: UpdateMemberRolePayload) => void
  submitting?: boolean
  /** Error returned by the API — shown below the form */
  submitError?: string | null
}

/**
 * UpdateMemberRoleDialog — dialog for changing a member's role.
 * Pre-fills with the member's current role.
 * Maps to PUT /workspaces/{workspaceId}/users/{userId}/role.
 */
export function UpdateMemberRoleDialog({
  member,
  open,
  onOpenChange,
  onSubmit,
  submitting = false,
  submitError,
}: Props) {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      // Pre-fill with the member's current role (defaults to viewer if owner)
      role: member?.pivot.role === "owner" ? "viewer" : (member?.pivot.role ?? "viewer"),
    },
  })

  // Sync the default role when the member changes (e.g., opening for a different member)
  useEffect(() => {
    if (member) {
      reset({
        role: member.pivot.role === "owner" ? "viewer" : member.pivot.role,
      })
    }
  }, [member, reset])

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen) reset()
    onOpenChange(isOpen)
  }

  function handleFormSubmit(values: FormValues) {
    onSubmit({ role: values.role })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-border/60">
          <DialogHeader>
            <DialogTitle className="text-lg">Change Role</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-0.5">
              Update the role for{" "}
              <span className="font-semibold text-foreground">{member?.name}</span>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-0">
          <div className="px-6 py-5 space-y-4">
            {/* Role selector — owner cannot be assigned via the API */}
            <div className="space-y-2">
              <Label htmlFor="update-role-select">New role</Label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={submitting}
                  >
                    <SelectTrigger id="update-role-select" className="w-full h-auto min-h-[4rem] text-left px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors border-border/60">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer" className="py-3 px-4 cursor-pointer">
                        <div className="flex flex-col items-start text-left gap-1">
                          <span className="font-medium text-foreground text-sm">Viewer</span>
                          <span className="text-sm text-muted-foreground leading-snug">Can view workspace content</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="editor" className="py-3 px-4 cursor-pointer mt-1">
                        <div className="flex flex-col items-start text-left gap-1">
                          <span className="font-medium text-foreground text-sm">Editor</span>
                          <span className="text-sm text-muted-foreground leading-snug">Can edit and manage content</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-xs text-destructive">{errors.role.message}</p>
              )}
            </div>

            {/* API error — shown if the role update fails */}
            {submitError && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
          </div>

          {/* Footer with Cancel and Submit actions */}
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/60 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={submitting}
              className="min-w-20"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="min-w-28">
              {submitting && <Loader2 className="size-4 animate-spin" />}
              Save Role
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
