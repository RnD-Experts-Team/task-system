import { WorkspaceCard, WorkspaceEmptyCard } from "./workspace-card"
import type { Workspace } from "../types"

type WorkspaceGridViewProps = {
  workspaces: Workspace[]
  onEdit: (workspace: Workspace) => void
  onDelete: (workspace: Workspace) => void
  onCreate: () => void
}

export function WorkspaceGridView({ workspaces, onEdit, onDelete, onCreate }: WorkspaceGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {workspaces.map((workspace) => (
        <WorkspaceCard
          key={workspace.id}
          workspace={workspace}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
      <WorkspaceEmptyCard onCreate={onCreate} />
    </div>
  )
}
