import { useNavigate } from "react-router"
import { Card, CardContent } from "@/components/ui/card"
import { MoreVertical, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import type { Workspace } from "../types"

/**
 * Generates initials from a workspace name (first letter of first two words).
 * Used as a fallback icon in the card header.
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Formats an ISO date string into a short readable format.
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

type WorkspaceCardProps = {
  workspace: Workspace
  onEdit: (workspace: Workspace) => void
  onDelete: (workspace: Workspace) => void
}

/**
 * WorkspaceCard — displays a single workspace in the grid.
 * Shows name, description, created date, and action menu.
 */
export function WorkspaceCard({ workspace, onEdit, onDelete }: WorkspaceCardProps) {
  const navigate = useNavigate()

  return (
    <Card
      className="group relative flex flex-col justify-between min-h-56 border-border/70 bg-linear-to-br from-background via-background to-muted/10 hover:to-muted/30 transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/workspaces/${workspace.id}`)}
    >
      <CardContent className="flex flex-col gap-4 pt-6 px-6 flex-1">
        {/* Header: initials icon + dropdown menu */}
        <div className="flex justify-between items-start">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-lg">
            {getInitials(workspace.name)}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/workspaces/${workspace.id}`) }}>
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(workspace) }}>
                Edit Workspace
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={(e) => { e.stopPropagation(); onDelete(workspace) }}
              >
                Delete Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title & description */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
            {workspace.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {workspace.description || "No description provided."}
          </p>
        </div>

        {/* Footer: created date */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-border/50">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            Created {formatDate(workspace.created_at)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Empty Card — shown at the end of the grid ───────────────────

export function WorkspaceEmptyCard({ onCreate }: { onCreate: () => void }) {
  return (
    <Card
      className="relative flex flex-col items-center justify-center min-h-56 border-2 border-dashed border-border/50 cursor-pointer hover:border-primary/50 transition-all group"
      onClick={onCreate}
    >
      <CardContent className="flex flex-col items-center gap-3 text-center pt-6">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted group-hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-3xl text-muted-foreground">inbox_customize</span>
        </div>
        <h3 className="text-lg font-bold text-muted-foreground">Empty Space</h3>
        <p className="text-sm text-muted-foreground/70 max-w-50">
          No active projects here yet. Start fresh with a new workspace.
        </p>
        <span className="text-primary font-bold uppercase text-xs tracking-widest mt-2">
          + Create Workspace
        </span>
      </CardContent>
    </Card>
  )
}

// ─── Skeleton Card — shown while loading ─────────────────────────

export function WorkspaceCardSkeleton() {
  return (
    <Card className="flex flex-col min-h-56 animate-pulse">
      <CardContent className="flex flex-col gap-4 pt-6 px-6 flex-1">
        <div className="flex justify-between items-start">
          <div className="size-12 rounded-2xl bg-muted" />
          <div className="size-8 rounded-full bg-muted" />
        </div>
        <div className="space-y-3">
          <div className="h-6 w-2/3 bg-muted rounded-full" />
          <div className="h-3 w-full bg-muted rounded-full" />
          <div className="h-3 w-4/5 bg-muted rounded-full" />
        </div>
        <div className="flex items-center justify-between pt-4 mt-auto border-t border-border/50">
          <div className="h-4 w-28 bg-muted rounded-full" />
        </div>
      </CardContent>
    </Card>
  )
}
