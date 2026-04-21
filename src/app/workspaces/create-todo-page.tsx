import { useMemo } from "react"
import { useNavigate, useParams } from "react-router"
import { TodoForm, type TodoFormValues } from "./components/todo-form"
import { WorkspacePageShell } from "./components/workspace-page-shell"
import { useTodos } from "./hooks/useTodos"
import { useCreateTodo } from "./hooks/useCreateTodo"

export default function CreateTodoPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()

  // Parse workspace ID from the URL
  const workspaceId = useMemo(() => {
    const parsed = Number(params.id)
    return Number.isFinite(parsed) ? parsed : null
  }, [params.id])

  // Fetch existing todos so we can offer them as parent options
  const { todos } = useTodos(workspaceId)

  // Only top-level todos can be parents
  const parentTodos = useMemo(
    () => todos.filter((t) => t.parent_id === null),
    [todos]
  )

  // Create mutation hook
  const { createTodo, submitting, submitError, clearSubmitError } = useCreateTodo()

  // Submit handler — builds the API payload and navigates on success
  async function handleSubmit(values: TodoFormValues) {
    if (!workspaceId) return
    clearSubmitError()

    const todo = await createTodo({
      workspace_id: workspaceId,
      title: values.title,
      // Send null instead of empty string for optional date
      due_date: values.due_date || null,
      status: values.status,
      parent_id: values.parent_id,
    })

    // Navigate back to workspace on success
    if (todo) {
      navigate(`/workspaces/${workspaceId}`)
    }
  }

  return (
    <WorkspacePageShell
      title="Create Todo"
      description="Add a new todo to this workspace."
      backTo={`/workspaces/${workspaceId}`}
      backLabel="Back to workspace"
    >
      <TodoForm
        mode="create"
        parentTodos={parentTodos}
        submitting={submitting}
        submitError={submitError}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/workspaces/${workspaceId}`)}
      />
    </WorkspacePageShell>
  )
}
