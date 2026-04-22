import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Pencil,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Hash,
} from "lucide-react"
// Hook fetches GET /final-ratings/configs/{id} from the store
import { useFinalRatingConfig } from "@/app/ratings/final-ratings/hooks/useFinalRatingConfig"
import type { ApiFinalRatingConfig, FinalRatingConfigData } from "@/app/ratings/final-ratings/types"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/** Human-readable label for each component key */
const COMPONENT_LABELS: Record<string, string> = {
  task_ratings: "Task Ratings",
  stakeholder_ratings: "Stakeholder Ratings",
  help_requests_helper: "Help Requests (Helper)",
  help_requests_requester: "Help Requests (Requester)",
  tickets_resolved: "Tickets Resolved",
}

/** Render a config component row showing its key settings */
function ComponentRow({
  label,
  data,
}: {
  label: string
  data: Record<string, unknown> | undefined
}) {
  const enabled = data?.enabled === true
  return (
    <div className="rounded-md border px-3 py-2.5 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {enabled ? (
          <Badge
            variant="outline"
            className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-xs"
          >
            <CheckCircle2 className="size-3 mr-1" />
            Enabled
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">
            <XCircle className="size-3 mr-1" />
            Disabled
          </Badge>
        )}
      </div>
      {/* Show the non-enabled settings as small key-value pairs */}
      {data && enabled && (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {Object.entries(data)
            .filter(([k]) => k !== "enabled")
            .map(([k, v]) => (
              <span key={k} className="text-[11px] text-muted-foreground">
                <span className="font-mono">{k.replace(/_/g, " ")}</span>:{" "}
                <span className="font-semibold text-foreground">
                  {typeof v === "object" ? JSON.stringify(v) : String(v)}
                </span>
              </span>
            ))}
        </div>
      )}
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

type FinalRatingConfigDetailSheetProps = {
  /** Numeric config ID; null means the sheet is closed */
  configId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Callback to open the edit sheet for this config */
  onEdit?: (config: ApiFinalRatingConfig) => void
  onDelete?: (config: ApiFinalRatingConfig) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FinalRatingConfigDetailSheet({
  configId,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: FinalRatingConfigDetailSheetProps) {
  // Calls GET /final-ratings/configs/{id} when configId is non-null
  const { config, loading, error } = useFinalRatingConfig(open ? configId : null)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Configuration Details</SheetTitle>
          <SheetDescription>
            Full details for this final rating configuration.
          </SheetDescription>
        </SheetHeader>

        {/* ── Loading skeleton ─────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col gap-4 px-6 py-4">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Separator />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        )}

        {/* ── Error state ─────────────────────────────────────── */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
            <AlertCircle className="size-8 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* ── Config content ───────────────────────────────────── */}
        {!loading && !error && config && (
          <div className="flex flex-col gap-5 px-6 py-4">
            {/* Status badges + edit button */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {config.is_active ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                  >
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onOpenChange(false)
                      onEdit(config)
                    }}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      onOpenChange(false)
                      onDelete(config)
                    }}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                )}
              </div>
            </div>

            {/* Name + description */}
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{config.name}</h3>
              {config.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {config.description}
                </p>
              )}
            </div>

            {/* ID + timestamps */}
            <div className="rounded-lg border bg-muted/30 px-3 py-2.5 space-y-1.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Hash className="size-3" />
                ID: <span className="font-semibold text-foreground">{config.id}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3" />
                Created: {formatDate(config.created_at)}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="size-3" />
                Updated: {formatDate(config.updated_at)}
              </div>
            </div>

            <Separator />

            {/* Components section */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Components
              </p>
              <div className="space-y-2">
                {/* Render each component from the config data */}
                {(Object.keys(COMPONENT_LABELS) as Array<keyof FinalRatingConfigData>).map((key) => (
                  <ComponentRow
                    key={key}
                    label={COMPONENT_LABELS[key]}
                    data={config.config?.[key] as Record<string, unknown> | undefined}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
