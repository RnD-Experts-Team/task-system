import { useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Pencil, AlertCircle, UserPlus, Plus } from "lucide-react"
import { WorkspacePageShell } from "./components/workspace-page-shell"
import { WorkspaceMembersTable } from "./components/workspace-members-table"
import { WorkspaceTodosTable } from "./components/workspace-todos-table"
import { AddMemberDialog } from "./components/add-member-dialog"
import { ConfirmRemoveMemberDialog } from "./components/confirm-remove-member-dialog"
import { ConfirmDeleteTodoDialog } from "./components/confirm-delete-todo-dialog"
import { UpdateMemberRoleDialog } from "./components/update-member-role-dialog"
import { WorkspaceDetailsSkeleton, MembersTableSkeleton, TodosTableSkeleton } from "./components/skeletons"
import { useWorkspace } from "./hooks/useWorkspace"
import { useWorkspaceMembers } from "./hooks/useWorkspaceMembers"
import { useTodos } from "./hooks/useTodos"
import { useDeleteTodo } from "./hooks/useDeleteTodo"
import { useAddMember } from "./hooks/useAddMember"
import { useRemoveMember } from "./hooks/useRemoveMember"
import { useUpdateMemberRole } from "./hooks/useUpdateMemberRole"
import type { WorkspaceMember, AddWorkspaceMemberPayload, UpdateMemberRolePayload, WorkspaceTodo } from "./types"

/**
 * Generates initials from a name (first letter of first two words).
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
 * Formats an ISO date string into a readable format.
 */
function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * WorkspaceDetailsPage — shows full workspace profile with members.
 * Fetches data from GET /workspaces/{id} and GET /workspaces/{id}/users.
 */
export default function WorkspaceDetailsPage() {
  const navigate = useNavigate()
  const params = useParams<{ id: string }>()

  // Parse the workspace ID from the URL
  const workspaceId = useMemo(() => {
    const parsed = Number(params.id)
    return Number.isFinite(parsed) ? parsed : null
  }, [params.id])

  // Fetch workspace details from the API
  const { workspace, loading, error } = useWorkspace(workspaceId)

  // Fetch workspace members from the API
  const {
    members,
    loading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useWorkspaceMembers(workspaceId)

  // ─── Add member ───────────────────────────────────────────────
  const { addMember, submitting: addingMember, submitError: addError, clearSubmitError: clearAddError } = useAddMember()
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  // ─── Remove member ────────────────────────────────────────────
  const { removeMember, submitting: removingMember, submitError: removeError, clearSubmitError: clearRemoveError } = useRemoveMember()
  const [removeTarget, setRemoveTarget] = useState<WorkspaceMember | null>(null)
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false)

  // ─── Update role ──────────────────────────────────────────────
  const { updateMemberRole, submitting: updatingRole, submitError: roleError, clearSubmitError: clearRoleError } = useUpdateMemberRole()
  const [roleTarget, setRoleTarget] = useState<WorkspaceMember | null>(null)
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)

  // ─── Todos ───────────────────────────────────────────────────
  const { todos, loading: todosLoading, error: todosError, refetch: refetchTodos } = useTodos(workspaceId)
  const { deleteTodo, deleting: deletingTodo, deleteError: deleteTodoError, clearDeleteError } = useDeleteTodo()
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceTodo | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // ─── Handlers ─────────────────────────────────────────────────

  /** Opens the remove-member confirmation dialog for the selected member */
  function handleRemoveClick(member: WorkspaceMember) {
    clearRemoveError()
    setRemoveTarget(member)
    setRemoveDialogOpen(true)
  }

  /** Executes the removal; closes dialog on success */
  async function handleRemoveConfirm() {
    if (!workspaceId || !removeTarget) return
    const ok = await removeMember(workspaceId, removeTarget.id)
    if (ok) setRemoveDialogOpen(false)
  }

  /** Opens the change-role dialog for the selected member */
  function handleChangeRoleClick(member: WorkspaceMember) {
    clearRoleError()
    setRoleTarget(member)
    setRoleDialogOpen(true)
  }

  /** Submits the new role; closes dialog on success */
  async function handleRoleSubmit(payload: UpdateMemberRolePayload) {
    if (!workspaceId || !roleTarget) return
    const ok = await updateMemberRole(workspaceId, roleTarget.id, payload)
    if (ok) setRoleDialogOpen(false)
  }

  /** Submits the add-member form; closes dialog on success and refreshes members */
  async function handleAddMember(payload: AddWorkspaceMemberPayload) {
    if (!workspaceId) return
    const ok = await addMember(workspaceId, payload)
    if (ok) {
      setAddDialogOpen(false)
      // Members list is refreshed inside the store action after a successful add
    }
  }

  /** Opens confirm delete dialog for a todo */
  function handleDeleteClick(todo: WorkspaceTodo) {
    clearDeleteError()
    setDeleteTarget(todo)
    setDeleteDialogOpen(true)
  }

  /** Executes todo deletion; closes dialog on success and refetches todos */
  async function handleDeleteConfirm() {
    if (!workspaceId || !deleteTarget) return
    const ok = await deleteTodo(workspaceId, deleteTarget.id)
    if (ok) {
      setDeleteDialogOpen(false)
      // Refresh list to ensure server state is in sync
      refetchTodos && refetchTodos()
    }
  }

  // Loading state — show skeleton while fetching
  if (loading) {
    return <WorkspaceDetailsSkeleton />
  }

  // Error state — show error message with retry navigation
  if (error || !workspace) {
    return (
      <WorkspacePageShell
        title="Workspace Not Found"
        description="The workspace you're looking for doesn't exist or couldn't be loaded."
      >
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="size-4" />
            <span className="font-medium">{error || "Workspace not found"}</span>
          </div>
          <Button variant="outline" onClick={() => navigate("/workspaces")}>
            Return to workspaces
          </Button>
        </div>
      </WorkspacePageShell>
    )
  }

  return (
    <>
    <WorkspacePageShell
      title="Workspace Details"
      description="Full workspace profile with members and overview."
    >
      <div className="space-y-6">
        {/* Workspace Header Card — name, description, edit button */}
        <Card className="border-border/70 bg-linear-to-br from-background to-muted/20">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {/* Initials icon as fallback */}
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
                  {getInitials(workspace.name)}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <CardTitle className="text-2xl leading-tight">{workspace.name}</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Created {formatDate(workspace.created_at)}
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={() => navigate(`/workspaces/${workspace.id}/edit`)}>
              <Pencil className="size-4" />
              Edit Workspace
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {workspace.description || "No description provided."}
            </p>
          </CardContent>
        </Card>

        {/* Summary Cards — members count and last updated */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Members</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {membersLoading ? (
                <div className="h-10 w-20 bg-muted rounded animate-pulse" />
              ) : (
                <>
                  <div className="flex items-center -space-x-3">
                    {members.slice(0, 4).map((m) => (
                      <Avatar key={m.id} className="border-2 border-card">
                        <AvatarFallback className="text-xs font-bold">
                          {getInitials(m.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {members.length > 4 && (
                      <div className="flex size-10 items-center justify-center rounded-full border-2 border-card bg-muted text-xs font-bold text-muted-foreground">
                        +{members.length - 4}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    {members.length} member{members.length !== 1 ? "s" : ""}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-black tracking-tighter">
                {formatDate(workspace.updated_at)}
              </span>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Members Tab */}
        <Tabs defaultValue="todos">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <TabsList variant="line">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              {/* Add Member button */}
              <Button
                size="sm"
                onClick={() => {
                  clearAddError()
                  setAddDialogOpen(true)
                }}
              >
                <UserPlus className="size-4" />
                Add Member
              </Button>
              {/* New Todo button */}
              <Button size="sm" variant="outline" onClick={() => navigate(`/workspaces/${workspace?.id}/todos/create`)}>
                <Plus className="size-4" />
                New Todo
              </Button>
            </div>
          </div>

          <TabsContent value="members" className="mt-6">
            {membersError ? (
              /* Error loading members — show message */
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="size-4" />
                  <span className="text-sm font-medium">{membersError}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchMembers()}>
                  Retry
                </Button>
              </div>
            ) : membersLoading ? (
              <MembersTableSkeleton />
            ) : (
              /* Members table with action callbacks for change-role and remove */
              <WorkspaceMembersTable
                members={members}
                onChangeRole={handleChangeRoleClick}
                onRemove={handleRemoveClick}
              />
            )}
          </TabsContent>
          <TabsContent value="todos" className="mt-6">
            {todosError ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="size-4" />
                  <span className="text-sm font-medium">{todosError}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchTodos && refetchTodos()}>
                  Retry
                </Button>
              </div>
            ) : todosLoading ? (
              <TodosTableSkeleton />
            ) : (
              <WorkspaceTodosTable todos={todos} workspaceId={workspace.id} onDelete={handleDeleteClick} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </WorkspacePageShell>

    {/* ─── Dialogs ──────────────────────────────────────────────────── */}

    {/* Add Member dialog — POST /workspaces/{id}/users */}
    <AddMemberDialog
      open={addDialogOpen}
      onOpenChange={(open) => {
        if (!open) clearAddError()
        setAddDialogOpen(open)
      }}
      onSubmit={handleAddMember}
      submitting={addingMember}
      submitError={addError}
    />

    {/* Confirm Remove Member dialog — DELETE /workspaces/{id}/users/{userId} */}
    <ConfirmRemoveMemberDialog
      member={removeTarget}
      open={removeDialogOpen}
      onOpenChange={(open) => {
        if (!open) clearRemoveError()
        setRemoveDialogOpen(open)
      }}
      onConfirm={handleRemoveConfirm}
      submitting={removingMember}
      submitError={removeError}
    />

    {/* Update Member Role dialog — PUT /workspaces/{id}/users/{userId}/role */}
    <UpdateMemberRoleDialog
      member={roleTarget}
      open={roleDialogOpen}
      onOpenChange={(open) => {
        if (!open) clearRoleError()
        setRoleDialogOpen(open)
      }}
      onSubmit={handleRoleSubmit}
      submitting={updatingRole}
      submitError={roleError}
    />
    
    {/* Confirm Delete Todo dialog — DELETE /todos/{id} */}
    <ConfirmDeleteTodoDialog
      todo={deleteTarget}
      open={deleteDialogOpen}
      onOpenChange={(open) => {
        if (!open) clearDeleteError()
        setDeleteDialogOpen(open)
      }}
      onConfirm={handleDeleteConfirm}
      submitting={deletingTodo}
      submitError={deleteTodoError}
    />
  </>
  )
}
