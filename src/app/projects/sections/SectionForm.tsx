// Dialog form for creating and editing sections.
// Uses react-hook-form + zod for validation, consistent with ProjectForm.
// Opens as a Dialog (modal) and pre-fills fields when editing an existing section.

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import type { Section } from "./types"

// Validation schema for section form fields
const sectionSchema = z.object({
  name: z.string().min(1, "Section name is required").max(255, "Name must be 255 characters or fewer"),
  description: z.string().nullable(),
})

export type SectionFormValues = z.infer<typeof sectionSchema>

type SectionFormProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  section?: Section | null
  submitting?: boolean
  onSubmit: (data: SectionFormValues) => void
}

export function SectionForm({
  open,
  onOpenChange,
  mode,
  section,
  submitting = false,
  onSubmit,
}: SectionFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SectionFormValues>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      name: section?.name ?? "",
      description: section?.description ?? "",
    },
  })

  // Reset form values when the dialog opens or the section changes
  useEffect(() => {
    if (open) {
      reset({
        name: section?.name ?? "",
        description: section?.description ?? "",
      })
    }
  }, [open, section, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="p-6 space-y-5">
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Create Section" : "Edit Section"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Add a new section to organize tasks within this project."
                : "Update the section details below."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Section Name */}
            <div className="space-y-2">
              <Label htmlFor="section-name">Section Name *</Label>
              <Input
                id="section-name"
                placeholder="e.g. Design Phase"
                disabled={submitting}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="section-description">Description</Label>
              <Textarea
                id="section-description"
                placeholder="Optional section description..."
                className="min-h-20"
                disabled={submitting}
                {...register("description")}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {mode === "create" ? "Create Section" : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
