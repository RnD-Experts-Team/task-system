import { Link, useLocation } from "react-router"
import type { LucideIcon } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const location = useLocation()

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = location.pathname === item.url
            return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                asChild 
                isActive={isActive}
                className={`group relative w-full overflow-hidden rounded-xl border border-transparent transition-all duration-200 ease-out ${
                    isActive
                      ? "bg-sidebar-accent/50 text-sidebar-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:border-sidebar-border/40"
                  }`}
              >
                <Link 
                  to={item.url}
                  className="relative"
                >
                  {/* Smooth left border indicator for active state */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-sidebar-primary rounded-r-sm" />
                  )}
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
