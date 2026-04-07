import { useState } from "react"
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
import { ArrowLeft } from "lucide-react"
import type {
  Ticket,
  TicketFormData,
  TicketStatus,
  TicketPriority,
  TicketType,
} from "@/app/tickets/data"
import { ticketUsers } from "@/app/tickets/data"

type TicketFormProps = {
  mode: "create" | "edit"
  initialData?: Ticket | null
  onSubmit: (data: TicketFormData) => void
  onCancel: () => void
}

const statusOptions: { value: TicketStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "closed", label: "Closed" },
]

const priorityOptions: { value: TicketPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
]

const typeOptions: { value: TicketType; label: string }[] = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "task", label: "Task" },
  { value: "support", label: "Support" },
]

export function TicketForm({ mode, initialData, onSubmit, onCancel }: TicketFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [type, setType] = useState<TicketType>(initialData?.type ?? "bug")
  const [status, setStatus] = useState<TicketStatus>(initialData?.status ?? "open")
  const [priority, setPriority] = useState<TicketPriority>(initialData?.priority ?? "medium")
  const [requesterId, setRequesterId] = useState(initialData?.requester.id ?? "")
  const [assigneeId, setAssigneeId] = useState<string>(initialData?.assignee?.id ?? "")
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const next: Record<string, string> = {}
    if (!title.trim()) next.title = "Title is required"
    if (!description.trim()) next.description = "Description is required"
    if (!requesterId) next.requesterId = "Requester is required"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      title,
      description,
      type,
      status,
      priority,
      requesterId,
      assigneeId: assigneeId || null,
    })
  }

  return (
    <div className="flex w-full justify-center p-4 md:p-8">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <ArrowLeft />
            </Button>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {mode === "create" ? "Create Ticket" : "Edit Ticket"}
                </h2>
                <Badge variant="secondary" className="uppercase tracking-wider">
                  {mode}
                </Badge>
              </div>
              <p className="text-sm md:text-lg text-muted-foreground max-w-2xl">
                {mode === "create"
                  ? "Submit a new ticket to track an issue, feature, or task."
                  : "Update the details for this ticket."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Ticket Details */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold uppercase tracking-widest text-muted-foreground">
                Ticket Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title — full width */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief summary of the issue or request..."
                    className="h-12"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title}</p>
                  )}
                </div>

                {/* Description — full width */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide full details about the ticket..."
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as TicketType)}>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus)}>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* People */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold uppercase tracking-widest text-muted-foreground">
                People
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Requester */}
                <div className="space-y-2">
                  <Label>Requester *</Label>
                  <Select value={requesterId} onValueChange={setRequesterId}>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Select Requester" />
                    </SelectTrigger>
                    <SelectContent>
                      {ticketUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.requesterId && (
                    <p className="text-sm text-destructive">{errors.requesterId}</p>
                  )}
                </div>

                {/* Assignee */}
                <div className="space-y-2">
                  <Label>Assignee</Label>
                  <Select
                    value={assigneeId}
                    onValueChange={(v) => setAssigneeId(v === "none" ? "" : v)}
                  >
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {ticketUsers.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" size="lg">
                {mode === "create" ? "Create Ticket" : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
