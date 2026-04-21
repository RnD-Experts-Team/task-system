import { useNavigate, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Calendar,
  Clock,
  Hash,
  User,
  ListChecks,
  SlidersHorizontal,
  AlertCircle,
} from "lucide-react"
// Hook fetches GET /rating-configs/{id} from the store
import { useRatingConfig } from "@/app/ratings/configurations/hooks/useRatingConfig"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// ─── Props ────────────────────────────────────────────────────────────────────

type ConfigurationDetailSheetProps = {
  /** Numeric config ID (API uses numbers); null means sheet is closed */
  configId: number | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ConfigurationDetailSheet({
  configId,
  open,
  onOpenChange,
}: ConfigurationDetailSheetProps) {
  const navigate = useNavigate()

  // Fetch the config from GET /rating-configs/{id} via the store.
  // Pass null when sheet is closed to skip unnecessary fetches.
  const { config, loading, error } = useRatingConfig(open ? configId : null)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">

        {/* ── Loading skeleton ─────────────────────────────────── */}
        {loading && (
          <div className="flex flex-col gap-5 px-6 py-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Separator />
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        )}

        {/* ── API Error ─────────────────────────────────────────── */}
        {!loading && error && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertCircle className="size-6 text-destructive" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Failed to load</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">{error}</p>
            </div>
          </div>
        )}

        {/* ── Config not found (no error, not loading, no data) ─── */}
        {!loading && !error && !config && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <SlidersHorizontal className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Configuration not found
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                The configuration you are looking for does not exist or has been removed.
              </p>
            </div>
          </div>
        )}

        {/* ── Config detail ─────────────────────────────────────── */}
        {!loading && !error && config && (
          <>
            <SheetHeader>
              {/* type is 'task_rating' | 'stakeholder_rating' (API snake_case) */}
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    config.type === "task_rating"
                      ? "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  }
                >
                  {config.type === "task_rating"
                    ? "Task Rating"
                    : "Stakeholder Rating"}
                </Badge>
                {/* is_active replaces the old 'status' string */}
                <Badge
                  variant={config.is_active ? "default" : "secondary"}
                  className={
                    config.is_active
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                      : ""
                  }
                >
                  {config.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <SheetTitle className="text-lg">{config.name}</SheetTitle>
              {config.description && (
                <SheetDescription>{config.description}</SheetDescription>
              )}
            </SheetHeader>

            <div className="flex flex-col gap-5 px-6 py-4">
              {/* Edit button */}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  onOpenChange(false)
                  navigate(
                    `/ratings/configurations/${config.id}/edit`
                  )
                }}
              >
                <Pencil className="size-3.5" />
                Edit Configuration
              </Button>

              {/* Rating Fields — live inside config_data.fields (API shape) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-1.5">
                    <ListChecks className="size-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">Rating Fields</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {(config.config_data?.fields ?? []).length}{" "}
                    {(config.config_data?.fields ?? []).length === 1 ? "field" : "fields"}
                  </Badge>
                </div>
                {(config.config_data?.fields ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2 text-center">
                    No fields defined yet.
                  </p>
                ) : (
                  <div className="divide-y divide-border rounded-md border">
                    {(config.config_data?.fields ?? []).map((field, index) => (
                      <div
                        key={field.id}
                        className="flex items-start justify-between gap-3 px-3 py-2.5"
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground mt-0.5">
                            {index + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-xs text-foreground">
                              {field.name}
                            </p>
                            {field.description && (
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                                {field.description}
                              </p>
                            )}
                          </div>
                        </div>
                        {/* max_value (snake_case) instead of legacy maxValue */}
                        <Badge
                          variant="outline"
                          className="text-[10px] whitespace-nowrap shrink-0"
                        >
                          Max {field.max_value}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Creator */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-1.5">
                    <User className="size-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">Creator</span>
                </div>
                <div className="flex items-center gap-3">
                  {/* avatar_url (nullable) instead of legacy avatar string */}
                  <Avatar className="size-8">
                    <AvatarImage
                      src={config.creator.avatar_url ?? undefined}
                      alt={config.creator.name}
                    />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(config.creator.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-xs truncate">
                      {config.creator.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {config.creator.email}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Timeline */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-1.5">
                    <Calendar className="size-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">Timeline</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                    <Calendar className="size-3 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        Created
                      </p>
                      {/* created_at (ISO string from API) */}
                      <p className="text-xs font-medium">
                        {formatDate(config.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                    <Clock className="size-3 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        Updated
                      </p>
                      {/* updated_at (ISO string from API) */}
                      <p className="text-xs font-medium">
                        {formatDate(config.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Summary */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-1.5">
                    <Hash className="size-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">Summary</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-xs text-muted-foreground">Type</span>
                    {/* type is 'task_rating' | 'stakeholder_rating' */}
                    <Badge
                      variant="outline"
                      className={
                        config.type === "task_rating"
                          ? "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px]"
                          : "border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px]"
                      }
                    >
                      {config.type === "task_rating" ? "Task Rating" : "Stakeholder"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-xs text-muted-foreground">Status</span>
                    {/* is_active (boolean) replaces the old 'status' string */}
                    <Badge
                      variant={config.is_active ? "default" : "secondary"}
                      className={
                        config.is_active
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]"
                          : "text-[10px]"
                      }
                    >
                      {config.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-xs text-muted-foreground">Fields</span>
                    <span className="text-xs font-semibold">
                      {(config.config_data?.fields ?? []).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ── Legacy full-page component (kept for direct route access) ─────────────────

export default function ConfigurationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <ConfigurationDetailSheet
      // Parse the URL string param to a number; null when missing or NaN
      configId={id ? Number(id) : null}
      open={true}
      onOpenChange={(open) => {
        if (!open) navigate("/ratings/configurations")
      }}
    />
  )
}
