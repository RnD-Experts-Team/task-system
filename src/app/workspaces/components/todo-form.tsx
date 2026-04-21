import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DateInput } from "@/components/ui/date-input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, Loader2 } from "lucide-react"
import type { WorkspaceTodo, TodoStatus } from "../types"

// Validation schema — matches backend rules (title required, max 255)
const todoSchema = z.object({
  title: z.string().min(1, "Todo title is required").max(255, "Title must be 255 characters or less"),
  due_date: z.string().nullable(),
  status: z.enum(["pending", "inprogress", "completed"]),
  parent_id: z.number().nullable(),
})

// Form values type exported for use in page components
export type TodoFormValues = z.infer<typeof todoSchema>

type TodoFormProps = {
  mode: "create" | "edit"
  // Existing todo for edit mode (pre-fills the form)
  todo?: WorkspaceTodo | null
  // Available parent todos for the "parent" dropdown
  parentTodos?: WorkspaceTodo[]
  submitting?: boolean
  // Server-side error message to display above the form
  submitError?: string | null
  onSubmit: (data: TodoFormValues) => void
  onCancel: () => void
}

// Status options matching the backend enum
const statusOptions: { value: TodoStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "inprogress", label: "In Progress" },
  { value: "completed", label: "Completed" },
]

export function TodoForm({
  mode,
  todo,
  parentTodos = [],
  submitting = false,
  submitError,
  onSubmit,
  onCancel,
}: TodoFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TodoFormValues>({
    resolver: zodResolver(todoSchema),
    defaultValues: {
      title: todo?.title ?? "",
      // Convert null to empty string for the date input
      due_date: todo?.due_date ?? "",
      status: todo?.status ?? "pending",
      parent_id: todo?.parent_id ?? null,
    },
  })

  const selectedStatus = watch("status")
  const selectedParentId = watch("parent_id")

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Server-side error banner */}
      {submitError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Title field — required, max 255 chars */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          placeholder="e.g. Review LED spotlight wattage"
          disabled={submitting}
          {...register("title")}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Due date and status — side by side on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date</Label>
          <DateInput
            id="due_date"
            disabled={submitting}
            {...register("due_date")}
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={selectedStatus}
            onValueChange={(v) => setValue("status", v as TodoStatus)}
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue />
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

      {/* Parent todo dropdown — only shown when there are available parents */}
      {parentTodos.length > 0 && (
        <div className="space-y-2">
          <Label>Parent Todo (optional)</Label>
          <Select
            value={selectedParentId?.toString() ?? "none"}
            onValueChange={(v) =>
              setValue("parent_id", v === "none" ? null : Number(v))
            }
            disabled={submitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="None (top-level)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (top-level)</SelectItem>
              {parentTodos.map((pt) => (
                <SelectItem key={pt.id} value={pt.id.toString()}>
                  {pt.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

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
          {mode === "create" ? "Create Todo" : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
