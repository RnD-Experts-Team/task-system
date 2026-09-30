import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

/** Generic table skeleton: `columns` header labels + `rows` pulsing rows. */
export function TableSkeleton({ columns, rows = 6 }: { columns: string[]; rows?: number }) {
  return (
    <div className="w-full overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((label) => (
              <TableHead key={label}>{label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, r) => (
            <TableRow key={r} className="animate-pulse">
              {columns.map((label, c) => (
                <TableCell key={label} className="py-3">
                  <Skeleton className={c === 0 ? "h-4 w-48 max-w-full" : "h-4 w-16"} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/** Stack of card-shaped rows (queues, lists). */
export function CardListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/** KPI tile row skeleton. */
export function KpiRowSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="space-y-2 p-4">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/** Chart card skeleton. */
export function ChartCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-56 w-full" />
      </CardContent>
    </Card>
  )
}
