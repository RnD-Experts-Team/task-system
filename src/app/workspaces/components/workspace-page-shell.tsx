import { type ReactNode } from "react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

type WorkspacePageShellProps = {
  title: string
  description: string
  backTo?: string
  backLabel?: string
  headerAction?: ReactNode
  children: ReactNode
}

export function WorkspacePageShell({
  title,
  description,
  backTo = "/workspaces",
  backLabel = "Back to workspaces",
  headerAction,
  children,
}: WorkspacePageShellProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="space-y-3 rounded-2xl border bg-linear-to-br from-background via-background to-primary/10 p-5 sm:p-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit px-2">
          <Link to={backTo}>
            <ChevronLeft className="size-4" />
            {backLabel}
          </Link>
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {headerAction}
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4 sm:p-6">{children}</div>
    </div>
  )
}
