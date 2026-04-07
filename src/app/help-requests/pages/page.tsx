import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, LayoutList, LayoutGrid } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { PaginationInfo } from "@/components/pagination-info"
import { usePagination } from "@/hooks/use-pagination"
import { HelpRequestTableView } from "@/app/help-requests/pages/help-request-table-view"
import { HelpRequestGridView } from "@/app/help-requests/pages/help-request-grid-view"
import { HelpRequestDetailSheet } from "@/app/help-requests/pages/help-request-detail-sheet"
import { ConfirmDeleteHelpRequestDialog } from "@/app/help-requests/pages/confirm-delete-help-request-dialog"
import { HelpRequestForm } from "@/app/help-requests/pages/help-request-form"
import { helpRequests, users } from "@/app/help-requests/data"
import type { HelpRequest, HelpRequestStatus, HelpRequestFormData } from "@/app/help-requests/data"

type ViewMode = "table" | "grid"
type PageView = "list" | "form"

const statusOptions: { value: HelpRequestStatus | "all"; label: string }[] = [
  { value: "all", label: "All Requests" },
  { value: "open", label: "Open" },
  { value: "claimed", label: "Claimed" },
  { value: "completed", label: "Completed" },
]

export default function HelpRequestsPage() {
  const [view, setView] = useState<ViewMode>("table")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<HelpRequestStatus | "all">("all")

  // Page-level view state
  const [pageView, setPageView] = useState<PageView>("list")
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Selected request state
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null)

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetRequest, setSheetRequest] = useState<HelpRequest | null>(null)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteRequest, setDeleteRequest] = useState<HelpRequest | null>(null)

  // Mutable data state for claim/unclaim
  const [data, setData] = useState<HelpRequest[]>(helpRequests)

  const filtered = useMemo(() => {
    let result = data
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.description.toLowerCase().includes(q) ||
          r.requester.name.toLowerCase().includes(q) ||
          (r.helper?.name.toLowerCase().includes(q) ?? false)
      )
    }
    return result
  }, [search, statusFilter, data])

  const { page, totalPages, paged, startItem, endItem, totalItems, setPage, resetPage } = usePagination(filtered)

  function handleCreate() {
    setSelectedRequest(null)
    setFormMode("create")
    setPageView("form")
  }

  function handleEdit(request: HelpRequest) {
    setSelectedRequest(request)
    setFormMode("edit")
    setPageView("form")
    setSheetOpen(false)
  }

  function handleDelete(request: HelpRequest) {
    setDeleteRequest(request)
    setDeleteDialogOpen(true)
  }

  function handleConfirmDelete() {
    if (deleteRequest) {
      setData((prev) => prev.filter((r) => r.id !== deleteRequest.id))
    }
    setDeleteDialogOpen(false)
    setDeleteRequest(null)
  }

  function handleSelect(request: HelpRequest) {
    setSheetRequest(request)
    setSheetOpen(true)
  }

  function handleClaim(request: HelpRequest) {
    // Mock claim: assign first available user as helper
    const currentUser = users[0]
    setData((prev) =>
      prev.map((r) =>
        r.id === request.id ? { ...r, helper: currentUser, status: "claimed" as const } : r
      )
    )
    setSheetOpen(false)
  }

  function handleUnclaim(request: HelpRequest) {
    setData((prev) =>
      prev.map((r) =>
        r.id === request.id ? { ...r, helper: null, status: "open" as const } : r
      )
    )
    setSheetOpen(false)
  }

  function handleFormSubmit(_data: HelpRequestFormData) {
    setPageView("list")
    setSelectedRequest(null)
  }

  function handleFormCancel() {
    setPageView("list")
    setSelectedRequest(null)
  }

  // Show form view
  if (pageView === "form") {
    return (
      <HelpRequestForm
        mode={formMode}
        initialData={selectedRequest}
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
              <h2 className="text-3xl font-bold tracking-tight">Help Requests</h2>
              <Badge variant="secondary" className="uppercase tracking-wider">
                {filtered.length} Requests
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Manage and track help requests across all teams and projects.
            </p>
          </div>
          <Button
            className="transition-all hover:shadow-md hover:shadow-primary/25"
            size="lg"
            onClick={handleCreate}
          >
            <Plus />
            Add Request
          </Button>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search requests, users..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  resetPage()
                }}
                className="pl-8 h-10 text-sm"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v as HelpRequestStatus | "all")
                resetPage()
              }}
            >
              <SelectTrigger className="w-36 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <HelpRequestTableView
            requests={paged}
            onSelect={handleSelect}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClaim={handleClaim}
            onUnclaim={handleUnclaim}
          />
        ) : (
          <HelpRequestGridView
            requests={paged}
            onSelect={handleSelect}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClaim={handleClaim}
            onUnclaim={handleUnclaim}
          />
        )}

        {/* Pagination */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PaginationInfo startItem={startItem} endItem={endItem} totalItems={totalItems} label="requests" />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Help Request Detail Sheet */}
      <HelpRequestDetailSheet
        request={sheetRequest}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onEdit={handleEdit}
        onClaim={handleClaim}
        onUnclaim={handleUnclaim}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteHelpRequestDialog
        request={deleteRequest}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
