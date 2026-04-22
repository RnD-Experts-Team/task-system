import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react"
import type { ApiFinalRatingConfig } from "@/app/ratings/final-ratings/types"

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Format an ISO date string to a human-readable date */
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/** Count how many components are enabled inside the config data */
function countEnabledComponents(config: ApiFinalRatingConfig["config"]): number {
  if (!config) return 0
  return Object.values(config).filter((v) => v?.enabled === true).length
}

/** Total number of possible components */
const TOTAL_COMPONENTS = 5

// ─── Props ────────────────────────────────────────────────────────────────────

type FinalRatingConfigTableProps = {
  configs: ApiFinalRatingConfig[]
  onView: (config: ApiFinalRatingConfig) => void
  onEdit?: (config: ApiFinalRatingConfig) => void
  onDelete?: (config: ApiFinalRatingConfig) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FinalRatingConfigTable({
  configs,
  onView,
  onEdit,
  onDelete,
}: FinalRatingConfigTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          {/* Shows how many components are enabled out of total */}
          <TableHead>Components</TableHead>
          <TableHead>Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {configs.map((config) => (
          <TableRow key={config.id} className="group">
            {/* Name + description */}
            <TableCell className="py-3">
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  className="font-medium text-foreground text-sm hover:text-primary hover:underline underline-offset-2 transition-colors text-left"
                  onClick={() => onView(config)}
                >
                  {config.name}
                </button>
                {config.description && (
                  <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                    {config.description}
                  </span>
                )}
              </div>
            </TableCell>

            {/* Active / Inactive badge */}
            <TableCell className="py-3">
              {config.is_active ? (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                >
                  <CheckCircle2 className="size-3 mr-1" />
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <XCircle className="size-3 mr-1" />
                  Inactive
                </Badge>
              )}
            </TableCell>

            {/* Enabled components count */}
            <TableCell className="py-3">
              <span className="text-sm text-muted-foreground">
                {countEnabledComponents(config.config)}/{TOTAL_COMPONENTS}
              </span>
            </TableCell>

            {/* Updated date */}
            <TableCell className="py-3 text-sm text-muted-foreground">
              {formatDate(config.updated_at)}
            </TableCell>

            {/* Row actions dropdown */}
            <TableCell className="py-3 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Open actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {/* View — opens the detail sheet (GET /final-ratings/configs/{id}) */}
                  <DropdownMenuItem onClick={() => onView(config)}>
                    <Eye className="size-3.5 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  {/* Edit — opens the edit form sheet (PUT /final-ratings/configs/{id}) */}
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(config)}>
                      <Pencil className="size-3.5 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      {/* Delete — opens the confirm dialog; disabled for the active config */}
                      <DropdownMenuItem
                        onClick={() => onDelete(config)}
                        disabled={config.is_active}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="size-3.5 mr-2" />
                        Delete
                        {config.is_active && (
                          <span className="ml-2 text-[10px] text-muted-foreground">(active)</span>
                        )}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
