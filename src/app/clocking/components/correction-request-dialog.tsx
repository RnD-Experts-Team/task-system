import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { HistoryIcon, ShieldCheckIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ClockingRecord } from "../data"

interface CorrectionRequestDialogProps {
  record: ClockingRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: CorrectionFormData) => void
}

export interface CorrectionFormData {
  recordId: string
  proposedDate: string
  proposedTime: string
  reason: string
}

const MAX_REASON_LENGTH = 500

export function CorrectionRequestDialog({
  record,
  open,
  onOpenChange,
  onSubmit,
}: CorrectionRequestDialogProps) {
  const [proposedDate, setProposedDate] = useState("")
  const [proposedTime, setProposedTime] = useState("")
  const [reason, setReason] = useState("")

  if (!record) return null

  const refId = `CHR-${record.id.padStart(3, "0")}-XX`
  const remainingChars = MAX_REASON_LENGTH - reason.length

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!proposedDate || !proposedTime || !reason.trim()) return
    onSubmit?.({ recordId: record!.id, proposedDate, proposedTime, reason })
    onOpenChange(false)
    setProposedDate("")
    setProposedTime("")
    setReason("")
  }

  function handleCancel() {
    onOpenChange(false)
    setProposedDate("")
    setProposedTime("")
    setReason("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl p-0"
      >
        <div className="p-7 sm:p-10">
          {/* Header */}
          <header className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
              <HistoryIcon className="size-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Correction Request
              </span>
            </div>

            <h1 className="mb-3 text-2xl font-black tracking-tighter leading-none sm:text-3xl">
              Request Clock-In Correction
            </h1>

            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Original:{" "}
                <span className="font-mono text-foreground">
                  {record.date} — {record.clockIn}
                </span>
              </p>
              <p className="text-xs italic text-primary">
                Enter the corrected clock-in time for this record.
              </p>
            </div>
          </header>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
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

              <InputField label="Proposed Time">
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
                  rows={4}
                  maxLength={MAX_REASON_LENGTH}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why you need this correction…"
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
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="lg"
                className="flex-[1.5] font-bold"
                disabled={!proposedDate || !proposedTime || !reason.trim()}
              >
                Submit Request
              </Button>
            </div>
          </form>
        </div>

        {/* Footer */}
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
