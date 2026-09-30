// Markdown <textarea> with a debounced server-rendered live preview. Side-by-side from lg,
// Write/Preview tabs below. The preview HTML comes from the server sanitiser only.

import { useId, useState } from "react"
import { Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useMarkdownPreview } from "../hooks/useMarkdownPreview"
import { ServerHtml } from "./server-html"

type MarkdownEditorProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  maxLength?: number
  /** Textarea height class, e.g. "min-h-56" */
  heightClass?: string
  invalid?: boolean
  disabled?: boolean
  id?: string
  /** "auto": split from lg, tabs below. "tabs": always tabs (narrow containers such as sheets). */
  layout?: "auto" | "tabs"
  className?: string
}

function PreviewPane({ value, className }: { value: string; className?: string }) {
  const { html, loading, failed, empty } = useMarkdownPreview(value)
  return (
    <div
      className={cn("relative min-h-32 rounded-md border bg-card/40 p-3", className)}
      aria-live="polite"
      aria-label="Markdown preview"
    >
      {loading && (
        <Loader2 className="absolute end-2 top-2 size-3.5 animate-spin text-muted-foreground" aria-label="Rendering" />
      )}
      {empty ? (
        <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
      ) : failed ? (
        <p className="text-sm text-muted-foreground">Preview unavailable right now — your text is still saved as typed.</p>
      ) : (
        <ServerHtml html={html} />
      )}
    </div>
  )
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  maxLength,
  heightClass = "min-h-56",
  invalid,
  disabled,
  id,
  layout = "auto",
  className,
}: MarkdownEditorProps) {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const [tab, setTab] = useState("write")

  const textarea = (
    <Textarea
      id={textareaId}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      aria-invalid={invalid || undefined}
      spellCheck
      className={cn("resize-y font-mono text-xs leading-relaxed", heightClass)}
    />
  )

  const counter = maxLength ? (
    <p className="mt-1 text-end text-[0.6875rem] tabular-nums text-muted-foreground">
      {value.length.toLocaleString()} / {maxLength.toLocaleString()}
    </p>
  ) : null

  const tabbed = (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="write">
        {textarea}
        {counter}
      </TabsContent>
      <TabsContent value="preview">{tab === "preview" && <PreviewPane value={value} className={heightClass} />}</TabsContent>
    </Tabs>
  )

  if (layout === "tabs") return <div className={className}>{tabbed}</div>

  return (
    <div className={className}>
      <div className="lg:hidden">{tabbed}</div>
      <div className="hidden gap-4 lg:grid lg:grid-cols-2">
        <div>
          {textarea}
          {counter}
        </div>
        <PreviewPane value={value} className={heightClass} />
      </div>
    </div>
  )
}
