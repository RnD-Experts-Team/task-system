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
import { TicketTableView } from "@/app/tickets/pages/ticket-table-view"
import { TicketGridView } from "@/app/tickets/pages/ticket-grid-view"
import { TicketDetailSheet } from "@/app/tickets/pages/ticket-detail-sheet"
import { ConfirmDeleteTicketDialog } from "@/app/tickets/pages/confirm-delete-ticket-dialog"
import { TicketForm } from "@/app/tickets/pages/ticket-form"
import { tickets as initialTickets, ticketUsers } from "@/app/tickets/data"
import type { Ticket, TicketStatus, TicketFormData } from "@/app/tickets/data"

type PageView = "list" | "form"

type LayoutMode = "table" | "grid"

const statusOptions: { value: TicketStatus | "all"; label: string }[] = [
  { value: "all", label: "All Requests" },
  { value: "open", label: "Open" },
  { value: "in-progress", label: "In Progress" },
  { value: "closed", label: "Closed" },
]

export default function TicketsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "all">("all")

  // Page-level view state
  const [pageView, setPageView] = useState<PageView>("list")
  const [layout, setLayout] = useState<LayoutMode>("table")
  const [formMode, setFormMode] = useState<"create" | "edit">("create")

  // Selected ticket state
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  // Sheet state
  const [sheetOpen, setSheetOpen] = useState(false)
  const [sheetTicket, setSheetTicket] = useState<Ticket | null>(null)

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTicket, setDeleteTicket] = useState<Ticket | null>(null)

  // Mutable data state for claim/unclaim/delete
  const [data, setData] = useState<Ticket[]>(initialTickets)

  const filtered = useMemo(() => {
    let result = data
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.requester.name.toLowerCase().includes(q) ||
          (t.assignee?.name.toLowerCase().includes(q) ?? false) ||
          t.id.toLowerCase().includes(q)
      )
    }
    return result
  }, [search, statusFilter, data])

  const { page, totalPages, paged, startItem, endItem, totalItems, setPage, resetPage } = usePagination(filtered)

  function handleCreate() {
    setSelectedTicket(null)
    setFormMode("create")
    setPageView("form")
  }

  function handleEdit(ticket: Ticket) {
    setSelectedTicket(ticket)
    setFormMode("edit")
    setPageView("form")
    setSheetOpen(false)
  }

  function handleDelete(ticket: Ticket) {
    setDeleteTicket(ticket)
    setDeleteDialogOpen(true)
  }

  function handleConfirmDelete() {
    if (deleteTicket) {
      setData((prev) => prev.filter((t) => t.id !== deleteTicket.id))
    }
    setDeleteDialogOpen(false)
    setDeleteTicket(null)
  }

  function handleSelect(ticket: Ticket) {
    setSheetTicket(ticket)
    setSheetOpen(true)
  }

  function handleClaim(ticket: Ticket) {
    const currentUser = ticketUsers[0]
    setData((prev) =>
      prev.map((t) =>
        t.id === ticket.id
          ? { ...t, assignee: currentUser, status: "in-progress" as const }
          : t
      )
    )
    setSheetOpen(false)
  }

  function handleUnclaim(ticket: Ticket) {
    setData((prev) =>
      prev.map((t) =>
        t.id === ticket.id ? { ...t, assignee: null, status: "open" as const } : t
      )
    )
    setSheetOpen(false)
  }

  function handleFormSubmit(_formData: TicketFormData) {
    setPageView("list")
    setSelectedTicket(null)
  }

  function handleFormCancel() {
    setPageView("list")
    setSelectedTicket(null)
  }

  // Show form view
  if (pageView === "form") {
    return (
      <TicketForm
        mode={formMode}
        initialData={selectedTicket}
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
              <h2 className="text-3xl font-bold tracking-tight">Tickets</h2>
              <Badge variant="secondary" className="uppercase tracking-wider">
                {filtered.length} Tickets
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Track and manage bugs, feature requests, and support tickets.
            </p>
          </div>
          <Button
            className="transition-all hover:shadow-md hover:shadow-primary/25"
            size="lg"
            onClick={handleCreate}
          >
            <Plus />
            Add Ticket
          </Button>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search tickets, users..."
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
                setStatusFilter(v as TicketStatus | "all")
                resetPage()
              }}
            >
              <SelectTrigger className="w-40 h-10">
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
            value={layout}
            onValueChange={(v) => {
              if (v) setLayout(v as LayoutMode)
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

        {/* List / Grid */}
        {layout === "table" ? (
          <TicketTableView
            tickets={paged}
            onSelect={handleSelect}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClaim={handleClaim}
            onUnclaim={handleUnclaim}
          />
        ) : (
          <TicketGridView
            tickets={paged}
            onSelect={handleSelect}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAssign={handleClaim}
          />
        )}

        {/* Pagination */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PaginationInfo startItem={startItem} endItem={endItem} totalItems={totalItems} label="tickets" />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Detail Sheet */}
      <TicketDetailSheet
        ticket={sheetTicket}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onEdit={handleEdit}
        onClaim={handleClaim}
        onUnclaim={handleUnclaim}
      />

      {/* Delete Dialog */}
      <ConfirmDeleteTicketDialog
        ticket={deleteTicket}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
