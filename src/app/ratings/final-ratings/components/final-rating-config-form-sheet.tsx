import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Loader2, Zap } from "lucide-react"
// Hooks for create and update actions
import { useCreateFinalRatingConfig } from "@/app/ratings/final-ratings/hooks/useCreateFinalRatingConfig"
import { useUpdateFinalRatingConfig } from "@/app/ratings/final-ratings/hooks/useUpdateFinalRatingConfig"
import { useActivateFinalRatingConfig } from "@/app/ratings/final-ratings/hooks/useActivateFinalRatingConfig"
// Hook for fetching the default structure when creating a new config
import { useFinalRatingDefaultStructure } from "@/app/ratings/final-ratings/hooks/useFinalRatingDefaultStructure"
import type {
  ApiFinalRatingConfig,
  FinalRatingConfigData,
} from "@/app/ratings/final-ratings/types"

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Human-readable label for each component key */
const COMPONENT_LABELS: Record<string, string> = {
  task_ratings: "Task Ratings",
  stakeholder_ratings: "Stakeholder Ratings",
  help_requests_helper: "Help Requests (Helper)",
  help_requests_requester: "Help Requests (Requester)",
  tickets_resolved: "Tickets Resolved",
}

// ─── Props ────────────────────────────────────────────────────────────────────

type FinalRatingConfigFormSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** When provided, the sheet is in edit mode. Null means create mode. */
  editConfig: ApiFinalRatingConfig | null
  /** Called after a successful create or update so the parent can respond */
  onSuccess: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FinalRatingConfigFormSheet({
  open,
  onOpenChange,
  editConfig,
  onSuccess,
}: FinalRatingConfigFormSheetProps) {
  const isEdit = editConfig !== null

  // Actions from the store
  const { createConfig, creating, createError, clearCreateError } = useCreateFinalRatingConfig()
  const { updateConfig, updating, updateError, clearUpdateError } = useUpdateFinalRatingConfig()
  const { activateConfig, activating, activateError, clearActivateError } = useActivateFinalRatingConfig()

  // Default structure — used to pre-fill config when creating
  const { defaultStructure, loading: structureLoading, fetchDefaultStructure } =
    useFinalRatingDefaultStructure()

  // ── Form state ────────────────────────────────────────────────

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(false)
  // configData holds the nested component toggles / settings
  const [configData, setConfigData] = useState<FinalRatingConfigData>({})

  // ── Sync form when sheet opens ──────────────────────────────

  useEffect(() => {
    if (!open) return

    if (isEdit && editConfig) {
      // Populate form with existing config values
      setName(editConfig.name)
      setDescription(editConfig.description ?? "")
      setIsActive(editConfig.is_active)
      setConfigData(editConfig.config ?? {})
    } else {
      // Reset form for create mode and fetch default structure
      setName("")
      setDescription("")
      setIsActive(false)
      setConfigData({})
      fetchDefaultStructure()
    }

    // Clear any lingering errors when the sheet reopens
    clearCreateError()
    clearUpdateError()
    clearActivateError()
  }, [open, isEdit, editConfig, fetchDefaultStructure, clearCreateError, clearUpdateError, clearActivateError])

  // When default structure loads, apply it to configData (create mode only)
  useEffect(() => {
    if (!isEdit && defaultStructure && Object.keys(configData).length === 0) {
      setConfigData(defaultStructure)
    }
  }, [defaultStructure, isEdit, configData])

  // ── Toggle a component enabled/disabled ────────────────────

  function toggleComponent(key: string) {
    setConfigData((prev) => {
      const current = (prev as Record<string, Record<string, unknown>>)[key] ?? { enabled: false }
      return {
        ...prev,
        [key]: { ...current, enabled: !current.enabled },
      }
    })
  }

  // ── Submit handler ──────────────────────────────────────────

  async function handleSubmit() {
    if (isEdit && editConfig) {
      // PUT /final-ratings/configs/{id}
      const updated = await updateConfig(editConfig.id, {
        name,
        description: description || null,
        config: configData,
        is_active: isActive,
      })
      if (updated) {
        onOpenChange(false)
        onSuccess()
      }
    } else {
      // POST /final-ratings/configs
      const created = await createConfig({
        name,
        description: description || null,
        config: configData,
        is_active: isActive,
      })
      if (created) {
        onOpenChange(false)
        onSuccess()
      }
    }
  }

  const isSubmitting = creating || updating
  const submitError = createError || updateError || activateError

  // ── Activate handler (edit mode only) ─────────────────────

  async function handleActivate() {
    if (!editConfig) return
    const activated = await activateConfig(editConfig.id)
    if (activated) {
      setIsActive(true)
      onSuccess()
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Configuration" : "New Configuration"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update the final rating configuration parameters."
              : "Create a new final rating configuration."}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-6 py-4">
          {/* ── Name field ──────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label htmlFor="config-name" className="text-xs">
              Configuration Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="config-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q1 2026 Standard"
              className="h-10 text-sm"
              maxLength={255}
            />
          </div>

          {/* ── Description field ───────────────────────────────── */}
          <div className="space-y-1.5">
            <Label htmlFor="config-description" className="text-xs">
              Description
            </Label>
            <Input
              id="config-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description…"
              className="h-10 text-sm"
            />
          </div>

          {/* ── is_active toggle ──────────────────────────────────── */}
          <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium">Set as Active</p>
              <p className="text-xs text-muted-foreground">
                Only one configuration can be active at a time.
              </p>
            </div>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>

          <Separator />

          {/* ── Components section ──────────────────────────────── */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Components
            </p>

            {/* Show skeleton while default structure is loading (create mode) */}
            {!isEdit && structureLoading && (
              <div className="space-y-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-11 w-full rounded-md" />
                ))}
              </div>
            )}

            {/* Component toggle rows */}
            {(!structureLoading || isEdit) && (
              <div className="space-y-1.5">
                {Object.keys(COMPONENT_LABELS).map((key) => {
                  const data = (configData as Record<string, Record<string, unknown>>)[key]
                  const enabled = data?.enabled === true
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleComponent(key)}
                      className="flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-sm transition-colors hover:bg-muted/50"
                    >
                      <span>{COMPONENT_LABELS[key]}</span>
                      <Badge
                        variant={enabled ? "default" : "secondary"}
                        className={
                          enabled
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                            : ""
                        }
                      >
                        {enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Validation / API error ──────────────────────────── */}
          {submitError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}
        </div>

        {/* ── Footer buttons ──────────────────────────────────────── */}
        <SheetFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting || activating}
          >
            Cancel
          </Button>
          {/* Activate button — only available in edit mode when not already active */}
          {isEdit && (
            <Button
              variant="outline"
              onClick={handleActivate}
              disabled={isActive || activating || isSubmitting}
              title={isActive ? "Already active" : "Activate this configuration"}
            >
              {activating ? (
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              ) : (
                <Zap className="size-3.5 mr-1.5" />
              )}
              Activate
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || activating || !name.trim()}
          >
            {isSubmitting && <Loader2 className="size-3.5 mr-1.5 animate-spin" />}
            {isEdit ? "Update" : "Create"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
