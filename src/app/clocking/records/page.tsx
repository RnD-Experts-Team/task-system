import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DateInput } from "@/components/ui/date-input"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/pagination"
import { usePagination } from "@/hooks/use-pagination"
import { Share, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { clockingRecords, type ClockingRecord, type ClockingRecordStatus } from "../data"
import { CorrectionRequestDialog } from "../components/correction-request-dialog"
import { toast } from "sonner"

const statusConfig: Record<ClockingRecordStatus, { label: string; icon: typeof CheckCircle; className: string }> = {
  verified: { label: "Verified", icon: CheckCircle, className: "text-primary" },
  discrepancy: { label: "Discrepancy", icon: AlertTriangle, className: "text-destructive" },
  pending: { label: "Pending", icon: Clock, className: "text-muted-foreground" },
}

function StatusBadge({ status }: { status: ClockingRecordStatus }) {
  const config = statusConfig[status]
  const Icon = config.icon
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide", config.className)}>
      <Icon className="size-3.5" />
      {config.label}
    </span>
  )
}

function WorkTimeDot({ status }: { status: ClockingRecordStatus }) {
  return (
    <div
      className={cn(
        "size-1.5 rounded-full",
        status === "discrepancy" ? "bg-destructive" : "bg-primary"
      )}
    />
  )
}

export default function ClockingRecordsPage() {
  const [statusFilter, setStatusFilter] = useState<ClockingRecordStatus | "all">("all")
  const [correctionRecord, setCorrectionRecord] = useState<ClockingRecord | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  function handleCorrect(record: ClockingRecord) {
    setCorrectionRecord(record)
    setDialogOpen(true)
  }

  function handleCorrectionSubmit() {
    toast.success("Correction request submitted successfully.")
  }

  const filtered = useMemo(() => {
    if (statusFilter === "all") return clockingRecords
    return clockingRecords.filter((r) => r.status === statusFilter)
  }, [statusFilter])

  const { page, totalPages, paged, startItem, endItem, totalItems, setPage, resetPage } = usePagination(filtered, { itemsPerPage: 5 })
  const totalHours = "164.5"

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Time Management
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">Clocking Records</h1>
            <p className="max-w-lg text-sm text-muted-foreground">
              Review and manage detailed logs of your working hours, breaks, and session statuses.
            </p>
          </div>
          <Button variant="outline" className="gap-2 self-start">
            <Share className="size-3.5" />
            Export Records
          </Button>
        </header>

        {/* Filter Bar */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2 rounded-xl border border-border/20 bg-card/40 p-4">
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Date Range Selection
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap min-w-0">
              <DateInput
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:flex-1 sm:min-w-60 min-w-0 rounded-lg border-none bg-muted/50 px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              />
              <span className="text-muted-foreground text-xs self-center sm:self-auto">to</span>
              <DateInput
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:flex-1 sm:min-w-[240px] min-w-0 rounded-lg border-none bg-muted/50 px-3 py-2 text-sm focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="rounded-xl border border-border/20 bg-card/40 p-4">
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Status Filter
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between rounded-lg border-none bg-muted/50 px-3 py-2 text-sm text-left focus:ring-1 focus:ring-primary"
                >
                  <span className="text-sm font-bold">
                    {statusFilter === "all" ? "All Statuses" : statusConfig[statusFilter].label}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuItem onClick={() => { setStatusFilter("all"); resetPage(); }}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter("verified"); resetPage(); }}>
                  Verified
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter("discrepancy"); resetPage(); }}>
                  Discrepancy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter("pending"); resetPage(); }}>
                  Pending
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="rounded-xl border border-border/20 bg-card/40 p-4">
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Quick Summary
            </label>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black tracking-tighter text-primary">{totalHours}</span>
              <span className="text-[10px] font-bold uppercase text-muted-foreground">Total Hours</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-border/10 bg-card/40 shadow-xl">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Date</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Clock In</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Clock Out</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Work Time</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Break Time</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Breaks</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((record) => (
                  <RecordRow key={record.id} record={record} onCorrect={handleCorrect} />
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border/10 px-4 py-3 sm:flex-row sm:px-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Showing {startItem}-{endItem} of {totalItems} Records
            </p>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>

        {/* Correction Request Dialog */}
        <CorrectionRequestDialog
          record={correctionRecord}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleCorrectionSubmit}
        />

        {/* Insights Section */}
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="group relative overflow-hidden rounded-2xl border border-border/10 bg-card/40 p-6 backdrop-blur-xl">
            <div className="absolute -bottom-8 -right-8 size-48 rounded-full bg-primary/5 blur-3xl transition-all group-hover:bg-primary/10" />
            <h3 className="mb-3 text-xl font-black italic tracking-tighter">Efficiency Insights</h3>
            <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
              Your consistency over the last 30 days is{" "}
              <span className="font-bold text-primary">94%</span>. Most of your clock-ins occur
              within a 10-minute window of 09:00 AM.
            </p>
            <div className="flex gap-3">
              <div className="flex-1 rounded-xl border-l-2 border-primary bg-muted/30 p-3">
                <span className="block text-[10px] font-bold uppercase text-muted-foreground">Avg Break</span>
                <span className="text-lg font-black tracking-tight">42 min</span>
              </div>
              <div className="flex-1 rounded-xl border-l-2 border-primary bg-muted/30 p-3">
                <span className="block text-[10px] font-bold uppercase text-muted-foreground">Overtime</span>
                <span className="text-lg font-black tracking-tight">12h 15m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RecordRow({
  record,
  onCorrect,
}: {
  record: ClockingRecord
  onCorrect: (record: ClockingRecord) => void
}) {
  return (
    <TableRow className="group transition-colors hover:bg-muted/20">
      <TableCell className="py-4">
        <span className="text-sm font-bold">{record.date}</span>
        <p className="text-[10px] uppercase tracking-tighter text-muted-foreground">{record.dayOfWeek}</p>
      </TableCell>
      <TableCell className="text-sm font-medium">{record.clockIn}</TableCell>
      <TableCell className="text-sm font-medium">{record.clockOut}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <WorkTimeDot status={record.status} />
          <span className="text-sm font-bold tracking-tight">{record.workTime}</span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-muted-foreground">{record.breakTime}</TableCell>
      <TableCell>
        <Badge variant="outline" className="text-[10px] font-bold">
          {record.breaks}
        </Badge>
      </TableCell>
      <TableCell>
        <StatusBadge status={record.status} />
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onCorrect(record)}
          className={cn(
            "text-[10px] font-black uppercase tracking-widest transition-opacity",
            record.status === "discrepancy"
              ? "text-primary"
              : "opacity-0 group-hover:opacity-100"
          )}
        >
          Correct
        </Button>
      </TableCell>
    </TableRow>
  )
}
