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
  Command,
  LayoutGrid,
} from "lucide-react"
import { usePermissions } from "@/hooks/usePermissions";
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

  const navMainItems = data.navMain.filter(
    (item) => item.url !== "/users" || isAdmin || hasPermission("view users")
  );

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
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-sidebar-primary text-white">
                  <Command className="size-10" />
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
        <NavCollapsible items={data.navCollapsible} />
      </SidebarContent>

      {/* Account Section + Logout Footer */}
      <SidebarFooter className="border-t border-sidebar-border px-4 py-4">
        <NavUser  />
      </SidebarFooter>
    </Sidebar>
  )
}
