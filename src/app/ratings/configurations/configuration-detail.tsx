import { useNavigate, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
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
} from "lucide-react"
import { configurations } from "@/app/ratings/configurations/data"

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

type ConfigurationDetailSheetProps = {
  configId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ConfigurationDetailSheet({
  configId,
  open,
  onOpenChange,
}: ConfigurationDetailSheetProps) {
  const navigate = useNavigate()
  const config = configId
    ? configurations.find((c) => c.id === configId)
    : null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
        {!config ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="rounded-full bg-muted p-4">
              <SlidersHorizontal className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                Configuration not found
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                The configuration you are looking for does not exist or has been
                removed.
              </p>
            </div>
          </div>
        ) : (
          <>
            <SheetHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    config.type === "TASK"
                      ? "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                  }
                >
                  {config.type === "TASK"
                    ? "Task Rating"
                    : "Stakeholder Rating"}
                </Badge>
                <Badge
                  variant={config.status === "ACTIVE" ? "default" : "secondary"}
                  className={
                    config.status === "ACTIVE"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                      : ""
                  }
                >
                  {config.status === "ACTIVE" ? "Active" : "Inactive"}
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

              {/* Rating Fields */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-1.5">
                    <ListChecks className="size-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">Rating Fields</span>
                  <Badge variant="secondary" className="ml-auto text-xs">
                    {config.fields.length}{" "}
                    {config.fields.length === 1 ? "field" : "fields"}
                  </Badge>
                </div>
                {config.fields.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2 text-center">
                    No fields defined yet.
                  </p>
                ) : (
                  <div className="divide-y divide-border rounded-md border">
                    {config.fields.map((field, index) => (
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
                        <Badge
                          variant="outline"
                          className="text-[10px] whitespace-nowrap shrink-0"
                        >
                          Max {field.maxValue}
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
                  <Avatar className="size-8">
                    <AvatarImage
                      src={config.creator.avatar}
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
                      <p className="text-xs font-medium">
                        {formatDate(config.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border px-3 py-2">
                    <Clock className="size-3 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">
                        Updated
                      </p>
                      <p className="text-xs font-medium">
                        {formatDate(config.updatedAt)}
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
                    <Badge
                      variant="outline"
                      className={
                        config.type === "TASK"
                          ? "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px]"
                          : "border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px]"
                      }
                    >
                      {config.type === "TASK"
                        ? "Task Rating"
                        : "Stakeholder"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-xs text-muted-foreground">
                      Status
                    </span>
                    <Badge
                      variant={
                        config.status === "ACTIVE" ? "default" : "secondary"
                      }
                      className={
                        config.status === "ACTIVE"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[10px]"
                          : "text-[10px]"
                      }
                    >
                      {config.status === "ACTIVE" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <span className="text-xs text-muted-foreground">
                      Fields
                    </span>
                    <span className="text-xs font-semibold">
                      {config.fields.length}
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
      configId={id ?? null}
      open={true}
      onOpenChange={(open) => {
        if (!open) navigate("/ratings/configurations")
      }}
    />
  )
}
