export type HelpRequestStatus = "open" | "claimed" | "completed"

export type HelpRequestUser = {
  id: string
  name: string
  avatarUrl: string
}

export type HelpRequest = {
  id: string
  description: string
  requester: HelpRequestUser
  helper: HelpRequestUser | null
  status: HelpRequestStatus
  rating: number // 0-5 stars
  createdAt: string
}

export type HelpRequestFormData = {
  description: string
  requesterId: string
  helperId: string | null
  status: HelpRequestStatus
  rating: number
}

export const users: HelpRequestUser[] = [
  { id: "u1", name: "Marcus Thorne", avatarUrl: "https://i.pravatar.cc/150?u=marcus" },
  { id: "u2", name: "Elena Rodriguez", avatarUrl: "https://i.pravatar.cc/150?u=elena" },
  { id: "u3", name: "Julian Vance", avatarUrl: "https://i.pravatar.cc/150?u=julian" },
  { id: "u4", name: "Sarah Jenkins", avatarUrl: "https://i.pravatar.cc/150?u=sarah" },
  { id: "u5", name: "Adrian Thorne", avatarUrl: "https://i.pravatar.cc/150?u=adrian" },
  { id: "u6", name: "Lila Rossi", avatarUrl: "https://i.pravatar.cc/150?u=lila" },
]

export const helpRequests: HelpRequest[] = [
  {
    id: "hr1",
    description:
      "Need assistance debugging the WebSocket reconnection logic.",
    requester: users[0],
    helper: users[1],
    status: "claimed",
    rating: 4,
    createdAt: "Mar 15, 2026",
  },
  {
    id: "hr2",
    description:
      "Looking for help setting up the Playwright end-to-end test suite for the onboarding flow. Need guidance on page object patterns and fixture management.",
    requester: users[2],
    helper: null,
    status: "open",
    rating: 0,
    createdAt: "Mar 18, 2026",
  },
  {
    id: "hr3",
    description:
      "Require support migrating the legacy SCSS variables to Tailwind CSS v4 design tokens. Several component themes are broken after the upgrade and need a systematic approach.",
    requester: users[3],
    helper: users[4],
    status: "completed",
    rating: 5,
    createdAt: "Mar 10, 2026",
  },
  {
    id: "hr4",
    description:
      "Help needed with configuring the CI/CD pipeline to run parallel integration tests against the staging database. Current setup causes flaky test failures due to data contention.",
    requester: users[4],
    helper: null,
    status: "open",
    rating: 0,
    createdAt: "Mar 20, 2026",
  },
  {
    id: "hr5",
    description:
      "Assistance requested for implementing role-based access control middleware in the Express API layer. Need to handle hierarchical permissions and tenant-scoped resource access.",
    requester: users[5],
    helper: users[0],
    status: "claimed",
    rating: 3,
    createdAt: "Mar 22, 2026",
  },
  {
    id: "hr6",
    description:
      "Need help optimizing the dashboard chart rendering. The area chart component re-renders on every state change due to missing memoization, causing visible lag with large datasets.",
    requester: users[1],
    helper: users[2],
    status: "completed",
    rating: 5,
    createdAt: "Mar 08, 2026",
  },
  {
    id: "hr7",
    description:
      "Looking for guidance on implementing proper error boundaries in the React component tree. Several uncaught promise rejections are crashing the entire application instead of failing gracefully.",
    requester: users[0],
    helper: null,
    status: "open",
    rating: 0,
    createdAt: "Mar 25, 2026",
  },
  {
    id: "hr8",
    description:
      "Help needed with database schema migration for the new multi-tenant architecture. Need to add tenant_id columns and update all existing queries to enforce tenant isolation.",
    requester: users[3],
    helper: users[5],
    status: "completed",
    rating: 4,
    createdAt: "Mar 05, 2026",
  },
  {
    id: "hr9",
    description:
      "Assistance with setting up Storybook for the shared component library. Need to configure proper theme switching, viewport testing, and accessibility addon integration.",
    requester: users[2],
    helper: null,
    status: "open",
    rating: 0,
    createdAt: "Mar 27, 2026",
  },
  {
    id: "hr10",
    description:
      "Need support implementing the file upload service with chunked uploads and resume capability. The current implementation fails silently on files larger than 50MB.",
    requester: users[4],
    helper: users[1],
    status: "claimed",
    rating: 0,
    createdAt: "Mar 28, 2026",
  },
  {
    id: "hr11",
    description:
      "Help required with setting up monitoring and alerting for the production Kubernetes cluster. Need Prometheus metrics collection and Grafana dashboards for key SLIs.",
    requester: users[5],
    helper: null,
    status: "open",
    rating: 0,
    createdAt: "Mar 29, 2026",
  },
  {
    id: "hr12",
    description:
      "Assistance needed refactoring the notification preferences API to support per-channel granularity. Users should be able to configure email, push, and in-app notifications independently.",
    requester: users[1],
    helper: users[3],
    status: "completed",
    rating: 4,
    createdAt: "Mar 02, 2026",
  },
]
