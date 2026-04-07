import { Outlet, useLocation } from "react-router"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DashboardBackground } from "@/components/dashboard-background"

export default function Layout() {
  const location = useLocation()

  // Map pathname to page title
  const titleMap: Record<string, string> = {
    "/": "Dashboard",
    "/users": "Users",
    "/projects": "Projects",
    "/tasks": "Tasks",
    "/help-requests": "Help Requests",
    "/tickets": "Tickets",
    "/ratings/configurations": "Ratings — Configurations",
    "/ratings/configurations/new": "New Configuration",
    "/ratings": "Ratings",
    "/ratings/final-ratings": "Ratings — Final Ratings",
    "/ratings/weighted-ratings": "Ratings — Weighted Ratings (SOS)",
    "/clocking/in-out": "Clocking — IN/OUT",
    "/clocking/records": "Clocking — Records",
    "/clocking/sessions": "Clocking — Sessions",
    "/roles": "Roles",
    "/account": "Account",
  }

  const pageTitle = titleMap[location.pathname] ?? "Dashboard"

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 60)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <DashboardBackground />
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={pageTitle} />
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
