import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import type { User, UserStatus } from "@/app/users/data"

type UserFormProps = {
  mode: "create" | "edit"
  initialData?: User | null
  onSubmit: (data: UserFormData) => void
  onCancel: () => void
}

export type UserFormData = {
  name: string
  email: string
  role: string
  status: UserStatus
  position: string
  avatarFile?: File | null
}

const roles = ["Administrator", "Editor", "Viewer", "Developer", "Designer", "Product Lead"]
const statuses: { value: UserStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "away", label: "Away" },
  { value: "suspended", label: "Suspended" },
]

export function UserForm({ mode, initialData, onSubmit, onCancel }: UserFormProps) {
  const [name, setName] = useState(initialData?.name ?? "")
  const [email, setEmail] = useState(initialData?.email ?? "")
  const [role, setRole] = useState(initialData?.role ?? "")
  const [status, setStatus] = useState<UserStatus>(initialData?.status ?? "active")
  const [position, setPosition] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatarUrl ?? null)
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})
  const prevObjectUrl = useRef<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    // reset preview when initialData changes (edit vs create)
    setAvatarPreview(initialData?.avatarUrl ?? null)
    setAvatarFile(null)
  }, [initialData])

  useEffect(() => {
    // cleanup previous object URL
    return () => {
      if (prevObjectUrl.current) {
        URL.revokeObjectURL(prevObjectUrl.current)
      }
    }
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ok = validate()
    if (!ok) return
    onSubmit({ name, email, role, status, position, avatarFile })
  }

  function validate() {
    const next: { name?: string; email?: string } = {}
    if (!name.trim()) next.name = "Name is required"
    if (!email.trim()) next.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) next.email = "Enter a valid email"
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setAvatarFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setAvatarPreview(url)
      // revoke previous
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
            <Button variant="ghost" size="icon-lg" onClick={onCancel}>
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
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter full name"
                      className="h-12 text-sm"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="h-12 text-sm"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Enter position title"
                      className="h-12 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="w-full h-12">
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r} value={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()}>
                        Upload
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={handleClearAvatar}>
                        Clear
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">Recommended: 256x256 PNG/JPEG</p>
                  </div>
                </aside>
              </div>
        </section>

        <Separator />

        {/* Access & Status */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Access & Status
            </h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Account Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as UserStatus)}>
              <SelectTrigger className="w-full max-w-xs h-10">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" size="lg" onClick={onCancel}>
            Discard
          </Button>
          <Button type="submit" size="lg">
            {mode === "create" ? "Create User" : "Save Changes"}
          </Button>
        </div>
      </form>
        </CardContent>
      </Card>
    </div>
  )
}
