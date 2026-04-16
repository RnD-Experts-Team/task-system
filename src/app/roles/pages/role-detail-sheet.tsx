import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Pencil, Shield, CheckCircle2 } from "lucide-react"
import type { Role } from "@/types"

type RoleDetailSheetProps = {
  role: Role | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (role: Role) => void
  loading?: boolean
}



export function RoleDetailSheet({
  role,
  open,
  onOpenChange,
  onEdit,
  loading = false,
}: RoleDetailSheetProps) {
  if (!role && !loading) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="data-[side=right]:sm:max-w-full overflow-y-auto themed-scrollbar">
        <SheetHeader className="items-center text-center gap-3">
          <div className="flex items-center justify-center size-16 rounded-2xl bg-primary/10 ring-2 ring-primary/20">
            <Shield className="size-8 text-primary" />
          </div>
          <SheetTitle className="text-2xl">{role?.name ?? "Loading..."}</SheetTitle>
          <SheetDescription className="text-sm">
            Guard: <span className="font-medium text-foreground">{role?.guard_name}</span>
          </SheetDescription>
          {role && (
            <Badge variant="secondary" className="uppercase tracking-wider text-xs">
              {role.permissions.length} Permission{role.permissions.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </SheetHeader>

        {role && (
        <div className="px-6 pb-10 space-y-8">
          {/* Quick Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Guard
              </p>
              <p className="text-sm font-medium font-mono">{role.guard_name}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                Created
              </p>
              <p className="text-sm font-medium">{new Date(role.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <Separator />

          {/* Permissions */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Permissions
            </h3>
            <div className="space-y-2">
              {role.permissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center gap-3 rounded-lg border p-3 border-primary/30 bg-primary/5"
                  >
                    <CheckCircle2 className="size-4 shrink-0 text-primary" />
                    <p className="text-sm font-medium capitalize">{permission.name}</p>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Granted
                    </Badge>
                  </div>
              ))}
              {role.permissions.length === 0 && (
                <p className="text-sm text-muted-foreground">No permissions assigned.</p>
              )}
            </div>
          </section>

          {onEdit && (
            <>
              <Separator />
              <Button
                className="w-full"
                variant="outline"
                onClick={() => onEdit(role)}
              >
                <Pencil className="size-4" />
                Edit Role
              </Button>
            </>
          )}
        </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
