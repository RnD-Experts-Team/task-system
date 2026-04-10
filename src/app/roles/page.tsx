import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Plus, Search, LayoutList, LayoutGrid, AlertCircle, Loader2 } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { PaginationInfo } from "@/components/pagination-info"
import { RolesTableView } from "@/app/roles/pages/roles-table-view"
import { RoleGridView } from "@/app/roles/pages/role-grid-view"
import { RoleFormSheet } from "@/app/roles/pages/role-form-sheet"
import { RoleDetailSheet } from "@/app/roles/pages/role-detail-sheet"
import { ConfirmDeleteRoleDialog } from "@/app/roles/pages/confirm-delete-role-dialog"
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from "@/app/roles/hooks/useRoles"
import { useRolesStore } from "@/app/roles/stores/rolesStore"
import type { Role } from "@/types"
import type { RoleFormData } from "@/app/roles/types"

type ViewMode = "table" | "grid"

export default function RolesPage() {
  // ── Store data ──
  const [page, setPage] = useState(1)
  const {
    roles,
    pagination,
    loading,
    error,
    clearError,
    availablePermissions,
    permissionsLoading,
    guardOptions,
  } = useRoles(page)
  const { createRole, submitting: creating } = useCreateRole()
  const { updateRole, submitting: updating } = useUpdateRole()
  const { deleteRole, submitting: deleting } = useDeleteRole()
  const getRole = useRolesStore((s) => s.getRole)
  const selectedRole = useRolesStore((s) => s.selectedRole)
  const selectedLoading = useRolesStore((s) => s.selectedLoading)

  // ── Local UI state ──
  const [search, setSearch] = useState("")
  const [view, setView] = useState<ViewMode>("table")
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null)

  const submitting = creating || updating || deleting

  // Client-side search filter
  const filtered = useMemo(() => {
    if (!search.trim()) return roles
    const q = search.toLowerCase()
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.guard_name.toLowerCase().includes(q)
    )
  }, [search, roles])

  // ── Handlers ──

  const handleCreate = useCallback(() => {
    setEditingRole(null)
    setFormMode("create")
    setFormOpen(true)
  }, [])

  const handleEdit = useCallback((role: Role) => {
    setEditingRole(role)
    setFormMode("edit")
    setFormOpen(true)
    setDetailOpen(false)
  }, [])

  const handleDelete = useCallback((role: Role) => {
    setDeleteTarget(role)
    setDeleteDialogOpen(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return
    const ok = await deleteRole(deleteTarget.id)
    if (ok) {
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
    }
  }, [deleteTarget, deleteRole])

  const handleSelect = useCallback((role: Role) => {
    getRole(role.id)
    setDetailOpen(true)
  }, [getRole])

  const handleFormSubmit = useCallback(async (data: RoleFormData) => {
    if (formMode === "create") {
      const result = await createRole(data)
      if (result) setFormOpen(false)
    } else if (editingRole) {
      const ok = await updateRole(editingRole.id, data)
      if (ok) setFormOpen(false)
    }
  }, [formMode, editingRole, createRole, updateRole])

  // ── Pagination ──
  const totalPages = pagination?.last_page ?? 1
  const startItem = pagination?.from ?? 0
  const endItem = pagination?.to ?? 0
  const totalItems = pagination?.total ?? 0

  return (
    <>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">Roles</h2>
              <Badge variant="secondary" className="uppercase tracking-wider">
                {totalItems} {totalItems === 1 ? "Role" : "Roles"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Define access levels and manage what each role is permitted to do.
            </p>
          </div>
          <Button
            className="transition-all hover:shadow-md hover:shadow-primary/25"
            size="lg"
            onClick={handleCreate}
          >
            <Plus />
            Add Role
          </Button>
        </div>

        {/* Error alert */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <Button variant="outline" size="sm" onClick={clearError}>
              Dismiss
            </Button>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter by name or guard..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-10 text-sm"
            />
          </div>

          <ToggleGroup
            type="single"
            variant="outline"
            value={view}
            onValueChange={(v) => {
              if (v) setView(v as ViewMode)
            }}
          >
            <ToggleGroupItem value="table" aria-label="Table view">
              <LayoutList className="size-3.5" />
              <span className="hidden sm:inline">Table</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid className="size-3.5" />
              <span className="hidden sm:inline">Grid</span>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Content (Table / Grid) */}
        {!loading && (
          view === "table" ? (
            <RolesTableView
              roles={filtered}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={handleSelect}
            />
          ) : (
            <RoleGridView
              roles={filtered}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <PaginationInfo startItem={startItem} endItem={endItem} totalItems={totalItems} label="roles" />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* Role Form Sheet */}
      <RoleFormSheet
        mode={formMode}
        role={editingRole}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        submitting={submitting}
        permissionsCatalog={availablePermissions}
        guardOptions={guardOptions}
        permissionsLoading={permissionsLoading}
      />

      {/* Role Detail Sheet */}
      <RoleDetailSheet
        role={selectedRole}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEdit}
        loading={selectedLoading}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteRoleDialog
        role={deleteTarget}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
