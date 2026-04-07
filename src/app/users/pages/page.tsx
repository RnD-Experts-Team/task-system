import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Plus, Search, LayoutList, LayoutGrid } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { PaginationInfo } from "@/components/pagination-info"
import { usePagination } from "@/hooks/use-pagination"
import { UserTableView } from "@/app/users/pages/user-table-view"
import { UserGridView } from "@/app/users/pages/user-grid-view"
import { UserForm } from "@/app/users/pages/user-form"
import { ConfirmDeleteDialog } from "@/app/users/pages/confirm-delete-dialog"
import { users } from "@/app/users/data"
import type { User } from "@/app/users/data"
import type { UserFormData } from "@/app/users/pages/user-form"
import { UserDetailSheet } from "./user-detail-sheet"

type ViewMode = "table" | "grid"
type PageView = "list" | "form"

export default function UsersPage() {
  const [view, setView] = useState<ViewMode>("table")
  const [search, setSearch] = useState("")

  // Page-level view state
  const [pageView, setPageView] = useState<PageView>("list")
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Selected user state
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetUser, setSheetUser] = useState<User | null>(null)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return users
    const q = search.toLowerCase()
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    )
  }, [search])

  const { page, totalPages, paged, startItem, endItem, totalItems, setPage, resetPage } = usePagination(filtered)

  function handleCreate() {
    setSelectedUser(null)
    setFormMode("create")
    setPageView("form")
  }

  function handleEdit(user: User) {
    setSelectedUser(user)
    setFormMode("edit")
    setPageView("form")
    setSheetOpen(false)
  }

  function handleDelete(user: User) {
    setDeleteUser(user)
    setDeleteDialogOpen(true)
  }

  function handleConfirmDelete() {
    // UI-only stub — no actual deletion
    setDeleteDialogOpen(false)
    setDeleteUser(null)
  }

  function handleSelect(user: User) {
    setSheetUser(user)
    setSheetOpen(true)
  }

  function handleFormSubmit(_data: UserFormData) {
    // UI-only stub — no actual persistence
    setPageView("list")
    setSelectedUser(null)
  }

  function handleFormCancel() {
    setPageView("list")
    setSelectedUser(null)
  }

  // Show form view
  if (pageView === "form") {
    return (
      <UserForm
        mode={formMode}
        initialData={selectedUser}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
      />
    )
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">Users</h2>
              <Badge variant="secondary" className="uppercase tracking-wider">
                {filtered.length} Users
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Manage organizational access, roles, and security protocols.
            </p>
          </div>
          <Button
            className="transition-all hover:shadow-md hover:shadow-primary/25"
            size="lg"
            onClick={handleCreate}
          >
            <Plus />
            Add User
          </Button>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter by name, email or role..."
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

        {/* Content */}
        {view === "table" ? (
          <UserTableView
            users={paged}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSelect={handleSelect}
          />
        ) : (
          <UserGridView
            users={paged}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSelect={handleSelect}
          />
        )}

        {/* Pagination */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PaginationInfo startItem={startItem} endItem={endItem} totalItems={totalItems} label="users" />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* User Detail Sheet */}
      <UserDetailSheet
        user={sheetUser}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onEdit={handleEdit}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        user={deleteUser}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
