// ─── HelpRequestFormSheet ─────────────────────────────────────────────────────
// Slide-in Sheet used for both CREATE and EDIT operations.
//
// Create mode (mode="create"):
//   Fields: description (required), task (required), helper (optional)
//   Calls  → POST /help-requests
//
// Edit mode (mode="edit", request prop required):
//   Fields: description, helper (optional)
//   Calls  → PUT /help-requests/{id}
//
// Tasks and users are fetched from the API when the sheet opens.
// Errors from the mutation are shown inline (cancel errors are ignored).

import { useState, useEffect, useCallback } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, Loader2 } from "lucide-react"
import { apiClient } from "@/services/api"
import type { HelpRequest, CreateHelpRequestPayload, UpdateHelpRequestPayload } from "@/app/help-requests/types"
import { useHelpRequestMutations } from "@/app/help-requests/hooks/useHelpRequestMutations"

// ── Minimal shapes we need from the API ──────────────────────────────────────

interface TaskOption {
  id: number
  name: string
}

interface UserOption {
  id: number
  name: string
}

// ── Props ─────────────────────────────────────────────────────────────────────

type HelpRequestFormSheetProps = {
  mode: "create" | "edit"
  /** Required when mode="edit" — pre-fills the form fields */
  request?: HelpRequest | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called after a successful create or update */
  onSuccess?: () => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export function HelpRequestFormSheet({
  mode,
  request,
  open,
  onOpenChange,
  onSuccess,
}: HelpRequestFormSheetProps) {
  // ── Mutations from the store ─────────────────────────────────────────────────
  const { createHelpRequest, updateHelpRequest, submitting, submitError, clearSubmitError } =
    useHelpRequestMutations()

  // ── Form field state ────────────────────────────────────────────────────────
  const [description, setDescription] = useState("")
  const [taskId, setTaskId] = useState<string>("")        // string for Select value
  const [helperId, setHelperId] = useState<string>("")    // "" = no helper

  // ── Options fetched from the API ────────────────────────────────────────────
  const [tasks, setTasks] = useState<TaskOption[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [optionsError, setOptionsError] = useState<string | null>(null)

  // ── Validation errors ────────────────────────────────────────────────────────
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // ── Fetch tasks + users when the sheet opens ─────────────────────────────────
  const fetchOptions = useCallback(async () => {
    setOptionsLoading(true)
    setOptionsError(null)
    try {
      // Fetch both lists in parallel — per_page:100 is enough for reasonable usage
      const [tasksResp, usersResp] = await Promise.all([
        apiClient.get<unknown>("/tasks", { params: { per_page: 100 } }),
        apiClient.get<unknown>("/users", { params: { per_page: 100 } }),
      ])
      // Both endpoints wrap their list in { data: [...] }
      const tasksData = (tasksResp as unknown as { data: TaskOption[] }).data ?? []
      const usersData = (usersResp as unknown as { data: UserOption[] }).data ?? []
      setTasks(tasksData)
      setUsers(usersData)
    } catch {
      setOptionsError("Could not load tasks or users. Please try again.")
    } finally {
      setOptionsLoading(false)
    }
  }, [])

  // ── Sync form fields when the sheet opens / request changes ─────────────────
  useEffect(() => {
    if (!open) return

    // Pre-fill when editing an existing request
    setDescription(request?.description ?? "")
    setTaskId(request?.task_id ? String(request.task_id) : "")
    setHelperId(request?.helper_id ? String(request.helper_id) : "")
    setFieldErrors({})
    clearSubmitError()

    // Load option lists every time the sheet opens
    fetchOptions()
  }, [open, request, clearSubmitError, fetchOptions])

  // ── Validation ────────────────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!description.trim()) errs.description = "Description is required."
    if (mode === "create" && !taskId) errs.taskId = "Task is required."
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    let success = false

    if (mode === "create") {
      // Build create payload — helper_id is optional (null if not set)
      const payload: CreateHelpRequestPayload = {
        description: description.trim(),
        task_id: Number(taskId),
        helper_id: helperId ? Number(helperId) : null,
      }
      success = await createHelpRequest(payload)
    } else if (mode === "edit" && request) {
      // Build update payload — only send changed fields
      const payload: UpdateHelpRequestPayload = {
        description: description.trim(),
        helper_id: helperId ? Number(helperId) : null,
      }
      success = await updateHelpRequest(request.id, payload)
    }

    if (success) {
      onOpenChange(false)
      onSuccess?.()
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="data-[side=right]:sm:max-w-full data-[side=right]:md:max-w-[1040px] overflow-y-auto themed-scrollbar"
      >
        <SheetHeader className="gap-1">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-xl">
              {mode === "create" ? "New Help Request" : "Edit Help Request"}
            </SheetTitle>
            <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">
              {mode}
            </Badge>
          </div>
          <SheetDescription>
            {mode === "create"
              ? "Submit a new help request. Fill in the required fields below."
              : "Update the description or helper for this help request."}
          </SheetDescription>
        </SheetHeader>

        {/* ── Options loading / error ──────────────────────────────────────── */}
        {optionsLoading && (
          <div className="px-1 py-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading options…
          </div>
        )}

        {optionsError && !optionsLoading && (
          <div className="px-1 mt-4 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{optionsError}</span>
          </div>
        )}

        {/* ── Form ─────────────────────────────────────────────────────────── */}
        {!optionsLoading && !optionsError && (
          <form onSubmit={handleSubmit} className="px-1 mt-6 space-y-5">

            {/* Mutation error banner — shown when the API call fails */}
            {submitError && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {/* ── Description ──────────────────────────────────────────────── */}
            <div className="space-y-1.5">
              <Label htmlFor="hr-description">
                Description <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="hr-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you need help with…"
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
              />
              {fieldErrors.description && (
                <p className="text-xs text-destructive">{fieldErrors.description}</p>
              )}
            </div>

            {/* ── Task picker (create only) ─────────────────────────────────── */}
            {mode === "create" && (
              <div className="space-y-1.5">
                <Label>
                  Task <span className="text-destructive">*</span>
                </Label>
                <Select value={taskId} onValueChange={setTaskId}>
                  <SelectTrigger className="w-full h-10">
                    <SelectValue placeholder="Select a task…" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.length === 0 ? (
                      <div className="px-2 py-3 text-sm text-muted-foreground">
                        No tasks found.
                      </div>
                    ) : (
                      tasks.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {fieldErrors.taskId && (
                  <p className="text-xs text-destructive">{fieldErrors.taskId}</p>
                )}
              </div>
            )}

            {/* ── Helper picker (optional in both modes) ────────────────────── */}
            <div className="space-y-1.5">
              <Label>Helper <span className="text-xs text-muted-foreground">(optional)</span></Label>
              <Select value={helperId} onValueChange={setHelperId}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="No helper assigned" />
                </SelectTrigger>
                <SelectContent>
                  {/* Allow clearing the helper */}
                  <SelectItem value="none">No helper</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ── Actions ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {mode === "create" ? "Create Request" : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}
