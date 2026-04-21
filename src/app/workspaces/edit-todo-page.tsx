import { useMemo } from "react"
import { useNavigate, useParams } from "react-router"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TodoForm, type TodoFormValues } from "./components/todo-form"
import { WorkspacePageShell } from "./components/workspace-page-shell"
import { useTodo } from "./hooks/useTodo"
import { useTodos } from "./hooks/useTodos"
import { useUpdateTodo } from "./hooks/useUpdateTodo"
import { EditTodoSkeleton } from "./components/skeletons"

export default function EditTodoPage() {
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
  const { todo, loading: todoLoading, error: todoError } = useTodo(todoId)

  // Parent options come from the workspace todo list
  const { todos: allTodos } = useTodos(workspaceId)
  const parentTodos = useMemo(
    () => allTodos.filter((t) => t.parent_id === null && t.id !== todoId),
    [allTodos, todoId]
  )

  const { updateTodo, submitting, submitError, clearSubmitError } = useUpdateTodo()

  async function handleSubmit(values: TodoFormValues) {
    if (!todoId) return
    clearSubmitError()
    const updated = await updateTodo(todoId, {
      workspace_id: workspaceId,
      title: values.title,
      due_date: values.due_date || null,
      status: values.status,
      parent_id: values.parent_id,
    })
    if (updated && workspaceId) {
      navigate(`/workspaces/${workspaceId}/todos/${todoId}`)
    }
  }

  if (todoLoading) {
    return <EditTodoSkeleton workspaceId={workspaceId} />
  }

  if (todoError || !todo) {
    return (
      <WorkspacePageShell
        title="Edit Todo"
        description="Update todo details."
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
      title="Edit Todo"
      description="Update the title, description, due date, and priority of this todo."
      backTo={`/workspaces/${workspaceId}/todos/${todoId}`}
      backLabel="Back to todo"
    >
      <TodoForm
        mode="edit"
        todo={todo}
        parentTodos={parentTodos}
        submitting={submitting}
        submitError={submitError}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/workspaces/${workspaceId}/todos/${todoId}`)}
      />
    </WorkspacePageShell>
  )
}
