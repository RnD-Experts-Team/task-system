import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Plus, Search, LayoutList, LayoutGrid } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { PaginationInfo } from "@/components/pagination-info"
import { usePagination } from "@/hooks/use-pagination"
import { RolesTableView } from "@/app/roles/pages/roles-table-view"
import { RoleGridView } from "@/app/roles/pages/role-grid-view"
import { RoleFormSheet } from "@/app/roles/pages/role-form-sheet"
import { RoleDetailSheet } from "@/app/roles/pages/role-detail-sheet"
import { ConfirmDeleteRoleDialog } from "@/app/roles/pages/confirm-delete-role-dialog"
import { roles as initialRoles } from "@/app/roles/data"
import type { Role, RoleFormData } from "@/app/roles/data"

type ViewMode = "table" | "grid"

export default function RolesPage() {
  const [roleList, setRoleList] = useState<Role[]>(initialRoles)
  const [search, setSearch] = useState("")
  const [view, setView] = useState<ViewMode>("table")

  // Form sheet state
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  // Detail sheet state
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailRole, setDetailRole] = useState<Role | null>(null)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteRole, setDeleteRole] = useState<Role | null>(null)

  // Next ID counter (mock)
  const [nextId, setNextId] = useState(initialRoles.length + 1)

  const filtered = useMemo(() => {
    if (!search.trim()) return roleList
    const q = search.toLowerCase()
    return roleList.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.guardName.toLowerCase().includes(q) ||
        r.permissions.some((p) => p.toLowerCase().includes(q))
    )
  }, [search, roleList])

  const { page, totalPages, paged, startItem, endItem, totalItems, setPage, resetPage } = usePagination(filtered)

  function handleCreate() {
    setSelectedRole(null)
    setFormMode("create")
    setFormOpen(true)
  }

  function handleEdit(role: Role) {
    setSelectedRole(role)
    setFormMode("edit")
    setFormOpen(true)
    setDetailOpen(false)
  }

  function handleDelete(role: Role) {
    setDeleteRole(role)
    setDeleteDialogOpen(true)
  }

  function handleConfirmDelete() {
    if (deleteRole) {
      setRoleList((prev) => prev.filter((r) => r.id !== deleteRole.id))
    }
    setDeleteDialogOpen(false)
    setDeleteRole(null)
  }

  function handleSelect(role: Role) {
    setDetailRole(role)
    setDetailOpen(true)
  }

  function handleFormSubmit(data: RoleFormData) {
    if (formMode === "create") {
      const newRole: Role = {
        id: String(nextId),
        ...data,
        createdAt: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      }
      setRoleList((prev) => [...prev, newRole])
      setNextId((n) => n + 1)
    } else if (selectedRole) {
      setRoleList((prev) =>
        prev.map((r) =>
          r.id === selectedRole.id ? { ...r, ...data } : r
        )
      )
    }
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">Roles</h2>
              <Badge variant="secondary" className="uppercase tracking-wider">
                {filtered.length} {filtered.length === 1 ? "Role" : "Roles"}
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

        {/* Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter by name, guard or permission..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                resetPage()
              }}
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

        {/* Content (Table / Grid) */}
        {view === "table" ? (
          <RolesTableView
            roles={paged}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSelect={handleSelect}
          />
        ) : (
          <RoleGridView
            roles={paged}
            onSelect={handleSelect}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
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
        role={selectedRole}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
      />

      {/* Role Detail Sheet */}
      <RoleDetailSheet
        role={detailRole}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onEdit={handleEdit}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteRoleDialog
        role={deleteRole}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
