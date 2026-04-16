// ─── CompleteHelpRequestDialog ────────────────────────────────────────────────
// Dialog that lets a user mark a help request as completed with a rating category.
// Calls POST /help-requests/{id}/complete with body { rating } on confirm.
//
// Props:
//   request      — the help request to complete
//   open         — controls dialog visibility
//   onOpenChange — called when the dialog should open/close
//   onComplete   — called with (requestId, rating) when confirmed; parent triggers the API call
//   completing   — true while the API call is in-flight

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { CheckCircle2, Loader2 } from "lucide-react"
// Rating enum and its human-readable labels
import { helpRequestRatingLabel } from "@/app/help-requests/types"
import type { HelpRequest, HelpRequestRatingValue } from "@/app/help-requests/types"

type CompleteHelpRequestDialogProps = {
  request: HelpRequest | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called when the user confirms; parent should call completeHelpRequest(id, { rating }) */
  onComplete: (requestId: number, rating: HelpRequestRatingValue) => Promise<void>
  /** True while the complete API call is in-flight — disables buttons */
  completing?: boolean
}

// All valid rating values taken from the HelpRequestRatingValue union type
const ratingOptions: HelpRequestRatingValue[] = [
  "legitimate_learning",
  "basic_skill_gap",
  "careless_mistake",
  "fixing_own_mistakes",
]

export function CompleteHelpRequestDialog({
  request,
  open,
  onOpenChange,
  onComplete,
  completing = false,
}: CompleteHelpRequestDialogProps) {
  // ── Local state ────────────────────────────────────────────────────────────
  // Tracks the selected rating; null means nothing chosen yet
  const [rating, setRating] = useState<HelpRequestRatingValue | null>(null)

  // Reset rating whenever the dialog opens for a new request
  useEffect(() => {
    if (open) setRating(null)
  }, [open])

  // ── Handle confirm ────────────────────────────────────────────────────────
  async function handleConfirm() {
    if (!request || !rating) return
    await onComplete(request.id, rating)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[450px] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border/40 shadow-xl bg-background/95 backdrop-blur">
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <CheckCircle2 className="size-5" />
            Complete Help Request
          </DialogTitle>
          {/* Show a short excerpt of the request description for context */}
          {request && (
            <DialogDescription className="text-left text-sm sm:text-base text-foreground/80 leading-relaxed">
              {request.description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* ── Rating selector ───────────────────────────────────────────────── */}
        {/* The backend requires exactly one of the four HelpRequestRating enum values */}
        <div className="space-y-3 py-4">
          <Label htmlFor="rating-select" className="text-sm sm:text-base font-semibold">
            Rating Category <span className="text-destructive">*</span>
          </Label>
          <Select
            value={rating ?? ""}
            onValueChange={(v) => setRating(v as HelpRequestRatingValue)}
          >
            <SelectTrigger id="rating-select" className="w-full h-12 rounded-xl bg-background/50 border-input">
              <SelectValue placeholder="Select a rating..." />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {ratingOptions.map((value) => (
                <SelectItem key={value} value={value} className="py-3 rounded-lg cursor-pointer">
                  {/* Map API enum string to human-readable label */}
                  {helpRequestRatingLabel[value]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-2">
            The rating category determines the penalty multiplier applied to the task rating.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 sm:pt-6">
          {/* Cancel — disabled while in-flight */}
          <Button variant="ghost" className="rounded-full px-6" onClick={() => onOpenChange(false)} disabled={completing}>
            Cancel
          </Button>
          {/* Confirm — disabled until a rating is selected or while in-flight */}
          <Button
            variant="destructive"
            className="rounded-full px-6"
            onClick={handleConfirm}
            disabled={!rating || completing}
          >
            {completing && <Loader2 className="size-4 animate-spin mr-2" />}
            Mark Complete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
