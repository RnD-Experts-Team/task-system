import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, AlertCircle } from "lucide-react"
import type { Workspace } from "../types"

// Validation schema — matches backend rules: name required, description optional
const workspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(255),
  description: z.string().nullable(),
})

export type WorkspaceFormValues = z.infer<typeof workspaceSchema>

type WorkspaceFormProps = {
  mode: "create" | "edit"
  workspace?: Workspace | null
  submitting?: boolean
  submitError?: string | null
  onSubmit: (data: WorkspaceFormValues) => void
  onCancel: () => void
}

/**
 * WorkspaceForm — shared form for creating and editing workspaces.
 * Only name (required) and description (optional) — matching the API payload.
 */
export function WorkspaceForm({
  mode,
  workspace,
  submitting = false,
  submitError,
  onSubmit,
  onCancel,
}: WorkspaceFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: workspace?.name ?? "",
      description: workspace?.description ?? "",
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Show API error message if present */}
      {submitError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          {submitError}
        </div>
      )}

      {/* Name field — required, max 255 chars */}
      <div className="space-y-2">
        <Label htmlFor="name">Workspace Name *</Label>
        <Input
          id="name"
          placeholder="e.g. Brand Identity Lab"
          disabled={submitting}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Description field — optional, nullable */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe the purpose of this workspace..."
          className="min-h-24"
          disabled={submitting}
          {...register("description")}
        />
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {mode === "create" ? "Create Workspace" : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
