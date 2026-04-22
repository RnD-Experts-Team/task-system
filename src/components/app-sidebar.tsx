import * as React from "react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { NavCollapsible } from "@/components/nav-collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ListTodo,
  HelpCircle,
  Ticket,
  Star,
  Clock,
  Shield,
  LayoutGrid,
} from "lucide-react"
import { usePermissions } from "@/hooks/usePermissions";
import taskSystemLogo from "@/assets/image.png"
const data = {
  user: {
    name: "Admin",
    email: "admin@system.com",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Users",
      url: "/users",
      icon: Users,
      
    },
    {
      title: "Projects",
      url: "/projects",
      icon: FolderKanban,
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: ListTodo,
    },
    {
      title: "Help Requests",
      url: "/help-requests",
      icon: HelpCircle,
    },
    {
      title: "Tickets",
      url: "/tickets",
      icon: Ticket,
    },
    {
      title: "Roles",
      url: "/roles",
      icon: Shield,
    },
    {
      title: "Workspaces",
      url: "/workspaces",
      icon: LayoutGrid,
    },
  ],
  navCollapsible: [
    {
      title: "Ratings",
      icon: Star,
      items: [
        { title: "Configurations", url: "/ratings/configurations" },
        { title: "Ratings", url: "/ratings" },
        { title: "Final Ratings", url: "/ratings/final-ratings" },
        { title: "Weighted Ratings (SOS)", url: "/ratings/weighted-ratings" },
      ],
    },
    {
      title: "Clocking",
      icon: Clock,
      items: [
        { title: "Clocking IN/OUT", url: "/clocking/in-out" },
        { title: "Clocking Records", url: "/clocking/records" },
        { title: "Clocking Sessions", url: "/clocking/sessions" },
      ],
    },
  ],
  
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { hasRole, hasPermission } = usePermissions();
  const isAdmin = hasRole("admin");

  const navMainItems = data.navMain.filter((item) => {
    if (item.url === "/users") return isAdmin || hasPermission("view users")
    if (item.url === "/roles") return isAdmin || hasPermission("view roles")
    return true
  })

  // Filter collateral nav items based on permissions
  const navCollapsibleItems = data.navCollapsible
    .map((section) => {
      if (section.title === "Ratings") {
        return {
          ...section,
          items: section.items.filter((item) => {
            if (item.url === "/ratings/configurations") {
              return isAdmin || hasPermission("view rating configs")
            }
            if (item.url === "/ratings") {
              // Requires EITHER create task ratings OR create stakeholder ratings
              return isAdmin || hasPermission("create task ratings") || hasPermission("create stakeholder ratings")
            }
            if (item.url === "/ratings/final-ratings") {
              return isAdmin || hasPermission("calculate final ratings")
            }
            if (item.url === "/ratings/weighted-ratings") {
              return isAdmin || hasPermission("calculate final ratings")
            }
            return true
          }),
        }
      }
      if (section.title === "Clocking") {
        return {
          ...section,
          items: section.items.filter((item) => {
            if (item.url === "/clocking/sessions") {
              return isAdmin || hasPermission("view all clocking sessions")
            }
            return true
          }),
        }
      }
      return section
    })
    .filter((section) => section.items.length > 0)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Header: Logo + Project Title */}
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-auto p-0 hover:bg-transparent group/brand"
            >
              <a href="/" className="flex flex-col justify-center items-center  gap-4">
                <div className="flex items-center justify-center h-12 w-12 overflow-hidden rounded-xl bg-black/90 p-1 ring-1 ring-white/10">
                  <img src={taskSystemLogo} alt="Task System" className="h-full w-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-sidebar-foreground">Task System</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation Content */}
      <SidebarContent className="px-2 py-4">
        <NavMain items={navMainItems} />
        <NavCollapsible items={navCollapsibleItems} />
      </SidebarContent>

      {/* Account Section + Logout Footer */}
      <SidebarFooter className="border-t border-sidebar-border px-4 py-4">
        <NavUser  />
      </SidebarFooter>
    </Sidebar>
  )
}
