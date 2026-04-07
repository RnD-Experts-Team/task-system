
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NavUser() {
  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log("Logout clicked")
  }

  return (
    <div className="w-full space-y-3">
      {/* User Info - Inline Display
      <div className="flex items-center gap-3 rounded-lg border border-sidebar-border bg-sidebar-accent/40 px-3 py-2.5 transition-colors duration-200 hover:bg-sidebar-accent/60">
        <Avatar className="h-8 w-8 rounded-lg shrink-0">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-medium">
            {user.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-medium text-sidebar-foreground truncate">
            {user.name}
          </span>
          <span className="text-xs text-muted-foreground truncate">
            {user.email}
          </span>
        </div>
      </div> */}

      {/* Logout Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="size-4" />
        <span className="text-sm">Log out</span>
      </Button>
    </div>
  )
}
