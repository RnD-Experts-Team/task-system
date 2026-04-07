export type TicketStatus = "open" | "in-progress" | "closed"
export type TicketPriority = "low" | "medium" | "high"
export type TicketType = "bug" | "feature" | "task" | "support"

export type TicketUser = {
  id: string
  name: string
  avatarUrl: string
}

export type Ticket = {
  id: string
  title: string
  description: string
  type: TicketType
  status: TicketStatus
  priority: TicketPriority
  requester: TicketUser
  assignee: TicketUser | null
  createdAt: string
}

export type TicketFormData = {
  title: string
  description: string
  type: TicketType
  status: TicketStatus
  priority: TicketPriority
  requesterId: string
  assigneeId: string | null
}

export const ticketUsers: TicketUser[] = [
  { id: "u1", name: "Marcus Thorne", avatarUrl: "https://i.pravatar.cc/150?u=marcus" },
  { id: "u2", name: "Elena Rodriguez", avatarUrl: "https://i.pravatar.cc/150?u=elena" },
  { id: "u3", name: "Julian Vance", avatarUrl: "https://i.pravatar.cc/150?u=julian" },
  { id: "u4", name: "Sarah Jenkins", avatarUrl: "https://i.pravatar.cc/150?u=sarah" },
  { id: "u5", name: "Adrian Thorne", avatarUrl: "https://i.pravatar.cc/150?u=adrian" },
  { id: "u6", name: "Lila Rossi", avatarUrl: "https://i.pravatar.cc/150?u=lila" },
]

export const tickets: Ticket[] = [
  {
    id: "TKT-001",
    title: "Authentication tokens expire too quickly on mobile clients",
    description:
      "Users on mobile devices are being logged out after 15 minutes of inactivity even when the 'remember me' option is enabled. This affects iOS and Android clients. Token refresh mechanism appears to be failing silently without triggering a re-authentication flow.",
    type: "bug",
    status: "open",
    priority: "high",
    requester: ticketUsers[0],
    assignee: null,
    createdAt: "Mar 28, 2026",
  },
  {
    id: "TKT-002",
    title: "Add dark mode support to the reporting dashboard",
    description:
      "The reporting dashboard currently does not respect the system-level or user-selected dark mode preference. All charts, tables, and summary cards should adapt to the active color scheme using the existing Tailwind CSS v4 design tokens.",
    type: "feature",
    status: "in-progress",
    priority: "medium",
    requester: ticketUsers[1],
    assignee: ticketUsers[2],
    createdAt: "Mar 25, 2026",
  },
  {
    id: "TKT-003",
    title: "CSV export truncates rows beyond 1,000 entries",
    description:
      "When exporting data sets larger than 1,000 rows to CSV, the file silently truncates at row 1,000 with no warning shown to the user. This is a data integrity issue that needs to be addressed before the next compliance audit.",
    type: "bug",
    status: "in-progress",
    priority: "high",
    requester: ticketUsers[2],
    assignee: ticketUsers[3],
    createdAt: "Mar 22, 2026",
  },
  {
    id: "TKT-004",
    title: "Implement granular permission scopes for API keys",
    description:
      "API keys currently grant full read/write access to all endpoints. We need to introduce scoped permissions (e.g., read-only, write-only, resource-specific) so that third-party integrations can be granted least-privilege access.",
    type: "feature",
    status: "open",
    priority: "high",
    requester: ticketUsers[3],
    assignee: null,
    createdAt: "Mar 20, 2026",
  },
  {
    id: "TKT-005",
    title: "Sidebar collapses unexpectedly on tablet breakpoint",
    description:
      "On 768px–1024px screens the sidebar auto-collapses whenever the user navigates to a new route, even when they have previously expanded it. The collapsed state should persist across navigation within the same session.",
    type: "bug",
    status: "closed",
    priority: "low",
    requester: ticketUsers[4],
    assignee: ticketUsers[0],
    createdAt: "Mar 12, 2026",
  },
  {
    id: "TKT-006",
    title: "Upgrade Node.js runtime to v22 LTS across all services",
    description:
      "The current Node.js v18 LTS reaches end-of-life in April 2025. All microservices, Lambda functions, and CI pipelines need to be updated to Node.js v22 LTS and verified to be compatible with the new runtime.",
    type: "task",
    status: "closed",
    priority: "medium",
    requester: ticketUsers[5],
    assignee: ticketUsers[1],
    createdAt: "Mar 10, 2026",
  },
  {
    id: "TKT-007",
    title: "Support ticket attachment uploads fail for files larger than 5 MB",
    description:
      "When users attempt to attach files larger than 5 MB to a support ticket, the upload silently fails and the attachment field reverts to empty. No error message is displayed. The upstream S3 presigned URL has a 10 MB allowed limit so this is a validation bug on the client.",
    type: "support",
    status: "open",
    priority: "medium",
    requester: ticketUsers[0],
    assignee: ticketUsers[4],
    createdAt: "Mar 18, 2026",
  },
  {
    id: "TKT-008",
    title: "Kanban board drag-and-drop broken in Firefox 124",
    description:
      "After the Firefox 124 update the drag-and-drop reordering on the kanban board no longer works. Cards can be picked up but the drop target highlight does not render and the card snaps back to its original position on release.",
    type: "bug",
    status: "in-progress",
    priority: "high",
    requester: ticketUsers[1],
    assignee: null,
    createdAt: "Mar 30, 2026",
  },
  {
    id: "TKT-009",
    title: "Add webhook delivery retry with exponential backoff",
    description:
      "Webhook deliveries that fail with a 5xx response are currently not retried. We need to implement an exponential backoff retry strategy with a configurable max-attempt count and a dead-letter queue for permanently failed deliveries.",
    type: "feature",
    status: "open",
    priority: "medium",
    requester: ticketUsers[2],
    assignee: null,
    createdAt: "Mar 26, 2026",
  },
  {
    id: "TKT-010",
    title: "Audit log timestamps display in UTC instead of local timezone",
    description:
      "All timestamps in the audit log view are shown in UTC regardless of the user's timezone preference. They should be converted to the user's local timezone using the existing date formatting utility.",
    type: "bug",
    status: "closed",
    priority: "low",
    requester: ticketUsers[3],
    assignee: ticketUsers[5],
    createdAt: "Mar 08, 2026",
  },
  {
    id: "TKT-011",
    title: "Notification preferences panel missing save confirmation",
    description:
      "When users update their notification preferences and click Save, the page reloads but there is no success toast, banner, or any other visual confirmation that the changes were persisted.",
    type: "support",
    status: "closed",
    priority: "low",
    requester: ticketUsers[4],
    assignee: ticketUsers[2],
    createdAt: "Mar 05, 2026",
  },
  {
    id: "TKT-012",
    title: "Migrate authentication service to Passkeys / WebAuthn",
    description:
      "As part of our security roadmap we want to offer FIDO2 passkey authentication as an alternative to username/password. This requires integrating the WebAuthn API on the client and a compatible credential store on the backend.",
    type: "task",
    status: "open",
    priority: "high",
    requester: ticketUsers[5],
    assignee: null,
    createdAt: "Apr 01, 2026",
  },
]
