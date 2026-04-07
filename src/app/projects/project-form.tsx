import { useState } from "react"
import { useForm, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import type { Project, ProjectStatus, ProjectPriority } from "@/app/projects/data"

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").min(3, "Name must be at least 3 characters"),
  description: z.string(),
  category: z.string(),
  status: z.enum(["active", "in-review", "paused", "completed"]),
  priority: z.enum(["high", "medium", "low"]),
  deadline: z.string(),
  progress: z.coerce.number().min(0).max(100),
})

export type ProjectFormValues = z.infer<typeof projectSchema>

type ProjectFormProps = {
  mode: "create" | "edit"
  project?: Project | null
  onSubmit: (data: ProjectFormValues) => Promise<void> | void
  onCancel: () => void
  isLoading?: boolean
}

const statuses: { value: ProjectStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "in-review", label: "In Review" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
]

const priorities: { value: ProjectPriority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
]

export function ProjectForm({ mode, project, onSubmit, onCancel, isLoading = false }: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema) as Resolver<ProjectFormValues>,
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      category: project?.category ?? "",
      status: project?.status ?? "active",
      priority: project?.priority ?? "medium",
      deadline: project?.deadline ?? "",
      progress: project?.progress ?? 0,
    },
  })

  const progress = watch("progress")
  const status = watch("status")
  const priority = watch("priority")

  async function handleFormSubmit(data: ProjectFormValues) {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      toast.success(`Project ${mode === "create" ? "created" : "updated"} successfully`)
    } catch (error) {
      toast.error(`Failed to ${mode === "create" ? "create" : "update"} project`)
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="size-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full justify-center p-4 md:p-8">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6 md:p-8">
          {/* Header (moved inside card to match Users layout) */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon-lg" onClick={onCancel}>
              <ArrowLeft className="size-4" />
            </Button>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {mode === "create" ? "Create Project" : "Edit Project"}
                </h2>
                <Badge variant="secondary" className="uppercase tracking-wider">
                  {mode}
                </Badge>
              </div>
              <p className="text-sm md:text-lg text-muted-foreground max-w-2xl">
                {mode === "create"
                  ? "Initialize a new project with core parameters."
                  : `Update details for ${project?.name ?? "this project"}.`}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Project Title *</Label>
              <Input
                id="name"
                placeholder="e.g. Q4 Brand Evolution"
                className="h-12"
                disabled={isSubmitting}
                {...register("name")}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Project description and objectives..."
                className="w-full min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting}
                {...register("description")}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g. Design System • Q4 Goal"
                className="h-12"
                disabled={isSubmitting}
                {...register("category")}
              />
            </div>

            {/* Grid: Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={status} onValueChange={(v) => setValue("status", v as ProjectStatus)}>
                  <SelectTrigger id="status" className="h-12" disabled={isSubmitting}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select value={priority} onValueChange={(v) => setValue("priority", v as ProjectPriority)}>
                  <SelectTrigger id="priority" className="h-12" disabled={isSubmitting}>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Deadline */}
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="text"
                placeholder="e.g. Mar 30, 2024"
                className="h-12"
                disabled={isSubmitting}
                {...register("deadline")}
              />
            </div>

            {/* Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="progress">Initial Progress</Label>
                <span className="text-sm font-bold text-primary">{progress}%</span>
              </div>
              <input
                id="progress"
                type="range"
                min={0}
                max={100}
                disabled={isSubmitting}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                {...register("progress", { valueAsNumber: true })}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                {mode === "create" ? "Create Project" : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
