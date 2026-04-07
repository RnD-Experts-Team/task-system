import { Link, useLocation } from "react-router"
import { ChevronRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavCollapsible({
  items,
}: {
  items: {
    title: string
    icon: LucideIcon
    items: {
      title: string
      url: string
    }[]
  }[]
}) {
  const location = useLocation()

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = item.items.some(
            (sub) => location.pathname === sub.url
          )

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className={`relative transition-all duration-200 ease-out ${
                      isActive 
                        ? "bg-sidebar-accent/50 text-sidebar-foreground shadow-none font-normal [&_svg:not(.chevron-icon)]:text-sidebar-foreground" 
                        : "hover:bg-sidebar-accent/70"
                    }`}
                  >
                    {/* Smooth left border indicator for active state */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-sidebar-primary rounded-r-sm" />
                    )}
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                    <ChevronRight className="chevron-icon ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const isSubActive = location.pathname === subItem.url
                      return (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={isSubActive}
                          className={`transition-all duration-200 ease-out ${
                            isSubActive
                              ? "bg-sidebar-accent/50 text-sidebar-foreground [&_svg]:text-sidebar-foreground font-normal!"
                              : "hover:bg-sidebar-accent/50"
                          }`}
                        >
                          <Link to={subItem.url}>
                            <span>{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
