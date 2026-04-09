import { lazy, Suspense } from "react"
import { BrowserRouter, Routes, Route } from "react-router"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import Layout from "@/app/layout"
import AuthLayout from "@/app/(auth)/layout"
import { AuthGuard } from "@/app/(auth)/components/AuthGuard"
import { Loader2 } from "lucide-react"

// Lazy-loaded pages
const DashboardPage = lazy(() => import("@/app/dashboard/page"))
const LoginPage = lazy(() => import("@/app/(auth)/login/page"))
const UsersPage = lazy(() => import("@/app/users/pages/page"))
const ProjectsPage = lazy(() => import("@/app/projects/pages/page"))
const CreateProjectPage = lazy(() => import("@/app/projects/create-project"))
const EditProjectPage = lazy(() => import("@/app/projects/edit-project"))
const TasksPage = lazy(() => import("@/app/tasks/pages/page"))
const HelpRequestsPage = lazy(() => import("@/app/help-requests/pages/page"))
const TicketsPage = lazy(() => import("@/app/tickets/page"))
const RatingsConfigurationsPage = lazy(() => import("@/app/ratings/configurations/page"))
const ConfigurationDetailPage = lazy(() => import("@/app/ratings/configurations/configuration-detail"))
const CreateConfigurationPage = lazy(() => import("@/app/ratings/configurations/create-configuration"))
const EditConfigurationPage = lazy(() => import("@/app/ratings/configurations/edit-configuration"))
const RatingsPage = lazy(() => import("@/app/ratings/ratings/page"))
const FinalRatingsPage = lazy(() => import("@/app/ratings/final-ratings/page"))
const WeightedRatingsPage = lazy(() => import("@/app/ratings/weighted-ratings/page"))
const ClockingInOutPage = lazy(() => import("@/app/clocking/in-out/page"))
const ClockingRecordsPage = lazy(() => import("@/app/clocking/records/page"))
const ClockingSessionsPage = lazy(() => import("@/app/clocking/sessions/page"))
const RolesPage = lazy(() => import("@/app/roles/page"))
const AccountPage = lazy(() => import("@/app/account/page"))
const NotFoundPage = lazy(() => import("@/app/not-found"))

function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Loader2 className="size-6 animate-spin text-primary" />
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <TooltipProvider>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route element={<AuthLayout />}>
                  <Route path="login" element={<LoginPage />} />
                </Route>
                <Route element={<AuthGuard><Layout /></AuthGuard>}>
                  <Route index element={<DashboardPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="projects/new" element={<CreateProjectPage />} />
                  <Route path="projects/:id/edit" element={<EditProjectPage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="help-requests" element={<HelpRequestsPage />} />
                  <Route path="tickets" element={<TicketsPage />} />
                  <Route path="ratings/configurations" element={<RatingsConfigurationsPage />} />
                  <Route path="ratings/configurations/new" element={<CreateConfigurationPage />} />
                  <Route path="ratings/configurations/:id" element={<ConfigurationDetailPage />} />
                  <Route path="ratings/configurations/:id/edit" element={<EditConfigurationPage />} />
                  <Route path="ratings" element={<RatingsPage />} />
                  <Route path="ratings/final-ratings" element={<FinalRatingsPage />} />
                  <Route path="ratings/weighted-ratings" element={<WeightedRatingsPage />} />
                  <Route path="clocking/in-out" element={<ClockingInOutPage />} />
                  <Route path="clocking/records" element={<ClockingRecordsPage />} />
                  <Route path="clocking/sessions" element={<ClockingSessionsPage />} />
                  <Route path="roles" element={<RolesPage />} />
                  <Route path="account" element={<AccountPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
          </ErrorBoundary>
          <Toaster />
        </TooltipProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
