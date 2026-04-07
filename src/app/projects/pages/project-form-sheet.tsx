import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Project, ProjectStatus, ProjectPriority } from "@/app/projects/data"

type ProjectFormSheetProps = {
  mode: "create" | "edit"
  project?: Project | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ProjectFormData) => void
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

export function ProjectFormSheet({ mode, project, open, onOpenChange, onSubmit }: ProjectFormSheetProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [status, setStatus] = useState<ProjectStatus>("active")
  const [priority, setPriority] = useState<ProjectPriority>("medium")
  const [progress, setProgress] = useState(0)
  const [deadline, setDeadline] = useState("")
  const [errors, setErrors] = useState<{ name?: string }>({})

  useEffect(() => {
    if (open) {
      if (mode === "edit" && project) {
        setName(project.name)
        setDescription(project.description)
        setCategory(project.category)
        setStatus(project.status)
        setPriority(project.priority)
        setProgress(project.progress)
        setDeadline(project.deadline)
      } else {
        setName("")
        setDescription("")
        setCategory("")
        setStatus("active")
        setPriority("medium")
        setProgress(0)
        setDeadline("")
      }
      setErrors({})
    }
  }, [open, mode, project])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const next: { name?: string } = {}
    if (!name.trim()) next.name = "Project name is required"
    setErrors(next)
    if (Object.keys(next).length > 0) return
    onSubmit({ name, description, category, status, priority, progress, deadline })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl overflow-y-auto">
        <SheetHeader className="gap-2">
          <div className="flex items-center gap-3">
            <SheetTitle className="text-2xl">
              {mode === "create" ? "Create Project" : "Edit Project"}
            </SheetTitle>
            <Badge variant="secondary" className="uppercase tracking-wider">
              {mode}
            </Badge>
          </div>
          <SheetDescription>
            {mode === "create"
              ? "Initialize a new project with core parameters."
              : `Update details for ${project?.name ?? "this project"}.`}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="px-8 pb-10 space-y-8">
          {/* Project Title */}
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Title</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q4 Brand Evolution"
              className="h-12 text-sm"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="project-category">Category</Label>
            <Input
              id="project-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Design System • Q4 Goal"
              className="h-12 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
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
              <Select value={priority} onValueChange={(v) => setPriority(v as ProjectPriority)}>
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
              className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
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
              rows={4}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            />
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Discard
            </Button>
            <Button type="submit" size="lg">
              {mode === "create" ? "Create Project" : "Save Changes"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
