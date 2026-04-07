export type ProjectStatus = "active" | "in-review" | "paused" | "completed"
export type ProjectPriority = "high" | "medium" | "low"

export type ProjectTask = {
  id: string
  title: string
  category: string
  status: "completed" | "in-progress" | "todo"
  dueLabel: string
}

export type ProjectMember = {
  id: string
  name: string
  role: string
  avatarUrl: string
}

export type KanbanTask = {
  id: string
  title: string
  priority: "high" | "medium" | "low"
  dueLabel: string
  subtasksDone: number
  subtasksTotal: number
  assignee: ProjectMember
}

export type KanbanColumn = {
  id: string
  title: string
  color: string
  tasks: KanbanTask[]
}

export type Project = {
  id: string
  name: string
  description: string
  category: string
  status: ProjectStatus
  priority: ProjectPriority
  progress: number
  createdAt: string
  deadline: string
  owner: ProjectMember
  members: ProjectMember[]
  tasks: ProjectTask[]
  budget: string
  timeElapsed: string
  milestonesDone: number
  milestonesTotal: number
  kanbanColumns: KanbanColumn[]
}

const members: ProjectMember[] = [
  { id: "m1", name: "Marcus Thorne", role: "Primary Owner", avatarUrl: "https://i.pravatar.cc/150?u=marcus" },
  { id: "m2", name: "Elena Rodriguez", role: "Lead Strategist", avatarUrl: "https://i.pravatar.cc/150?u=elena" },
  { id: "m3", name: "Julian Vance", role: "Developer", avatarUrl: "https://i.pravatar.cc/150?u=julian" },
  { id: "m4", name: "Sarah Jenkins", role: "Designer", avatarUrl: "https://i.pravatar.cc/150?u=sarah" },
  { id: "m5", name: "Adrian Thorne", role: "Architect", avatarUrl: "https://i.pravatar.cc/150?u=adrian" },
  { id: "m6", name: "Lila Rossi", role: "Copywriter", avatarUrl: "https://i.pravatar.cc/150?u=lila" },
]

function makeKanban(seed: number): KanbanColumn[] {
  const assignees = [members[0], members[1], members[2], members[3]]
  return [
    {
      id: `col-todo-${seed}`,
      title: "To Do",
      color: "bg-yellow-500/50",
      tasks: [
        {
          id: `t-${seed}-1`,
          title: "iOS app wireframes for CRM portal",
          priority: "medium",
          dueLabel: "July 12, 2024",
          subtasksDone: 1,
          subtasksTotal: 4,
          assignee: assignees[0],
        },
        {
          id: `t-${seed}-2`,
          title: "Add manifest.js for PWA support",
          priority: "high",
          dueLabel: "Today",
          subtasksDone: 0,
          subtasksTotal: 2,
          assignee: assignees[1],
        },
      ],
    },
    {
      id: `col-progress-${seed}`,
      title: "In Progress",
      color: "bg-blue-500/50",
      tasks: [
        {
          id: `t-${seed}-3`,
          title: "Config webpack production bundle",
          priority: "medium",
          dueLabel: "In 2 days",
          subtasksDone: 3,
          subtasksTotal: 5,
          assignee: assignees[2],
        },
      ],
    },
    {
      id: `col-review-${seed}`,
      title: "Review",
      color: "bg-red-500/50",
      tasks: [
        {
          id: `t-${seed}-4`,
          title: "Upload first Dribbble shot",
          priority: "low",
          dueLabel: "Completed",
          subtasksDone: 2,
          subtasksTotal: 2,
          assignee: assignees[3],
        },
      ],
    },
    {
      id: `col-done-${seed}`,
      title: "Approved",
      color: "bg-green-500/50",
      tasks: [
        {
          id: `t-${seed}-5`,
          title: "Click dummy flow prototype",
          priority: "low",
          dueLabel: "Archived",
          subtasksDone: 3,
          subtasksTotal: 3,
          assignee: assignees[0],
        },
      ],
    },
  ]
}

export const projects: Project[] = [
  {
    id: "p1",
    name: "Apollo UI Kit Expansion",
    description: "Expanding the design system with new accessible components, dark mode support, and cross-platform consistency to power the next generation of product experiences.",
    category: "Design System • Q4 Goal",
    status: "active",
    priority: "high",
    progress: 72,
    createdAt: "Oct 12, 2023",
    deadline: "Mar 30, 2024",
    owner: members[0],
    members: [members[0], members[1], members[3]],
    tasks: [
      { id: "pt1-1", title: "Component Audit", category: "Design • Completed", status: "completed", dueLabel: "Done" },
      { id: "pt1-2", title: "Dark Mode Tokens", category: "Design • In Progress", status: "in-progress", dueLabel: "Due in 3 days" },
      { id: "pt1-3", title: "Accessibility Review", category: "QA • Todo", status: "todo", dueLabel: "Next sprint" },
    ],
    budget: "$18.2k",
    timeElapsed: "22 Days",
    milestonesDone: 4,
    milestonesTotal: 5,
    kanbanColumns: makeKanban(1),
  },
  {
    id: "p2",
    name: "Core Engine Migration",
    description: "Migrating the monolith infrastructure to microservices architecture for improved scalability, deployment flexibility, and team velocity across engineering squads.",
    category: "Infrastructure • Priority",
    status: "in-review",
    priority: "high",
    progress: 45,
    createdAt: "Nov 04, 2023",
    deadline: "Apr 15, 2024",
    owner: members[2],
    members: [members[2], members[4]],
    tasks: [
      { id: "pt2-1", title: "Service Decomposition", category: "Architecture • Completed", status: "completed", dueLabel: "Done" },
      { id: "pt2-2", title: "Data Layer Migration", category: "Backend • In Progress", status: "in-progress", dueLabel: "Due in 5 days" },
      { id: "pt2-3", title: "Load Testing", category: "DevOps • Todo", status: "todo", dueLabel: "Blocked" },
    ],
    budget: "$34.5k",
    timeElapsed: "38 Days",
    milestonesDone: 2,
    milestonesTotal: 6,
    kanbanColumns: makeKanban(2),
  },
  {
    id: "p3",
    name: "Stripe Integration V3",
    description: "Third-generation payment integration with support for multi-currency checkout, subscription management, and real-time revenue analytics dashboards.",
    category: "Finance • API",
    status: "paused",
    priority: "medium",
    progress: 15,
    createdAt: "Dec 12, 2023",
    deadline: "Jun 01, 2024",
    owner: members[1],
    members: [members[1], members[5]],
    tasks: [
      { id: "pt3-1", title: "API Spec Draft", category: "Planning • Completed", status: "completed", dueLabel: "Done" },
      { id: "pt3-2", title: "Checkout Flow", category: "Frontend • Todo", status: "todo", dueLabel: "Waiting" },
    ],
    budget: "$8.0k",
    timeElapsed: "10 Days",
    milestonesDone: 1,
    milestonesTotal: 4,
    kanbanColumns: makeKanban(3),
  },
  {
    id: "p4",
    name: "SOC2 Compliance Audit",
    description: "End-to-end security compliance audit covering data handling, access controls, incident response, and vendor risk assessments for enterprise certification.",
    category: "Security • External",
    status: "active",
    priority: "high",
    progress: 88,
    createdAt: "Jan 02, 2024",
    deadline: "Feb 28, 2024",
    owner: members[4],
    members: [members[4], members[0], members[2]],
    tasks: [
      { id: "pt4-1", title: "Policy Documentation", category: "Compliance • Completed", status: "completed", dueLabel: "Done" },
      { id: "pt4-2", title: "Vendor Assessment", category: "Compliance • Completed", status: "completed", dueLabel: "Done" },
      { id: "pt4-3", title: "Final Report", category: "Compliance • In Progress", status: "in-progress", dueLabel: "Due tomorrow" },
    ],
    budget: "$12.4k",
    timeElapsed: "14 Days",
    milestonesDone: 3,
    milestonesTotal: 5,
    kanbanColumns: makeKanban(4),
  },
  {
    id: "p5",
    name: "Global Expansion Phase II",
    description: "Operationalizing Southeast Asian hubs including localized cloud infrastructure, regulatory clearance in three primary markets, and scaling regional customer success.",
    category: "Strategy • International",
    status: "active",
    priority: "medium",
    progress: 74,
    createdAt: "Oct 12, 2024",
    deadline: "Dec 31, 2024",
    owner: members[0],
    members: [members[0], members[1]],
    tasks: [
      { id: "pt5-1", title: "Cloud Node Deployment", category: "Infrastructure • Completed", status: "completed", dueLabel: "Done" },
      { id: "pt5-2", title: "Local Legal Review", category: "Legal • In Progress", status: "in-progress", dueLabel: "Due in 2 days" },
      { id: "pt5-3", title: "Hire Regional Lead", category: "Talent • Todo", status: "todo", dueLabel: "Interviewing" },
    ],
    budget: "$12.4k",
    timeElapsed: "14 Days",
    milestonesDone: 3,
    milestonesTotal: 5,
    kanbanColumns: makeKanban(5),
  },
  {
    id: "p6",
    name: "Marketing Automation Suite",
    description: "Building an end-to-end marketing automation platform with email workflows, lead scoring, A/B testing, and CRM integration for the growth team.",
    category: "Marketing • Growth",
    status: "active",
    priority: "medium",
    progress: 60,
    createdAt: "Feb 15, 2024",
    deadline: "Jul 30, 2024",
    owner: members[5],
    members: [members[5], members[3]],
    tasks: [
      { id: "pt6-1", title: "Email Template Engine", category: "Frontend • Completed", status: "completed", dueLabel: "Done" },
      { id: "pt6-2", title: "Lead Scoring Model", category: "Data • In Progress", status: "in-progress", dueLabel: "Due next week" },
    ],
    budget: "$22.1k",
    timeElapsed: "30 Days",
    milestonesDone: 2,
    milestonesTotal: 4,
    kanbanColumns: makeKanban(6),
  },
  {
    id: "p7",
    name: "Mobile App Redesign",
    description: "Complete redesign of the native iOS and Android applications focused on modern navigation patterns, performance optimization, and unified cross-platform experience.",
    category: "Product • Mobile",
    status: "in-review",
    priority: "high",
    progress: 35,
    createdAt: "Mar 01, 2024",
    deadline: "Aug 15, 2024",
    owner: members[3],
    members: [members[3], members[0], members[2]],
    tasks: [
      { id: "pt7-1", title: "Navigation Prototype", category: "Design • Completed", status: "completed", dueLabel: "Done" },
      { id: "pt7-2", title: "Performance Benchmarks", category: "Engineering • Todo", status: "todo", dueLabel: "Pending" },
    ],
    budget: "$15.8k",
    timeElapsed: "18 Days",
    milestonesDone: 1,
    milestonesTotal: 5,
    kanbanColumns: makeKanban(7),
  },
  {
    id: "p8",
    name: "Data Pipeline Overhaul",
    description: "Rebuilding the data ingestion pipeline with real-time streaming capabilities, improved fault tolerance, and automated data quality monitoring.",
    category: "Engineering • Data",
    status: "active",
    priority: "high",
    progress: 52,
    createdAt: "Jan 20, 2024",
    deadline: "May 31, 2024",
    owner: members[2],
    members: [members[2], members[4]],
    tasks: [
      { id: "pt8-1", title: "Stream Architecture Design", category: "Architecture • Completed", status: "completed", dueLabel: "Done" },
      { id: "pt8-2", title: "Kafka Integration", category: "Backend • In Progress", status: "in-progress", dueLabel: "Due in 4 days" },
      { id: "pt8-3", title: "Monitoring Dashboard", category: "DevOps • Todo", status: "todo", dueLabel: "Blocked" },
    ],
    budget: "$28.3k",
    timeElapsed: "25 Days",
    milestonesDone: 2,
    milestonesTotal: 5,
    kanbanColumns: makeKanban(8),
  },
  {
    id: "p9",
    name: "Customer Portal V2",
    description: "Next-generation customer self-service portal with ticket management, knowledge base, real-time chat, and account administration capabilities.",
    category: "Product • Customer",
    status: "completed",
    priority: "medium",
    progress: 100,
    createdAt: "Sep 05, 2023",
    deadline: "Jan 15, 2024",
    owner: members[1],
    members: [members[1], members[3], members[5]],
    tasks: [
      { id: "pt9-1", title: "Portal Architecture", category: "Architecture • Completed", status: "completed", dueLabel: "Done" },
      { id: "pt9-2", title: "Chat Integration", category: "Frontend • Completed", status: "completed", dueLabel: "Done" },
      { id: "pt9-3", title: "Knowledge Base", category: "Content • Completed", status: "completed", dueLabel: "Done" },
    ],
    budget: "$19.7k",
    timeElapsed: "90 Days",
    milestonesDone: 5,
    milestonesTotal: 5,
    kanbanColumns: makeKanban(9),
  },
  {
    id: "p10",
    name: "API Gateway Modernization",
    description: "Replacing the legacy API gateway with a modern solution featuring rate limiting, OAuth2 flows, request transformation, and comprehensive observability.",
    category: "Engineering • Platform",
    status: "paused",
    priority: "low",
    progress: 20,
    createdAt: "Apr 01, 2024",
    deadline: "Sep 30, 2024",
    owner: members[4],
    members: [members[4], members[2]],
    tasks: [
      { id: "pt10-1", title: "Gateway Evaluation", category: "Research • Completed", status: "completed", dueLabel: "Done" },
      { id: "pt10-2", title: "Migration Plan", category: "Planning • Todo", status: "todo", dueLabel: "On hold" },
    ],
    budget: "$5.2k",
    timeElapsed: "8 Days",
    milestonesDone: 1,
    milestonesTotal: 4,
    kanbanColumns: makeKanban(10),
  },
  {
    id: "p11",
    name: "Brand Identity Refresh",
    description: "Comprehensive brand refresh including new visual identity system, typography, color palette, iconography, and comprehensive brand guidelines documentation.",
    category: "Design • Branding",
    status: "active",
    priority: "medium",
    progress: 65,
    createdAt: "Feb 20, 2024",
    deadline: "Jun 15, 2024",
    owner: members[3],
    members: [members[3], members[5]],
    tasks: [
      { id: "pt11-1", title: "Visual Identity Concepts", category: "Design • Completed", status: "completed", dueLabel: "Done" },
      { id: "pt11-2", title: "Guidelines Document", category: "Design • In Progress", status: "in-progress", dueLabel: "Due in 1 week" },
    ],
    budget: "$11.0k",
    timeElapsed: "32 Days",
    milestonesDone: 3,
    milestonesTotal: 4,
    kanbanColumns: makeKanban(11),
  },
  {
    id: "p12",
    name: "Internal Dev Tooling",
    description: "Building internal developer tools for code generation, automated testing scaffolding, and streamlined deployment workflows to improve engineering DX.",
    category: "Engineering • DX",
    status: "in-review",
    priority: "low",
    progress: 40,
    createdAt: "Mar 15, 2024",
    deadline: "Jul 01, 2024",
    owner: members[2],
    members: [members[2]],
    tasks: [
      { id: "pt12-1", title: "CLI Scaffolder", category: "Tooling • Completed", status: "completed", dueLabel: "Done" },
      { id: "pt12-2", title: "Test Generator", category: "Tooling • In Progress", status: "in-progress", dueLabel: "Due in 6 days" },
    ],
    budget: "$7.5k",
    timeElapsed: "15 Days",
    milestonesDone: 1,
    milestonesTotal: 3,
    kanbanColumns: makeKanban(12),
  },
]
