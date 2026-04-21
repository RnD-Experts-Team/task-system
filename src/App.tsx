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
const ProjectsPage = lazy(() => import("@/app/projects/page"))
const CreateProjectPage = lazy(() => import("@/app/projects/create-project-page"))
const EditProjectPage = lazy(() => import("@/app/projects/edit-project-page"))
const ProjectDetailsPage = lazy(() => import("@/app/projects/project-details-page"))
const KanbanBoardPage = lazy(() => import("@/app/projects/kanban-board-page"))
const TasksPage = lazy(() => import("@/app/tasks/pages/page"))
const TaskDetailPage = lazy(() => import("@/app/tasks/pages/task-detail-page"))
const HelpRequestsPage = lazy(() => import("@/app/help-requests/pages/page"))
// Detail page for GET /help-requests/{id}
const HelpRequestDetailPage = lazy(() => import("@/app/help-requests/pages/help-request-detail-page"))
const TicketsPage = lazy(() => import("@/app/tickets/page"))
const RatingsConfigurationsPage = lazy(() => import("@/app/ratings/configurations/page"))
const ConfigurationDetailPage = lazy(() => import("@/app/ratings/configurations/configuration-detail"))
const CreateConfigurationPage = lazy(() => import("@/app/ratings/configurations/create-configuration"))
const EditConfigurationPage = lazy(() => import("@/app/ratings/configurations/edit-configuration"))
const RatingsPage = lazy(() => import("@/app/ratings/ratings/page"))
const TaskRatingPage = lazy(() => import("@/app/ratings/ratings/task-rating-page"))
const FinalRatingsPage = lazy(() => import("@/app/ratings/final-ratings/page"))
const WeightedRatingsPage = lazy(() => import("@/app/ratings/weighted-ratings/page"))
const ClockingInOutPage = lazy(() => import("@/app/clocking/in-out/page"))
const ClockingRecordsPage = lazy(() => import("@/app/clocking/records/page"))
const ClockingSessionsPage = lazy(() => import("@/app/clocking/sessions/page"))
const RolesPage = lazy(() => import("@/app/roles/page"))
const WorkspacesPage = lazy(() => import("@/app/workspaces/page"))
const CreateWorkspacePage = lazy(() => import("@/app/workspaces/create-workspace-page"))
const EditWorkspacePage = lazy(() => import("@/app/workspaces/edit-workspace-page"))
const WorkspaceDetailsPage = lazy(() => import("@/app/workspaces/workspace-details-page"))
const CreateTodoPage = lazy(() => import("@/app/workspaces/create-todo-page"))
const EditTodoPage = lazy(() => import("@/app/workspaces/edit-todo-page"))
const TodoDetailPage = lazy(() => import("@/app/workspaces/todo-detail-page"))
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
                  <Route path="projects/create" element={<CreateProjectPage />} />
                  <Route path="projects/:id/edit" element={<EditProjectPage />} />
                  <Route path="projects/:id" element={<ProjectDetailsPage />} />
                  {/* Support both routes so old links and new links both work. */}
                  <Route path="projects/:id/kanban" element={<KanbanBoardPage />} />
                  <Route path="projects/:id/kanban-board" element={<KanbanBoardPage />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="tasks/:id" element={<TaskDetailPage />} />
                  <Route path="help-requests" element={<HelpRequestsPage />} />
                  {/* Detail page for a single help request — GET /help-requests/{id} */}
                  <Route path="help-requests/:id" element={<HelpRequestDetailPage />} />
                  <Route path="tickets" element={<TicketsPage />} />
                  <Route path="ratings/configurations" element={<RatingsConfigurationsPage />} />
                  <Route path="ratings/configurations/new" element={<CreateConfigurationPage />} />
                  <Route path="ratings/configurations/:id" element={<ConfigurationDetailPage />} />
                  <Route path="ratings/configurations/:id/edit" element={<EditConfigurationPage />} />
                  <Route path="ratings" element={<RatingsPage />} />
                  {/* Rating form for a specific task — GET /tasks/:id then POST/PUT /task-ratings */}
                  <Route path="ratings/tasks/:taskId/rate" element={<TaskRatingPage />} />
                  <Route path="ratings/final-ratings" element={<FinalRatingsPage />} />
                  <Route path="ratings/weighted-ratings" element={<WeightedRatingsPage />} />
                  <Route path="clocking/in-out" element={<ClockingInOutPage />} />
                  <Route path="clocking/records" element={<ClockingRecordsPage />} />
                  <Route path="clocking/sessions" element={<ClockingSessionsPage />} />
                  <Route path="roles" element={<RolesPage />} />
                  <Route path="workspaces" element={<WorkspacesPage />} />
                  <Route path="workspaces/create" element={<CreateWorkspacePage />} />
                  <Route path="workspaces/:id/edit" element={<EditWorkspacePage />} />
                  <Route path="workspaces/:id" element={<WorkspaceDetailsPage />} />
                  <Route path="workspaces/:id/todos/create" element={<CreateTodoPage />} />
                  <Route path="workspaces/:id/todos/:todoId/edit" element={<EditTodoPage />} />
                  <Route path="workspaces/:id/todos/:todoId" element={<TodoDetailPage />} />
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
