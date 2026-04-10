import { useMemo } from "react"
import { useNavigate, useParams } from "react-router"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useKanban } from "./hooks/useKanban"
import { KanbanBoard } from "./pages/kanban-board"

// Route page for /projects/:id/kanban-board — fetches kanban data from the API
export default function KanbanBoardPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // Parse the project id from the URL
  const projectId = useMemo(() => {
    const parsed = Number(id)
    return Number.isFinite(parsed) ? parsed : null
  }, [id])

  // Fetch kanban data from GET /projects/:id/kanban
  const { data, loading, error } = useKanban(projectId)

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    )
  }

  // Error or missing data state
  if (error || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="size-5" />
          <span className="font-medium">{error || "Project not found."}</span>
        </div>
        <Button variant="outline" onClick={() => navigate("/projects")}>
          Back to Projects
        </Button>
      </div>
    )
  }

  return (
    <KanbanBoard
      kanban={data}
      onBack={() => navigate("/projects")}
    />
  )
}
