import { useMemo } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router"
import { TodoForm, type TodoFormValues } from "./components/todo-form"
import { WorkspacePageShell } from "./components/workspace-page-shell"
import { useTodos } from "./hooks/useTodos"
import { useCreateTodo } from "./hooks/useCreateTodo"

export default function CreateTodoPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  // Parse workspace ID from the URL
  const workspaceId = useMemo(() => {
    const parsed = Number(params.id)
    return Number.isFinite(parsed) ? parsed : null
  }, [params.id])

  // Optional pre-selected parent from ?parent=<id>
  const defaultParentId = useMemo(() => {
    const raw = searchParams.get("parent")
    if (!raw) return null
    const parsed = Number(raw)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  }, [searchParams])

  // Fetch existing todos so we can offer them as parent options
  const { todos } = useTodos(workspaceId)

  // All todos (including subtodos) that can serve as parent — any level is valid
  const parentTodos = useMemo(() => {
    if (defaultParentId) {
      // When navigating from a specific todo's detail page, find that todo
      // (it may be a subtask itself, nested inside another todo's subtodos)
      const allTodos = todos.flatMap((t) => [t, ...(t.subtodos ?? [])])
      const parentTodo = allTodos.find((t) => t.id === defaultParentId)
      // Return only that todo so the dropdown is pre-filled with just it
      return parentTodo ? [parentTodo] : todos.filter((t) => t.parent_id === null)
    }
    return todos.filter((t) => t.parent_id === null)
  }, [todos, defaultParentId])

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
        defaultParentId={defaultParentId}
        submitting={submitting}
        submitError={submitError}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/workspaces/${workspaceId}`)}
      />
    </WorkspacePageShell>
  )
}
