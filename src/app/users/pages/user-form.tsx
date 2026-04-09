import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import type { User } from "@/app/users/data"

type UserFormProps = {
  mode: "create" | "edit"
  initialData?: User | null
  /** True while the API request is in-flight */
  submitting?: boolean
  /** Backend / network error message to display */
  submitError?: string | null
  onSubmit: (data: UserFormData) => void
  onCancel: () => void
}

// Data shape sent from the form to the parent
export type UserFormData = {
  name: string
  email: string
  password: string
}

export function UserForm({
  mode,
  initialData,
  submitting = false,
  submitError,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const [name, setName] = useState(initialData?.name ?? "")
  const [email, setEmail] = useState(initialData?.email ?? "")
  // Password is required on create, optional on edit
  const [password, setPassword] = useState("")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatarUrl ?? null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const prevObjectUrl = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  // avatarFile state kept for future avatar upload functionality
  const [_avatarFile, setAvatarFile] = useState<File | null>(null)

  // Reset preview when switching between create ↔ edit
  useEffect(() => {
    setAvatarPreview(initialData?.avatarUrl ?? null)
    setAvatarFile(null)
  }, [initialData])

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (prevObjectUrl.current) URL.revokeObjectURL(prevObjectUrl.current)
    }
  }, [])

  // ── Client-side validation ──────────────────────────────────────────────────
  function validate() {
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = "Name is required"
    if (!email.trim()) next.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = "Enter a valid email"
    // Password is required for new users; optional for edits
    if (mode === "create" && !password) next.password = "Password is required"
    if (password && password.length < 8) next.password = "Password must be at least 8 characters"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ name, email, password })
  }

  // ── Avatar helpers ──────────────────────────────────────────────────────────
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setAvatarFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarPreview(url)
      if (prevObjectUrl.current) URL.revokeObjectURL(prevObjectUrl.current)
      prevObjectUrl.current = url
    } else {
      setAvatarPreview(initialData?.avatarUrl ?? null)
    }
  }

  function handleClearAvatar() {
    if (prevObjectUrl.current) {
      URL.revokeObjectURL(prevObjectUrl.current)
      prevObjectUrl.current = null
    }
    setAvatarFile(null)
    setAvatarPreview(initialData?.avatarUrl ?? null)
  }

  return (
    <div className="flex w-full justify-center p-4 md:p-8">
      <Card className="w-full max-w-4xl">
        <CardContent className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon-lg" onClick={onCancel} disabled={submitting}>
              <ArrowLeft />
            </Button>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                  {mode === "create" ? "Create User" : "Edit User"}
                </h2>
                <Badge variant="secondary" className="uppercase tracking-wider">
                  {mode}
                </Badge>
              </div>
              <p className="text-sm md:text-lg text-muted-foreground max-w-2xl">
                {mode === "create"
                  ? "Add a new member to your organization."
                  : `Update account details for ${initialData?.name ?? "this user"}.`}
              </p>
            </div>
          </div>

          {/* Backend / network error banner */}
          {submitError && (
            <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-6">
              <AlertCircle className="size-4 shrink-0" />
              <span className="flex-1">{submitError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold uppercase tracking-widest text-muted-foreground">
                  Personal Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter full name"
                      className="h-12 text-sm"
                      disabled={submitting}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">{errors.name}</p>
                    )}
                  </div>
                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="h-12 text-sm"
                      disabled={submitting}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>
                  {/* Password */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="password">
                      Password{mode === "edit" && <span className="text-muted-foreground ml-1">(leave blank to keep current)</span>}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === "create" ? "Enter password" : "New password (optional)"}
                      className="h-12 text-sm"
                      disabled={submitting}
                      autoComplete="new-password"
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive mt-1">{errors.password}</p>
                    )}
                  </div>
                </div>

                {/* Avatar / preview column */}
                <aside className="md:col-span-1 flex flex-col items-center gap-4">
                  <div className="flex flex-col items-center gap-3">
                    <Avatar size="lg" className="size-28">
                      <AvatarImage src={avatarPreview ?? undefined} alt={name || "Avatar"} />
                      <AvatarFallback>{name ? name.split(" ").map(n => n[0]).join("") : "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileChange}
                        aria-label="Upload avatar"
                      />
                      <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()} disabled={submitting}>
                        Upload
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={handleClearAvatar} disabled={submitting}>
                        Clear
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">Recommended: 256x256 PNG/JPEG</p>
                  </div>
                </aside>
              </div>
            </section>

            <Separator />

            {/* Actions */}
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="ghost" size="lg" onClick={onCancel} disabled={submitting}>
                Discard
              </Button>
              <Button type="submit" size="lg" disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {mode === "create" ? "Create User" : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
