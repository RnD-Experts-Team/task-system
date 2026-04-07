import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ArrowLeft, Plus, X } from "lucide-react"
import type { Task, TaskFormData, TaskPriority, TaskStatus } from "@/app/tasks/data"
import { projectOptions, sectionOptions } from "@/app/tasks/data"

type TaskFormProps = {
  mode: "create" | "edit"
  initialData?: Task | null
  onSubmit: (data: TaskFormData) => void
  onCancel: () => void
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "Todo" },
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
]

const priorityOptions: TaskPriority[] = ["low", "medium", "high", "critical"]

export function TaskForm({ mode, initialData, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [status, setStatus] = useState<TaskStatus>(initialData?.status ?? "todo")
  const [priority, setPriority] = useState<TaskPriority>(initialData?.priority ?? "medium")
  const [project, setProject] = useState(initialData?.project ?? "")
  const [section, setSection] = useState(initialData?.section ?? "")
  const [weight, setWeight] = useState(initialData?.weight ?? 50)
  const [dueDate, setDueDate] = useState(initialData?.dueDate ?? "")
  const [subtaskInput, setSubtaskInput] = useState("")
  const [subtasks, setSubtasks] = useState(
    initialData?.subtasks ?? []
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const next: Record<string, string> = {}
    if (!title.trim()) next.title = "Task name is required"
    if (!project) next.project = "Project is required"
    if (!dueDate) next.dueDate = "Due date is required"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      title,
      description,
      status,
      priority,
      project,
      section,
      weight,
      dueDate,
      assignees: initialData?.assignees ?? [],
      subtasks,
    })
  }

  function handleAddSubtask() {
    if (!subtaskInput.trim()) return
    setSubtasks((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, title: subtaskInput.trim(), completed: false },
    ])
    setSubtaskInput("")
  }

  function handleRemoveSubtask(id: string) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className="flex w-full justify-center p-4 md:p-8">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon-lg" onClick={onCancel}>
              <ArrowLeft />
            </Button>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {mode === "create" ? "Create Task" : "Edit Task"}
                </h2>
                <Badge variant="secondary" className="uppercase tracking-wider">
                  {mode}
                </Badge>
              </div>
              <p className="text-sm md:text-lg text-muted-foreground max-w-2xl">
                {mode === "create"
                  ? "Create a task with subtasks and user assignments."
                  : `Update details for ${initialData?.title ?? "this task"}.`}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Task Details */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold uppercase tracking-widest text-muted-foreground">
                Task Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Task Name - full width */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="title">Task Name *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Implement darkroom shader"
                    className="h-12 text-sm"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                {/* Project */}
                <div className="space-y-2">
                  <Label>Project *</Label>
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectOptions.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.project && (
                    <p className="text-sm text-destructive">{errors.project}</p>
                  )}
                </div>

                {/* Section */}
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Select value={section} onValueChange={setSection}>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sectionOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Weight */}
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight *</Label>
                  <Input
                    id="weight"
                    type="number"
                    min={1}
                    max={100}
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="h-12 text-sm"
                  />
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-12 text-sm"
                  />
                  {errors.dueDate && (
                    <p className="text-sm text-destructive">{errors.dueDate}</p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="md:col-span-2 space-y-2">
                  <Label>Priority *</Label>
                  <ToggleGroup
                    type="single"
                    variant="outline"
                    value={priority}
                    onValueChange={(v) => {
                      if (v) setPriority(v as TaskPriority)
                    }}
                    className="justify-start"
                  >
                    {priorityOptions.map((p) => (
                      <ToggleGroupItem key={p} value={p} className="capitalize">
                        {p}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>

                {/* Description - full width */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Briefly describe the task objectives..."
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                </div>
              </div>
            </section>

            <Separator />

            {/* Subtasks */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Subtasks ({subtasks.length})
                </h3>
              </div>

              <div className="flex gap-2">
                <Input
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  placeholder="Add a subtask..."
                  className="h-10 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddSubtask()
                    }
                  }}
                />
                <Button type="button" variant="secondary" size="sm" onClick={handleAddSubtask}>
                  <Plus className="size-4" />
                  Add
                </Button>
              </div>

              {subtasks.length > 0 ? (
                <div className="space-y-2">
                  {subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <span className="text-sm flex-1">{subtask.title}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleRemoveSubtask(subtask.id)}
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-muted rounded-xl">
                  <p className="text-sm text-muted-foreground">No subtasks added yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Break down this task into smaller components.
                  </p>
                </div>
              )}
            </section>

            <Separator />

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" size="lg" onClick={onCancel}>
                Discard
              </Button>
              <Button type="submit" size="lg">
                {mode === "create" ? "Create Task" : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
