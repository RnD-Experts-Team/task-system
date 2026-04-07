export type TaskStatus = "in-progress" | "pending" | "completed" | "todo"
export type TaskPriority = "critical" | "high" | "medium" | "low"

export type TaskAssignee = {
  id: string
  name: string
  avatarUrl: string
}

export type Subtask = {
  id: string
  title: string
  completed: boolean
}

export type TaskRatingEntry = {
  id: string
  date: string
  overall: number
  criteria: { label: string; score: number }[]
  ratedBy: { name: string; initials: string }
}

export type Task = {
  id: string
  code: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  project: string
  section: string
  weight: number
  dueDate: string
  createdAt: string
  assignees: TaskAssignee[]
  subtasks: Subtask[]
  rating: number // 0-5 stars
  ratings: TaskRatingEntry[]
}

export type TaskFormData = {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  project: string
  section: string
  weight: number
  dueDate: string
  assignees: TaskAssignee[]
  subtasks: Subtask[]
}

const assignees: TaskAssignee[] = [
  { id: "a1", name: "Marcus Thorne", avatarUrl: "https://i.pravatar.cc/150?u=marcus" },
  { id: "a2", name: "Elena Rodriguez", avatarUrl: "https://i.pravatar.cc/150?u=elena" },
  { id: "a3", name: "Julian Vance", avatarUrl: "https://i.pravatar.cc/150?u=julian" },
  { id: "a4", name: "Sarah Jenkins", avatarUrl: "https://i.pravatar.cc/150?u=sarah" },
  { id: "a5", name: "Adrian Thorne", avatarUrl: "https://i.pravatar.cc/150?u=adrian" },
  { id: "a6", name: "Lila Rossi", avatarUrl: "https://i.pravatar.cc/150?u=lila" },
]

export const projectOptions = [
  "Core UI",
  "Marketing",
  "Infrastructure",
  "Analytics",
  "Editorial Suite",
  "CVG Website",
]

export const sectionOptions = ["Frontend", "Backend", "Design", "QA", "DevOps"]

export const ratingConfigurations = [
  {
    id: "rc1",
    name: "Documentation and Planning",
    criteria: ["Precision & Accuracy", "Creative Execution", "Structural Integrity", "Timeline Discipline"],
  },
  {
    id: "rc2",
    name: "Implementation",
    criteria: ["Code Efficiency", "Best Practices", "Collaboration", "Delivery Completeness"],
  },
  {
    id: "rc3",
    name: "Deployment",
    criteria: ["Release Quality", "Monitoring Setup", "Rollback Plan", "Performance Impact"],
  },
]

export const tasks: Task[] = [
  {
    id: "t1",
    code: "TASK-1029",
    title: "Implement Dark Room Texture",
    description:
      "The current shadow implementation lacks depth in atmospheric conditions. We need to integrate a Volumetric Shadow Map that interacts correctly with the global illumination system. Ensure the ray-marching step count is optimized for mobile hardware while maintaining visual fidelity on desktop.",
    status: "in-progress",
    priority: "high",
    project: "Core UI",
    section: "Frontend",
    weight: 80,
    dueDate: "Oct 24, 2023",
    createdAt: "Oct 10, 2023",
    assignees: [assignees[0], assignees[1], assignees[2], assignees[3]],
    subtasks: [
      { id: "s1", title: "Define shader uniforms for light projection", completed: true },
      { id: "s2", title: "Implement jittered sampling for noise reduction", completed: true },
      { id: "s3", title: "Benchmark performance on Vulkan backend", completed: false },
      { id: "s4", title: "Optimize buffer swap for temporal anti-aliasing", completed: false },
      { id: "s5", title: "Write unit tests for shader pipeline", completed: false },
      { id: "s6", title: "Document rendering parameters", completed: true },
      { id: "s7", title: "Review with graphics team", completed: false },
      { id: "s8", title: "Integrate with main scene graph", completed: false },
    ],
    rating: 4,
    ratings: [
      {
        id: "r1",
        date: "3/24/2026",
        overall: 82,
        criteria: [
          { label: "Collaboration", score: 90 },
          { label: "Best Practices", score: 70 },
          { label: "Code Efficiency", score: 75 },
          { label: "Timeline Discipline", score: 100 },
        ],
        ratedBy: { name: "Adler Morgan", initials: "AM" },
      },
    ],
  },
  {
    id: "t2",
    code: "TASK-1030",
    title: "Editorial Content Audit",
    description:
      "Conduct a comprehensive audit of all editorial content across the marketing site. Review SEO tags, meta descriptions, and ensure brand voice consistency. Flag outdated content for refresh and identify gaps in the content strategy.",
    status: "pending",
    priority: "medium",
    project: "Marketing",
    section: "Design",
    weight: 50,
    dueDate: "Oct 28, 2023",
    createdAt: "Oct 15, 2023",
    assignees: [assignees[2]],
    subtasks: [
      { id: "s9", title: "Catalog existing content pages", completed: false },
      { id: "s10", title: "Review SEO meta tags", completed: false },
      { id: "s11", title: "Audit brand voice consistency", completed: false },
      { id: "s12", title: "Flag outdated content", completed: false },
      { id: "s13", title: "Draft content gap report", completed: false },
    ],
    rating: 0,
    ratings: [],
  },
  {
    id: "t3",
    code: "TASK-1031",
    title: "Refine Glassmorphism Layers",
    description:
      "Update the glassmorphism design tokens across the entire design system. Ensure blur radius, opacity, and border treatments are consistent with the new visual language. Test against dark and light themes for accessibility compliance.",
    status: "completed",
    priority: "low",
    project: "Core UI",
    section: "Frontend",
    weight: 30,
    dueDate: "Oct 20, 2023",
    createdAt: "Oct 05, 2023",
    assignees: [assignees[3], assignees[4]],
    subtasks: [
      { id: "s14", title: "Audit current glassmorphism tokens", completed: true },
      { id: "s15", title: "Update blur radius values", completed: true },
      { id: "s16", title: "Test dark theme compatibility", completed: true },
      { id: "s17", title: "Test light theme compatibility", completed: true },
      { id: "s18", title: "Update documentation", completed: true },
      { id: "s19", title: "Review with design lead", completed: true },
      { id: "s20", title: "Push to design system package", completed: true },
      { id: "s21", title: "Verify in staging environment", completed: true },
      { id: "s22", title: "Cross-browser testing", completed: true },
      { id: "s23", title: "Accessibility contrast check", completed: true },
      { id: "s24", title: "Final sign-off", completed: true },
      { id: "s25", title: "Deploy to production", completed: true },
    ],
    rating: 5,
    ratings: [
      {
        id: "r2",
        date: "3/20/2026",
        overall: 95,
        criteria: [
          { label: "Precision & Accuracy", score: 98 },
          { label: "Creative Execution", score: 92 },
          { label: "Structural Integrity", score: 95 },
          { label: "Timeline Discipline", score: 95 },
        ],
        ratedBy: { name: "Elena Rodriguez", initials: "ER" },
      },
    ],
  },
  {
    id: "t4",
    code: "TASK-1032",
    title: "API Gateway Rate Limiting",
    description:
      "Implement rate limiting on the API gateway to prevent abuse and ensure fair usage across all tenants. Configure per-endpoint limits, burst allowances, and implement proper 429 responses with retry-after headers.",
    status: "in-progress",
    priority: "critical",
    project: "Infrastructure",
    section: "Backend",
    weight: 95,
    dueDate: "Nov 15, 2023",
    createdAt: "Oct 20, 2023",
    assignees: [assignees[4], assignees[2]],
    subtasks: [
      { id: "s26", title: "Define rate limit policies per endpoint", completed: true },
      { id: "s27", title: "Implement token bucket algorithm", completed: true },
      { id: "s28", title: "Add Redis-backed distributed counter", completed: false },
      { id: "s29", title: "Configure burst allowance", completed: false },
      { id: "s30", title: "Implement 429 response with retry-after", completed: false },
      { id: "s31", title: "Load test with simulated traffic", completed: false },
    ],
    rating: 3,
    ratings: [
      {
        id: "r3",
        date: "3/18/2026",
        overall: 68,
        criteria: [
          { label: "Code Efficiency", score: 72 },
          { label: "Best Practices", score: 80 },
          { label: "Collaboration", score: 55 },
          { label: "Delivery Completeness", score: 65 },
        ],
        ratedBy: { name: "Marcus Thorne", initials: "MT" },
      },
    ],
  },
  {
    id: "t5",
    code: "TASK-1033",
    title: "Dashboard Analytics Widgets",
    description:
      "Build interactive analytics widgets for the executive dashboard including revenue trends, user engagement metrics, and project velocity indicators. Use chart library for data visualization with dark theme support.",
    status: "todo",
    priority: "medium",
    project: "Analytics",
    section: "Frontend",
    weight: 60,
    dueDate: "Dec 01, 2023",
    createdAt: "Oct 25, 2023",
    assignees: [assignees[0], assignees[5]],
    subtasks: [
      { id: "s32", title: "Design widget layouts", completed: false },
      { id: "s33", title: "Implement revenue trend chart", completed: false },
      { id: "s34", title: "Build engagement metrics panel", completed: false },
      { id: "s35", title: "Create velocity indicators", completed: false },
    ],
    rating: 0,
    ratings: [],
  },
  {
    id: "t6",
    code: "TASK-1034",
    title: "Mobile Navigation Overhaul",
    description:
      "Redesign the mobile navigation to use a bottom tab bar pattern with gesture support. Implement smooth transitions between sections and ensure proper deep linking support for push notifications.",
    status: "in-progress",
    priority: "high",
    project: "Core UI",
    section: "Frontend",
    weight: 75,
    dueDate: "Nov 10, 2023",
    createdAt: "Oct 18, 2023",
    assignees: [assignees[3]],
    subtasks: [
      { id: "s36", title: "Wireframe new tab bar layout", completed: true },
      { id: "s37", title: "Implement gesture-based navigation", completed: true },
      { id: "s38", title: "Add transition animations", completed: false },
      { id: "s39", title: "Deep link routing configuration", completed: false },
      { id: "s40", title: "Cross-device testing", completed: false },
    ],
    rating: 2,
    ratings: [],
  },
  {
    id: "t7",
    code: "TASK-1035",
    title: "CI/CD Pipeline Optimization",
    description:
      "Optimize the CI/CD pipeline to reduce build times by 40%. Implement caching strategies, parallel test execution, and artifact management. Set up automated rollback mechanisms for failed deployments.",
    status: "completed",
    priority: "high",
    project: "Infrastructure",
    section: "DevOps",
    weight: 85,
    dueDate: "Oct 30, 2023",
    createdAt: "Oct 08, 2023",
    assignees: [assignees[4], assignees[2]],
    subtasks: [
      { id: "s41", title: "Audit current pipeline stages", completed: true },
      { id: "s42", title: "Implement build caching", completed: true },
      { id: "s43", title: "Parallelize test suites", completed: true },
      { id: "s44", title: "Set up artifact management", completed: true },
      { id: "s45", title: "Configure rollback mechanism", completed: true },
    ],
    rating: 5,
    ratings: [
      {
        id: "r4",
        date: "3/15/2026",
        overall: 96,
        criteria: [
          { label: "Code Efficiency", score: 95 },
          { label: "Best Practices", score: 98 },
          { label: "Collaboration", score: 92 },
          { label: "Delivery Completeness", score: 99 },
        ],
        ratedBy: { name: "Adrian Thorne", initials: "AT" },
      },
    ],
  },
  {
    id: "t8",
    code: "TASK-1036",
    title: "User Onboarding Flow Redesign",
    description:
      "Redesign the user onboarding experience with progressive disclosure, contextual tooltips, and a guided tour. Implement step tracking analytics and A/B test variants for conversion optimization.",
    status: "pending",
    priority: "medium",
    project: "Editorial Suite",
    section: "Design",
    weight: 55,
    dueDate: "Nov 20, 2023",
    createdAt: "Oct 22, 2023",
    assignees: [assignees[1], assignees[5]],
    subtasks: [
      { id: "s46", title: "Research onboarding best practices", completed: true },
      { id: "s47", title: "Design progressive disclosure steps", completed: false },
      { id: "s48", title: "Implement contextual tooltips", completed: false },
      { id: "s49", title: "Build guided tour component", completed: false },
      { id: "s50", title: "Set up A/B test framework", completed: false },
      { id: "s51", title: "Analytics integration", completed: false },
    ],
    rating: 0,
    ratings: [],
  },
  {
    id: "t9",
    code: "TASK-1037",
    title: "Database Query Optimization",
    description:
      "Identify and optimize slow database queries that impact page load times. Add proper indexing, refactor N+1 queries, and implement query result caching for frequently accessed data.",
    status: "in-progress",
    priority: "critical",
    project: "Infrastructure",
    section: "Backend",
    weight: 90,
    dueDate: "Nov 05, 2023",
    createdAt: "Oct 12, 2023",
    assignees: [assignees[2], assignees[4]],
    subtasks: [
      { id: "s52", title: "Profile slow queries", completed: true },
      { id: "s53", title: "Add missing indexes", completed: true },
      { id: "s54", title: "Refactor N+1 queries", completed: true },
      { id: "s55", title: "Implement query caching", completed: false },
      { id: "s56", title: "Performance regression testing", completed: false },
    ],
    rating: 4,
    ratings: [
      {
        id: "r5",
        date: "3/22/2026",
        overall: 78,
        criteria: [
          { label: "Code Efficiency", score: 85 },
          { label: "Best Practices", score: 80 },
          { label: "Collaboration", score: 65 },
          { label: "Timeline Discipline", score: 82 },
        ],
        ratedBy: { name: "Julian Vance", initials: "JV" },
      },
    ],
  },
  {
    id: "t10",
    code: "TASK-1038",
    title: "Accessibility Compliance Audit",
    description:
      "Conduct a full WCAG 2.1 AA audit across the platform. Fix color contrast issues, add proper ARIA labels, ensure keyboard navigation works, and verify screen reader compatibility.",
    status: "todo",
    priority: "high",
    project: "Core UI",
    section: "QA",
    weight: 70,
    dueDate: "Dec 15, 2023",
    createdAt: "Nov 01, 2023",
    assignees: [assignees[3], assignees[0]],
    subtasks: [
      { id: "s57", title: "Run automated accessibility scan", completed: false },
      { id: "s58", title: "Fix color contrast issues", completed: false },
      { id: "s59", title: "Add ARIA labels to interactive elements", completed: false },
      { id: "s60", title: "Test keyboard navigation", completed: false },
      { id: "s61", title: "Screen reader compatibility testing", completed: false },
    ],
    rating: 0,
    ratings: [],
  },
  {
    id: "t11",
    code: "TASK-1039",
    title: "Email Template System",
    description:
      "Build a templating system for transactional and marketing emails. Support dynamic content blocks, personalization tokens, and responsive layouts that render correctly across email clients.",
    status: "pending",
    priority: "low",
    project: "Marketing",
    section: "Frontend",
    weight: 40,
    dueDate: "Dec 10, 2023",
    createdAt: "Nov 05, 2023",
    assignees: [assignees[5]],
    subtasks: [
      { id: "s62", title: "Design email template components", completed: true },
      { id: "s63", title: "Build template rendering engine", completed: false },
      { id: "s64", title: "Add personalization token support", completed: false },
    ],
    rating: 1,
    ratings: [],
  },
  {
    id: "t12",
    code: "TASK-1040",
    title: "Real-time Notification System",
    description:
      "Implement WebSocket-based real-time notifications for task updates, mentions, and system alerts. Include notification preferences, batching for high-frequency events, and persistent notification history.",
    status: "in-progress",
    priority: "high",
    project: "Infrastructure",
    section: "Backend",
    weight: 80,
    dueDate: "Nov 25, 2023",
    createdAt: "Oct 28, 2023",
    assignees: [assignees[0], assignees[2]],
    subtasks: [
      { id: "s65", title: "Set up WebSocket server", completed: true },
      { id: "s66", title: "Implement event subscription system", completed: true },
      { id: "s67", title: "Build notification preference UI", completed: false },
      { id: "s68", title: "Add event batching logic", completed: false },
      { id: "s69", title: "Implement notification history", completed: false },
      { id: "s70", title: "Integration testing", completed: false },
    ],
    rating: 3,
    ratings: [
      {
        id: "r6",
        date: "3/25/2026",
        overall: 72,
        criteria: [
          { label: "Code Efficiency", score: 78 },
          { label: "Best Practices", score: 70 },
          { label: "Collaboration", score: 68 },
          { label: "Delivery Completeness", score: 72 },
        ],
        ratedBy: { name: "Sarah Jenkins", initials: "SJ" },
      },
    ],
  },
]
