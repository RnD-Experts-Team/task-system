import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchableSelect } from "@/components/ui/searchable-select"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { useAssignableTasks } from "../hooks/useAssignableTasks"
import {
  PRIORITY_LABELS,
  PRIORITY_OPTIONS,
  type ItemPriority,
  type WorkSessionItem,
} from "../types"

// ─── Schema ───────────────────────────────────────────────────────
// Matches the backend rules: title required ≤255, description ≤5000,
// priority enum, estimated_minutes 1..1440 optional, task_id optional.
const itemSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255, "Title must be 255 characters or less"),
  description: z.string().max(5000, "Description must be 5000 characters or less"),
  priority: z.enum(["low", "medium", "high", "critical"]),
  // Kept as a string in the form so the input can be empty; coerced on submit
  estimated_minutes: z
    .string()
    .refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 1440), {
      message: "Enter a whole number between 1 and 1440 minutes",
    }),
  task_id: z.number().nullable(),
})

type ItemFormSchema = z.infer<typeof itemSchema>

/** Values handed to the caller — already normalized to the API payload shape */
export type ItemFormValues = {
  title: string
  description: string | null
  priority: ItemPriority
  estimated_minutes: number | null
  task_id: number | null
}

// Sentinel value for the "No linked task" option in the searchable select
const NO_TASK = "none"

// ─── Form ─────────────────────────────────────────────────────────

type ItemFormProps = {
  mode: "create" | "edit"
  item?: WorkSessionItem | null
  submitting?: boolean
  submitError?: string | null
  onSubmit: (values: ItemFormValues) => void
  onCancel: () => void
}

/** Dumb RHF + zod form for a work session item */
function ItemForm({ mode, item, submitting = false, submitError, onSubmit, onCancel }: ItemFormProps) {
  const { tasks, loading: tasksLoading } = useAssignableTasks()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ItemFormSchema>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: item?.title ?? "",
      description: item?.description ?? "",
      priority: item?.priority ?? "medium",
      estimated_minutes: item?.estimated_minutes != null ? String(item.estimated_minutes) : "",
      task_id: item?.task_id ?? null,
    },
  })

  // useWatch (not watch) so the React Compiler can memoize this component safely
  const selectedPriority = useWatch({ control, name: "priority" })
  const selectedTaskId = useWatch({ control, name: "task_id" })

  // Task options — include the currently linked task even if it's no longer assignable
  const taskOptions = [
    { value: NO_TASK, label: "No linked task" },
    ...tasks.map((t) => ({
      value: String(t.id),
      label: t.project_name ? `${t.name} · ${t.project_name}` : t.name,
    })),
  ]
  if (item?.task && !tasks.some((t) => t.id === item.task?.id)) {
    taskOptions.push({ value: String(item.task.id), label: item.task.name })
  }

  function submit(values: ItemFormSchema) {
    onSubmit({
      title: values.title,
      description: values.description.trim() ? values.description.trim() : null,
      priority: values.priority,
      estimated_minutes: values.estimated_minutes === "" ? null : Number(values.estimated_minutes),
      task_id: values.task_id,
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      {/* Server-side error banner */}
      {submitError && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="item-title">Title *</Label>
        <Input
          id="item-title"
          placeholder="e.g. Finalize lighting plan for lobby"
          disabled={submitting}
          autoFocus
          {...register("title")}
        />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="item-description">Description</Label>
        <Textarea
          id="item-description"
          placeholder="Optional details, acceptance criteria, links…"
          rows={4}
          disabled={submitting}
          {...register("description")}
        />
        {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
      </div>

      {/* Priority + estimate — side by side on larger screens */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={selectedPriority}
            onValueChange={(v) => setValue("priority", v as ItemPriority, { shouldDirty: true })}
            disabled={submitting}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="item-estimate">Estimate (minutes)</Label>
          <Input
            id="item-estimate"
            type="number"
            inputMode="numeric"
            min={1}
            max={1440}
            step={1}
            placeholder="e.g. 90"
            disabled={submitting}
            {...register("estimated_minutes")}
          />
          {errors.estimated_minutes && (
            <p className="text-sm text-destructive">{errors.estimated_minutes.message}</p>
          )}
        </div>
      </div>

      {/* Linked task (optional) */}
      <div className="space-y-2">
        <Label>Linked task</Label>
        <SearchableSelect
          value={selectedTaskId === null ? NO_TASK : String(selectedTaskId)}
          onValueChange={(v) => setValue("task_id", v === NO_TASK ? null : Number(v), { shouldDirty: true })}
          options={taskOptions}
          loading={tasksLoading}
          disabled={submitting}
          placeholder="No linked task"
          emptyMessage="No matching tasks."
          className="[&>button]:h-9 [&>button]:text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Optionally tie this item to one of your open project tasks.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {mode === "create" ? "Add item" : "Save changes"}
        </Button>
      </div>
    </form>
  )
}

// ─── Sheet wrapper ────────────────────────────────────────────────

type ItemFormSheetProps = ItemFormProps & {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Side sheet hosting the item form. The form remounts on every open so defaults reset. */
export function ItemFormSheet({ open, onOpenChange, mode, item, submitting, submitError, onSubmit, onCancel }: ItemFormSheetProps) {
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        // Block closing while a request is in flight
        if (!submitting) onOpenChange(next)
      }}
    >
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="pr-12">
          <SheetTitle className="text-base">{mode === "create" ? "Add item" : "Edit item"}</SheetTitle>
          <SheetDescription>
            {mode === "create"
              ? "Plan something you intend to work on today."
              : "Update the details of this planned item."}
          </SheetDescription>
        </SheetHeader>
        <div className="px-6 pb-6">
          {open && (
            <ItemForm
              key={`${mode}-${item?.id ?? "new"}`}
              mode={mode}
              item={item}
              submitting={submitting}
              submitError={submitError}
              onSubmit={onSubmit}
              onCancel={onCancel}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
