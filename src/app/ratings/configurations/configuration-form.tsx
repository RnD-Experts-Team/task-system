import { useState, useEffect } from "react"
import { useForm, useFieldArray, type Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Loader2, Plus, Trash2, SlidersHorizontal, AlertCircle } from "lucide-react"
// The live ApiRatingConfig type (from the API) replaces the old local Configuration type
import type { ApiRatingConfig } from "@/app/ratings/configurations/types"

// ── Schema ────────────────────────────────────────────────────────────────────

const ratingFieldSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  description: z.string().optional(),
  maxValue: z.coerce.number().min(1, "Must be at least 1").max(100, "Max 100"),
})

const configurationSchema = z.object({
  name: z.string().min(1, "Name is required").min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  // API uses snake_case enum values: task_rating | stakeholder_rating
  type: z.enum(["task_rating", "stakeholder_rating"]),
  isActive: z.boolean(),
  fields: z.array(ratingFieldSchema).min(1, "Add at least one rating field"),
})

export type ConfigurationFormValues = z.infer<typeof configurationSchema>

// ── Props ─────────────────────────────────────────────────────────────────────

type ConfigurationFormProps = {
  mode: "create" | "edit"
  /** Pass the live ApiRatingConfig when editing; omit (or pass null) for create mode */
  configuration?: ApiRatingConfig | null
  /** Called when the form is submitted with valid values; parent handles the API call */
  onSubmit: (data: ConfigurationFormValues) => Promise<void> | void
  onCancel: () => void
  /** True while the parent is loading the config in edit mode */
  isLoading?: boolean
  /** Submit error from the parent (API error after submission) */
  submitError?: string | null
}

// Display labels for the type select — map API enum → human label
const typeOptions = [
  { value: "task_rating" as const, label: "Task Rating" },
  { value: "stakeholder_rating" as const, label: "Stakeholder Rating" },
]

import { ConfigurationFormSkeleton } from "./configuration-skeleton"

// ── Component ─────────────────────────────────────────────────────────────────

export function ConfigurationForm({
  mode,
  configuration,
  onSubmit,
  onCancel,
  isLoading = false,
  submitError,
}: ConfigurationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<ConfigurationFormValues>({
    resolver: zodResolver(configurationSchema) as Resolver<ConfigurationFormValues>,
    defaultValues: {
      name: configuration?.name ?? "",
      description: configuration?.description ?? "",
      // Map the real API type (task_rating / stakeholder_rating) to the form value
      type: configuration?.type ?? "task_rating",
      // is_active comes directly from the API response
      isActive: configuration ? configuration.is_active : true,
      // Map config_data.fields (API) → form fields; max_value → maxValue
      fields:
        configuration?.config_data?.fields?.map((f) => ({
          name: f.name,
          description: f.description ?? "",
          maxValue: f.max_value,
        })) ?? [{ name: "", description: "", maxValue: 10 }],
    },
  })

  /**
   * In edit mode the component mounts before the API response arrives, so
   * `configuration` is null on the first render and defaultValues are all empty.
   * When the config loads (configuration changes from null → object), call reset()
   * to repopulate every field with the real data from the server.
   */
  useEffect(() => {
    if (configuration) {
      reset({
        name: configuration.name,
        description: configuration.description ?? "",
        type: configuration.type,
        isActive: configuration.is_active,
        fields:
          configuration.config_data?.fields?.map((f) => ({
            name: f.name,
            description: f.description ?? "",
            maxValue: f.max_value,
          })) ?? [{ name: "", description: "", maxValue: 10 }],
      })
    }
  }, [configuration, reset])

  const { fields, append, remove } = useFieldArray({ control, name: "fields" })
  const currentType = watch("type")
  const isActive = watch("isActive")

  async function handleFormSubmit(data: ConfigurationFormValues) {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      // Errors are surfaced via the submitError prop from the parent; log for debugging
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <ConfigurationFormSkeleton />
  }

  return (
    <div className="flex w-full justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-6">
        {/* Page header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Go back">
            <ArrowLeft className="size-4" />
          </Button>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                {mode === "create" ? "Create Configuration" : "Edit Configuration"}
              </h2>
              <Badge variant="secondary" className="uppercase tracking-wider">
                {mode}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {mode === "create"
                ? "Define a new rating configuration with scoring criteria."
                : `Update details for "${configuration?.name ?? "this configuration"}".`}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* ── Basic Information ──────────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <SlidersHorizontal className="size-4 text-primary" />
                </div>
                <CardTitle className="text-base">Basic Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Configuration Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Documentation and Planning"
                  className="h-11"
                  disabled={isSubmitting}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  placeholder="Describe the purpose of this configuration..."
                  className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  disabled={isSubmitting}
                  {...register("description")}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">
                    Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={currentType}
                    onValueChange={(v) => setValue("type", v as "task_rating" | "stakeholder_rating")}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="type" className="h-11">
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
                  {errors.type && (
                    <p className="text-xs text-destructive">{errors.type.message}</p>
                  )}
                </div>

                {/* Active toggle */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex h-11 items-center gap-3 rounded-md border border-input bg-background px-3">
                    <Checkbox
                      id="isActive"
                      checked={isActive}
                      onCheckedChange={(checked) => setValue("isActive", !!checked)}
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm cursor-pointer select-none flex-1"
                    >
                      Active Configuration
                    </label>
                    <Badge
                      variant={isActive ? "default" : "secondary"}
                      className={
                        isActive
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                          : ""
                      }
                    >
                      {isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── Rating Fields ──────────────────────────────────────────── */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Plus className="size-4 text-primary" />
                </div>
                <CardTitle className="text-base">Rating Fields</CardTitle>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {fields.length} {fields.length === 1 ? "field" : "fields"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.fields && !Array.isArray(errors.fields) && (
                <p className="text-xs text-destructive">{errors.fields.message}</p>
              )}

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-lg border border-border/60 bg-muted/30 p-4 space-y-4 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">
                          Field {index + 1}
                        </span>
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          onClick={() => remove(index)}
                          aria-label={`Remove field ${index + 1}`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto]">
                      {/* Field Name */}
                      <div className="space-y-1.5">
                        <Label htmlFor={`field-name-${index}`} className="text-xs">
                          Field Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`field-name-${index}`}
                          placeholder="e.g. Code Quality"
                          className="h-9 text-sm"
                          disabled={isSubmitting}
                          {...register(`fields.${index}.name`)}
                        />
                        {errors.fields?.[index]?.name && (
                          <p className="text-xs text-destructive">
                            {errors.fields[index]?.name?.message}
                          </p>
                        )}
                      </div>

                      {/* Max Value */}
                      <div className="space-y-1.5 w-full sm:w-28">
                        <Label htmlFor={`field-max-${index}`} className="text-xs">
                          Max Value <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`field-max-${index}`}
                          type="number"
                          min={1}
                          max={100}
                          className="h-9 text-sm"
                          disabled={isSubmitting}
                          {...register(`fields.${index}.maxValue`)}
                        />
                        {errors.fields?.[index]?.maxValue && (
                          <p className="text-xs text-destructive">
                            {errors.fields[index]?.maxValue?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                      <Label htmlFor={`field-desc-${index}`} className="text-xs">
                        Description
                      </Label>
                      <Input
                        id={`field-desc-${index}`}
                        placeholder="Brief description of this criterion..."
                        className="h-9 text-sm"
                        disabled={isSubmitting}
                        {...register(`fields.${index}.description`)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-dashed hover:border-primary/50 hover:bg-primary/5 transition-colors"
                onClick={() => append({ name: "", description: "", maxValue: 10 })}
                disabled={isSubmitting}
              >
                <Plus className="size-3.5" />
                Add Field
              </Button>
            </CardContent>
          </Card>

          {/* ── Footer ────────────────────────────────────────────────── */}
          <Separator />

          {/* API submission error banner — shown when the parent hook returns an error */}
          {submitError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pb-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-40 transition-all hover:shadow-md hover:shadow-primary/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : mode === "create" ? (
                "Create Configuration"
              ) : (
                "Update Configuration"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
