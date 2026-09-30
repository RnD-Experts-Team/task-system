import { useRef, useState } from "react"
import { ImageOff, Loader2, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type AssetUploaderProps = {
  label: string
  hint: string
  url: string | null
  busy: boolean
  disabled?: boolean
  /** Dark preview backdrop (for the dark logo) */
  dark?: boolean
  /** Checkerboard-free small preview for favicons */
  small?: boolean
  onUpload: (file: File) => Promise<boolean>
  onRemove: () => Promise<boolean>
}

const MAX_BYTES = 1024 * 1024
const ACCEPT = "image/png,image/jpeg,image/webp"

export function AssetUploader({ label, hint, url, busy, disabled, dark, small, onUpload, onRemove }: AssetUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [clientError, setClientError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setClientError(null)
    if (!ACCEPT.split(",").includes(file.type)) return setClientError("Use a PNG, JPG or WebP image.")
    if (file.size > MAX_BYTES) return setClientError("The image must be 1 MB or smaller.")
    await onUpload(file)
  }

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div
        className={cn(
          "flex shrink-0 items-center justify-center overflow-hidden rounded-md border",
          small ? "size-14" : "h-14 w-24",
          dark ? "bg-zinc-900" : "bg-muted/40"
        )}
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="Working" />
        ) : url ? (
          <img src={url} alt={`${label} preview`} className="max-h-full max-w-full object-contain" />
        ) : (
          <ImageOff className="size-4 text-muted-foreground" aria-label="No image" />
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
        {clientError && <p className="text-xs text-destructive">{clientError}</p>}
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            tabIndex={-1}
            aria-label={`Upload ${label}`}
            onChange={(e) => {
              void handleFile(e.target.files?.[0])
              e.target.value = ""
            }}
          />
          <Button type="button" size="lg" variant="outline" className="gap-1.5" disabled={disabled || busy} onClick={() => inputRef.current?.click()}>
            <Upload />
            {url ? "Replace" : "Upload"}
          </Button>
          {url && (
            <Button type="button" size="lg" variant="ghost" className="gap-1.5 text-destructive hover:text-destructive" disabled={disabled || busy} onClick={() => void onRemove()}>
              <Trash2 />
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
