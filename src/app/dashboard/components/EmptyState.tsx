import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function EmptyState({
  title,
  message,
  minHeight = 140,
}: {
  title?: string
  message?: string
  minHeight?: number
}) {
  return (
    <Card className="w-full">
      {title && (
        <CardHeader>
          <CardTitle className="font-heading text-sm font-bold">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex items-center justify-center text-center text-sm text-muted-foreground" style={{ minHeight }}>
        <div className="flex flex-col items-center gap-3">
          <FileText className="size-6 text-border/50" />
          <div className="max-w-xs">{message ?? "No items to show."}</div>
        </div>
      </CardContent>
    </Card>
  )
}
