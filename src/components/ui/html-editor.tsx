import { useEffect, useRef, useState } from "react"
import {
  Bold,
  Eraser,
  Italic,
  Link,
  List,
  ListOrdered,
  Underline,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type HtmlEditorProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  minHeightClassName?: string
}

type EditorCommand =
  | "bold"
  | "italic"
  | "underline"
  | "insertUnorderedList"
  | "insertOrderedList"
  | "unlink"

export function HtmlEditor({
  id,
  value,
  onChange,
  placeholder = "Write something...",
  disabled = false,
  className,
  minHeightClassName = "min-h-28",
}: HtmlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [focused, setFocused] = useState(false)
  const [isEmpty, setIsEmpty] = useState(!value)

  useEffect(() => {
    const el = editorRef.current
    if (!el) return

    if (!focused && el.innerHTML !== value) {
      el.innerHTML = value || ""
      const plainText = (el.textContent ?? "").replace(/\u00a0/g, " ").trim()
      setIsEmpty(plainText.length === 0)
    }
  }, [value, focused])

  function emitChange() {
    const el = editorRef.current
    if (!el) return
    const html = el.innerHTML
    const plainText = (el.textContent ?? "").replace(/\u00a0/g, " ").trim()
    setIsEmpty(plainText.length === 0)
    onChange(html)
  }

  function runCommand(command: EditorCommand, commandValue?: string) {
    if (disabled) return
    const el = editorRef.current
    if (!el) return
    el.focus()
    document.execCommand(command, false, commandValue)
    emitChange()
  }

  function insertLink() {
    if (disabled) return
    const url = window.prompt("Enter URL")
    if (!url) return
    const el = editorRef.current
    if (!el) return
    el.focus()
    document.execCommand("createLink", false, url)
    emitChange()
  }

  return (
    <div className={cn("rounded-md border border-input bg-transparent", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-border p-1.5">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runCommand("bold")}
          disabled={disabled}
          aria-label="Bold"
          title="Bold"
        >
          <Bold className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runCommand("italic")}
          disabled={disabled}
          aria-label="Italic"
          title="Italic"
        >
          <Italic className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runCommand("underline")}
          disabled={disabled}
          aria-label="Underline"
          title="Underline"
        >
          <Underline className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runCommand("insertUnorderedList")}
          disabled={disabled}
          aria-label="Bulleted list"
          title="Bulleted list"
        >
          <List className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runCommand("insertOrderedList")}
          disabled={disabled}
          aria-label="Numbered list"
          title="Numbered list"
        >
          <ListOrdered className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertLink}
          disabled={disabled}
          aria-label="Insert link"
          title="Insert link"
        >
          <Link className="size-3.5" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => runCommand("unlink")}
          disabled={disabled}
          aria-label="Remove link"
          title="Remove link"
        >
          <Eraser className="size-3.5" />
        </Button>
      </div>

      <div className="relative">
        {isEmpty && (
          <div className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">
            {placeholder}
          </div>
        )}

        <div
          id={id}
          ref={editorRef}
          contentEditable={!disabled}
          suppressContentEditableWarning
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onInput={emitChange}
          className={cn(
            "w-full px-3 py-2 text-sm focus:outline-none",
            minHeightClassName,
            disabled && "cursor-not-allowed opacity-50",
          )}
          aria-label="HTML editor"
        />
      </div>
    </div>
  )
}
