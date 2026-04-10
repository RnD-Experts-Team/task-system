import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import type { Project } from "../types"

// Validation schema for project form
const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().nullable(),
  stakeholder_will_rate: z.boolean(),
})

export type ProjectFormValues = z.infer<typeof projectSchema>

type ProjectFormProps = {
  mode: "create" | "edit"
  project?: Project | null
  submitting?: boolean
  onSubmit: (data: ProjectFormValues) => void
  onCancel: () => void
}

// Reusable form for creating and editing projects
export function ProjectForm({ mode, project, submitting = false, onSubmit, onCancel }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      stakeholder_will_rate: project?.stakeholder_will_rate ?? false,
    },
  })

  const stakeholderWillRate = watch("stakeholder_will_rate")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Project Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Project Name *</Label>
        <Input
          id="name"
          placeholder="e.g. Website Redesign"
          disabled={submitting}
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Project description..."
          className="min-h-24"
          disabled={submitting}
          {...register("description")}
        />
      </div>

      {/* Stakeholder Will Rate */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="stakeholder_will_rate">Stakeholder Will Rate</Label>
          <p className="text-sm text-muted-foreground">
            Enable if stakeholders should rate this project
          </p>
        </div>
        <Switch
          id="stakeholder_will_rate"
          checked={stakeholderWillRate}
          onCheckedChange={(checked) => setValue("stakeholder_will_rate", checked)}
          disabled={submitting}
        />
      </div>

      {/* Actions */}
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
          {mode === "create" ? "Create Project" : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
