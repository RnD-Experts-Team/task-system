import { useState, useMemo } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Settings2 } from "lucide-react"
import { Pagination } from "@/components/pagination"
import { usePagination } from "@/hooks/use-pagination"
import { ConfigurationTableView } from "@/app/ratings/configurations/configuration-table-view"
import { ConfirmDeleteConfigurationDialog } from "@/app/ratings/configurations/confirm-delete-configuration-dialog"
import { ConfigurationDetailSheet } from "@/app/ratings/configurations/configuration-detail"
import { configurations as initialConfigurations } from "@/app/ratings/configurations/data"
import type { Configuration, ConfigurationType } from "@/app/ratings/configurations/data"
import { toast } from "sonner"
import InlineStats from "@/components/inline-stats"

type TypeFilter = ConfigurationType | "ALL"

const typeOptions: { value: TypeFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "TASK", label: "Task Rating" },
  { value: "STAKEHOLDER", label: "Stakeholder Rating" },
]

export default function RatingsConfigurationsPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<Configuration[]>(initialConfigurations)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL")

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfig, setDeleteConfig] = useState<Configuration | null>(null)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailConfigId, setDetailConfigId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = data
    if (typeFilter !== "ALL") {
      result = result.filter((c) => c.type === typeFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.creator.name.toLowerCase().includes(q)
      )
    }
    return result
  }, [data, search, typeFilter])

  const { page, totalPages, paged, setPage, resetPage } = usePagination(filtered)

  const stats = useMemo(() => ({
    total: data.length,
    active: data.filter((c) => c.status === "ACTIVE").length,
    task: data.filter((c) => c.type === "TASK").length,
    stakeholder: data.filter((c) => c.type === "STAKEHOLDER").length,
  }), [data])

  function handleView(config: Configuration) {
    setDetailConfigId(config.id)
    setDetailOpen(true)
  }

  function handleEdit(config: Configuration) {
    navigate(`/ratings/configurations/${config.id}/edit`)
  }

  function handleDelete(config: Configuration) {
    setDeleteConfig(config)
    setDeleteDialogOpen(true)
  }

  function handleConfirmDelete() {
    if (deleteConfig) {
      setData((prev) => prev.filter((c) => c.id !== deleteConfig.id))
      toast.success(`"${deleteConfig.name}" deleted successfully`)
    }
    setDeleteDialogOpen(false)
    setDeleteConfig(null)
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">Configurations</h2>
              <Badge variant="secondary" className="uppercase tracking-wider">
                {filtered.length} {filtered.length === 1 ? "Config" : "Configs"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Define rating configurations and their scoring fields for tasks and stakeholder evaluations.
            </p>
          </div>
        </div>
        {/* Inline stats (compact) */}
        <div className="mt-2">
          <InlineStats
            items={[
              { label: "Total", value: stats.total },
              { label: "Active", value: stats.active },
              { label: "Task Rating", value: stats.task },
              { label: "Stakeholder", value: stats.stakeholder },
            ]}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name, description or creator..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                resetPage()
              }}
              className="pl-8 h-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <Tabs
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v as TypeFilter)
                resetPage()
              }}
            >
              <TabsList>
                {typeOptions.map((opt) => (
                  <TabsTrigger key={opt.value} value={opt.value}>
                    {opt.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <Button
              className="transition-all hover:shadow-md hover:shadow-primary/25"
              size="sm"
              onClick={() => navigate("/ratings/configurations/new")}
            >
              <Plus />
              New
            </Button>
          </div>
        </div>

        {/* Content */}
        <Card>
          <CardContent className="p-0">
            {paged.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="rounded-full bg-muted p-4">
                  <Settings2 className="size-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-foreground">No configurations found</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {search || typeFilter !== "ALL"
                      ? "Try adjusting your search or filters."
                      : "Create your first configuration to get started."}
                  </p>
                </div>
                {!search && typeFilter === "ALL" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/ratings/configurations/new")}
                  >
                    <Plus className="size-3.5" />
                    New Configuration
                  </Button>
                )}
              </div>
            ) : (
              <ConfigurationTableView
                configurations={paged}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      <ConfirmDeleteConfigurationDialog
        configuration={deleteConfig}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />

      <ConfigurationDetailSheet
        configId={detailConfigId}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  )
}
