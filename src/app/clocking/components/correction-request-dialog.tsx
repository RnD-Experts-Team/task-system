// src/app/clocking/components/correction-request-dialog.tsx
// Dialog for requesting a time correction on a clocking session.
// Accepts a real ClockRecordApiItem (API session), builds the request payload,
// calls POST /clocking/correction-request, and returns the created correction.

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { HistoryIcon, ShieldCheckIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { isCancel } from "axios"
import { toast } from "sonner"
import type { ClockRecordApiItem, ApiCorrectionType, PendingCorrectionApiItem } from "../data"
import { clockingService } from "@/services/clockingService"

// ─── Correction type options ──────────────────────────────────────

const CORRECTION_TYPES: { value: ApiCorrectionType; label: string }[] = [
  { value: "clock_in",  label: "Clock In"    },
  { value: "clock_out", label: "Clock Out"   },
  { value: "break_in",  label: "Break Start" },
  { value: "break_out", label: "Break End"   },
]

// Human-readable label for a correction type value
const correctionTypeLabel = (type: ApiCorrectionType) =>
  CORRECTION_TYPES.find((t) => t.value === type)?.label ?? type

// ─── Props ────────────────────────────────────────────────────────

interface CorrectionRequestDialogProps {
  /** The API session record being corrected (null = hide dialog) */
  record: ClockRecordApiItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called with the newly created correction after a successful API submission */
  onSubmit?: (correction: PendingCorrectionApiItem) => void
}

const MAX_REASON_LENGTH = 500

// ─── Component ────────────────────────────────────────────────────

export function CorrectionRequestDialog({
  record,
  open,
  onOpenChange,
  onSubmit,
}: CorrectionRequestDialogProps) {
  // What kind of time entry to correct
  const [correctionType, setCorrectionType] = useState<ApiCorrectionType>("clock_in")
  // Break record ID — required only when correcting a break start/end
  const [breakRecordId, setBreakRecordId] = useState<number | "">("")
  // Proposed corrected date + time (user enters in their local timezone)
  const [proposedDate, setProposedDate] = useState("")
  const [proposedTime, setProposedTime] = useState("")
  const [reason, setReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (!record) return null

  // Reference ID shown at the bottom for tracking purposes
  const refId = `CHR-${String(record.id).padStart(4, "0")}`
  const remainingChars = MAX_REASON_LENGTH - reason.length
  // Whether the selected type requires choosing a break record
  const isBreakType = correctionType === "break_in" || correctionType === "break_out"

  // Reset all local state and close the dialog
  function resetAndClose() {
    setCorrectionType("clock_in")
    setBreakRecordId("")
    setProposedDate("")
    setProposedTime("")
    setReason("")
    onOpenChange(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!proposedDate || !proposedTime || reason.trim().length < 10) return
    if (isBreakType && !breakRecordId) return

    // Build a UTC zulu timestamp from the local date + time inputs
    const requestedTimeUtc = `${proposedDate}T${proposedTime}:00Z`

    const payload = {
      correction_type: correctionType,
      reason: reason.trim(),
      requested_time_utc: requestedTimeUtc,
      // For clock corrections send the session id; for breaks send the break record id
      clock_session_id: !isBreakType ? record!.id : null,
      break_record_id:  isBreakType  ? (breakRecordId as number) : null,
    }

    setSubmitting(true)
    try {
      const correction = await clockingService.requestCorrection(payload)
      onSubmit?.(correction)
      resetAndClose()
    } catch (err) {
      if (!isCancel(err)) {
        toast.error("Failed to submit correction request.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) resetAndClose(); else onOpenChange(true) }}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl p-0"
      >
        <div className="p-7 sm:p-10">
          {/* ── Header ─────────────────────────────────────────── */}
          <header className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
              <HistoryIcon className="size-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Correction Request
              </span>
            </div>

            {/* Title changes based on the selected correction type */}
            <h1 className="mb-3 text-2xl font-black tracking-tighter leading-none sm:text-3xl">
              Request {correctionTypeLabel(correctionType)} Correction
            </h1>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Session date:{" "}
                <span className="font-mono text-foreground">
                  {record.session_date}
                </span>
              </p>
              <p className="text-xs italic text-primary">
                Enter the corrected time in UTC for this record.
              </p>
            </div>
          </header>

          {/* ── Form ───────────────────────────────────────────── */}
          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Correction type dropdown */}
            <InputField label="Correction Type">
              <select
                value={correctionType}
                onChange={(e) => {
                  setCorrectionType(e.target.value as ApiCorrectionType)
                  setBreakRecordId("") // reset break selection when type changes
                }}
                className="w-full border-none bg-transparent px-4 py-3.5 text-sm text-foreground outline-none"
              >
                {CORRECTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value} >{t.label}</option>
                ))}
              </select>
            </InputField>

            {/* Break record selector — only visible for break_in / break_out */}
            {isBreakType && (
              <InputField label="Select Break Record">
                {record.break_records.length === 0 ? (
                  <p className="px-4 py-3.5 text-sm text-muted-foreground">
                    No break records found for this session.
                  </p>
                ) : (
                  <select
                    required
                    value={breakRecordId}
                    onChange={(e) => setBreakRecordId(Number(e.target.value))}
                    className="w-full border-none bg-transparent px-4 py-3.5 text-sm text-foreground outline-none"
                  >
                    <option value="">— Select a break —</option>
                    {record.break_records.map((br) => (
                      <option key={br.id} value={br.id}>
                        Break #{br.id} — Start: {new Date(br.break_start_utc).toLocaleTimeString()}
                        {br.break_end_utc
                          ? ` / End: ${new Date(br.break_end_utc).toLocaleTimeString()}`
                          : " (active)"}
                      </option>
                    ))}
                  </select>
                )}
              </InputField>
            )}

            {/* Date + Time row */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <InputField label="Proposed Date">
                <input
                  required
                  type="date"
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                  className="w-full border-none bg-transparent px-4 py-3.5 text-sm text-foreground outline-none"
                />
              </InputField>

              <InputField label="Proposed Time (UTC)">
                <input
                  required
                  type="time"
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                  className="w-full border-none bg-transparent px-4 py-3.5 text-sm text-foreground outline-none"
                />
              </InputField>
            </div>

            {/* Reason */}
            <div>
              <div className="mb-2 flex items-end justify-between">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Reason for Correction
                </label>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    remainingChars < 50 ? "text-destructive" : "text-muted-foreground"
                  )}
                >
                  {remainingChars} remaining
                </span>
              </div>
              <InputField>
                <textarea
                  required
                  minLength={10}
                  rows={4}
                  maxLength={MAX_REASON_LENGTH}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you need this correction… (min 10 characters)"
                  className="w-full resize-none border-none bg-transparent px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                />
              </InputField>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={resetAndClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                className="flex-[1.5] gap-2 font-bold"
                disabled={
                  submitting ||
                  !proposedDate ||
                  !proposedTime ||
                  reason.trim().length < 10 ||
                  (isBreakType && !breakRecordId)
                }
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Submitting…
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* ── Footer ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-border/10 bg-muted/20 px-7 py-3">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ShieldCheckIcon className="size-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Authenticated Action
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Ref ID: {refId}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Shared InputField wrapper ────────────────────────────────────

function InputField({
  label,
  children,
}: {
  label?: string
  children: React.ReactNode
}) {
  return (
    <div>
      {label && (
        <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
      )}
      <div className="group relative overflow-hidden rounded-t-xl bg-muted/40 ring-1 ring-border/30 transition-all focus-within:ring-primary">
        {children}
        {/* bottom underline accent */}
        <div className="absolute bottom-0 left-0 h-0.5 w-full bg-border/40 transition-colors group-focus-within:bg-primary" />
      </div>
    </div>
  )
}
