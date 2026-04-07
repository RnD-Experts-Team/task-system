import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import type { Project, ProjectStatus, ProjectPriority } from "@/app/projects/data"

type ProjectFormProps = {
  mode: "create" | "edit"
  initialData?: Project | null
  onSubmit: (data: ProjectFormData) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export type ProjectFormData = {
  name: string
  description: string
  category: string
  status: ProjectStatus
  priority: ProjectPriority
  progress: number
  deadline: string
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

export function ProjectForm({
  mode,
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: ProjectFormProps) {
  const [name, setName] = useState(initialData?.name ?? "")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [category, setCategory] = useState(initialData?.category ?? "")
  const [status, setStatus] = useState<ProjectStatus>(initialData?.status ?? "active")
  const [priority, setPriority] = useState<ProjectPriority>(initialData?.priority ?? "medium")
  const [progress, setProgress] = useState(initialData?.progress ?? 0)
  const [deadline, setDeadline] = useState(initialData?.deadline ?? "")
  const [errors, setErrors] = useState<{ name?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setDescription(initialData.description)
      setCategory(initialData.category)
      setStatus(initialData.status)
      setPriority(initialData.priority)
      setProgress(initialData.progress)
      setDeadline(initialData.deadline)
    }
  }, [initialData])

  function validate(): boolean {
    const next: { name?: string } = {}
    if (!name.trim()) next.name = "Project name is required"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    
    setIsSubmitting(true)
    try {
      await onSubmit({
        name,
        description,
        category,
        status,
        priority,
        progress,
        deadline,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormDisabled = isSubmitting || isLoading

  return (
    <div className="flex w-full justify-center p-4 md:p-8">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={onCancel}
              disabled={isFormDisabled}
            >
              <ArrowLeft />
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
                  : `Update details for ${initialData?.name ?? "this project"}.`}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Project Title */}
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Title</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Q4 Brand Evolution"
                disabled={isFormDisabled}
                className="h-12 text-sm"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="project-category">Category</Label>
              <Input
                id="project-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Design System • Q4 Goal"
                disabled={isFormDisabled}
                className="h-12 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => setStatus(v as ProjectStatus)}
                  disabled={isFormDisabled}
                >
                  <SelectTrigger className="w-full h-12">
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

              {/* Priority */}
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(v) => setPriority(v as ProjectPriority)}
                  disabled={isFormDisabled}
                >
                  <SelectTrigger className="w-full h-12">
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
              <Label htmlFor="project-deadline">Deadline</Label>
              <Input
                id="project-deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="e.g. Mar 30, 2024"
                disabled={isFormDisabled}
                className="h-12 text-sm"
              />
            </div>

            {/* Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Initial Progress</Label>
                <span className="text-sm font-bold text-primary">{progress}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                disabled={isFormDisabled}
                className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary disabled:opacity-50"
              />
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="project-description">Project Description</Label>
              <textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Outline the core objectives and expected deliverables..."
                disabled={isFormDisabled}
                rows={4}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isFormDisabled}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={isFormDisabled}
              >
                {isSubmitting ? "Saving..." : mode === "create" ? "Create Project" : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
