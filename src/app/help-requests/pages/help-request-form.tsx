import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { ArrowLeft, Star } from "lucide-react"
import type { HelpRequest, HelpRequestFormData, HelpRequestStatus } from "@/app/help-requests/data"
import { users } from "@/app/help-requests/data"

type HelpRequestFormProps = {
  mode: "create" | "edit"
  initialData?: HelpRequest | null
  onSubmit: (data: HelpRequestFormData) => void
  onCancel: () => void
}

const statusOptions: { value: HelpRequestStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "claimed", label: "Claimed" },
  { value: "completed", label: "Completed" },
]

export function HelpRequestForm({ mode, initialData, onSubmit, onCancel }: HelpRequestFormProps) {
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [requesterId, setRequesterId] = useState(initialData?.requester.id ?? "")
  const [helperId, setHelperId] = useState<string>(initialData?.helper?.id ?? "")
  const [status, setStatus] = useState<HelpRequestStatus>(initialData?.status ?? "open")
  const [rating, setRating] = useState(initialData?.rating ?? 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const next: Record<string, string> = {}
    if (!description.trim()) next.description = "Description is required"
    if (!requesterId) next.requesterId = "Requester is required"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({
      description,
      requesterId,
      helperId: helperId || null,
      status,
      rating,
    })
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
                  {mode === "create" ? "Create Request" : "Edit Request"}
                </h2>
                <Badge variant="secondary" className="uppercase tracking-wider">
                  {mode}
                </Badge>
              </div>
              <p className="text-sm md:text-lg text-muted-foreground max-w-2xl">
                {mode === "create"
                  ? "Submit a new help request for team collaboration."
                  : "Update details for this help request."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Request Details */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold uppercase tracking-widest text-muted-foreground">
                Request Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Description - full width */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what you need help with..."
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                </div>

                {/* Requester */}
                <div className="space-y-2">
                  <Label>Requester *</Label>
                  <Select value={requesterId} onValueChange={setRequesterId}>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Select Requester" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
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

                {/* Helper */}
                <div className="space-y-2">
                  <Label>Helper</Label>
                  <Select value={helperId} onValueChange={setHelperId}>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Select Helper (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as HelpRequestStatus)}>
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

                {/* Rating */}
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex items-center gap-1 h-12">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className="p-0.5 transition-transform hover:scale-110"
                        onMouseEnter={() => setHoverRating(i + 1)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(i + 1 === rating ? 0 : i + 1)}
                      >
                        <Star
                          className={`size-6 ${
                            i < (hoverRating || rating)
                              ? "fill-primary text-primary"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="text-sm text-muted-foreground ml-2">{rating}/5</span>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" size="lg" onClick={onCancel}>
                Discard
              </Button>
              <Button type="submit" size="lg">
                {mode === "create" ? "Create Request" : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
