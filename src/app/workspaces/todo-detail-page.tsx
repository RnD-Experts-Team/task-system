import { useMemo } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { AlertCircle, Pencil, Calendar, CheckCircle2, Plus } from "lucide-react"
import { TodoDetailSkeleton } from "./components/skeletons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { WorkspacePageShell } from "./components/workspace-page-shell"
import { useWorkspace } from "./hooks/useWorkspace"
import { useTodo } from "./hooks/useTodo"
import { TODO_STATUS_LABELS, type TodoStatus } from "./types"

function statusClassName(status: TodoStatus): string {
  switch (status) {
    case "pending":
      return "border-muted-foreground/30 text-muted-foreground"
    case "inprogress":
      return "border-primary/40 text-primary bg-primary/10"
    case "completed":
      return "border-emerald-500/40 text-emerald-600 bg-emerald-500/10"
  }
}

export default function TodoDetailPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string; todoId: string }>()

  const workspaceId = useMemo(() => {
    const parsed = Number(params.id)
    return Number.isFinite(parsed) ? parsed : null
  }, [params.id])

  const todoId = useMemo(() => {
    const parsed = Number(params.todoId)
    return Number.isFinite(parsed) ? parsed : null
  }, [params.todoId])

  // Load todo from API
  const { todo, loading: todoLoading } = useTodo(workspaceId, todoId)

  // Fetch workspace from the API
  const { workspace } = useWorkspace(workspaceId)

  const parentTodoId = todo?.parent_id ?? null

  const subtasks = todo?.subtodos ?? []

  if (todoLoading) {
    return <TodoDetailSkeleton workspaceId={workspaceId} />
  }

  // At this point todo and workspace are guaranteed to exist

  if (!todo || !workspace) {
    return (
      <WorkspacePageShell
        title="Todo Not Found"
        description="The todo you're looking for doesn't exist."
        backTo={`/workspaces/${workspaceId}`}
        backLabel="Back to workspace"
      >
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-4" />
            <span className="font-medium">Todo not found</span>
          </div>
          <Button variant="outline" onClick={() => navigate(`/workspaces/${workspaceId}`)}>
            Return to workspace
          </Button>
        </div>
      </WorkspacePageShell>
    )
  }

  return (
    <WorkspacePageShell
      title="Todo Details"
      description={`Viewing todo in "${workspace.name}"`}
      backTo={`/workspaces/${workspaceId}`}
      backLabel="Back to workspace"
    >
      <div className="space-y-6">
        {/* Main Todo Card */}
        <Card className="border-border/70 bg-linear-to-br from-background to-muted/20">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className={statusClassName(todo.status)}>
                  {TODO_STATUS_LABELS[todo.status]}
                </Badge>
              </div>
              <CardTitle className={`text-2xl leading-tight ${todo.status === "completed" ? "line-through opacity-70" : ""}`}>
                {todo.title}
              </CardTitle>
              {parentTodoId && (
                <p className="text-sm text-muted-foreground">
                  Subtask of {" "}
                  <Link to={`/workspaces/${workspaceId}/todos/${parentTodoId}`} className="text-primary hover:underline">
                    Parent Task
                  </Link>
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/workspaces/${workspaceId}/todos/${todo.id}/edit`)}
              >
                <Pencil className="size-4" />
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              No description provided.
            </p>
          </CardContent>
        </Card>

        {/* Info Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Due Date</CardTitle>
            </CardHeader>
            <CardContent>
              {todo.due_date ? (
                <div className="flex items-center gap-2 text-sm">
                  {todo.status === "completed" ? (
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  ) : (
                    <Calendar className="size-4 text-muted-foreground" />
                  )}
                  <span className="font-medium">
                    {new Date(todo.due_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No due date set</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Created</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">
                {new Date(todo.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">
                {new Date(todo.updated_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Subtasks */}
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold tracking-tight">Subtasks</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(`/workspaces/${workspaceId}/todos/create?parent=${todo.id}`)}
              >
                <Plus className="size-4" />
                Add Subtask
              </Button>
            </div>
            {subtasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subtasks yet. Add one above.</p>
            ) : (
              <div className="space-y-2">
                {subtasks.map((sub) => (
                  <Card
                    key={sub.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => navigate(`/workspaces/${workspaceId}/todos/${sub.id}`)}
                  >
                    <CardContent className="flex items-center justify-between py-3 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={`font-medium text-sm ${sub.status === "completed" ? "line-through opacity-60" : ""}`}>
                          {sub.title}
                        </span>
                        {sub.due_date && (
                          <span className="text-xs text-muted-foreground">
                            Due: {new Date(sub.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-[0.6rem] ${statusClassName(sub.status)}`}>
                          {TODO_STATUS_LABELS[sub.status]}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      </div>
    </WorkspacePageShell>
  )
}
