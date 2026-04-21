import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"
import type { ApiRatingConfig } from "@/app/ratings/configurations/types"

// ─── Props ───────────────────────────────────────────────────────────────────
// Consumes ApiRatingConfig (from the real API) instead of the legacy mock type

type ConfigurationTableViewProps = {
  configurations: ApiRatingConfig[]
  onView: (config: ApiRatingConfig) => void
  onEdit: (config: ApiRatingConfig) => void
  onDelete: (config: ApiRatingConfig) => void
}

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
    month: "short",
    day: "numeric",
  })
}

export function ConfigurationTableView({
  configurations,
  onView,
  onEdit,
  onDelete,
}: ConfigurationTableViewProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Fields</TableHead>
          <TableHead>Creator</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {configurations.map((config) => (
          <TableRow key={config.id} className="group">
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
            <TableCell className="py-3">
              {/* type: API returns 'task_rating' or 'stakeholder_rating' */}
              <Badge
                variant="outline"
                className={
                  config.type === "task_rating"
                    ? "border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "border-purple-500/40 bg-purple-500/10 text-purple-600 dark:text-purple-400"
                }
              >
                {config.type === "task_rating" ? "Task Rating" : "Stakeholder Rating"}
              </Badge>
            </TableCell>
            <TableCell className="py-3">
              {/* is_active replaces the old 'status' string field */}
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
            </TableCell>
            <TableCell className="py-3">
              {/* fields live inside config_data.fields; default to empty array if absent */}
              <span className="text-sm text-muted-foreground">
                {(config.config_data?.fields ?? []).length}{" "}
                {(config.config_data?.fields ?? []).length === 1 ? "field" : "fields"}
              </span>
            </TableCell>
            <TableCell className="py-3">
              {/* creator.avatar_url instead of legacy creator.avatar */}
              <div className="flex items-center gap-2">
                <Avatar className="size-7">
                  <AvatarImage src={config.creator.avatar_url ?? undefined} alt={config.creator.name} />
                  <AvatarFallback className="text-[10px]">
                    {getInitials(config.creator.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{config.creator.name}</span>
              </div>
            </TableCell>
            <TableCell className="py-3">
              {/* created_at (ISO string) instead of legacy createdAt */}
              <span className="text-sm text-muted-foreground">{formatDate(config.created_at)}</span>
            </TableCell>
            <TableCell className="py-3 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Actions"
                  >
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => onView(config)}>
                    <Eye className="size-3.5" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(config)}>
                    <Pencil className="size-3.5" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(config)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
