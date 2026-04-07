export type RatingField = {
  id: string
  name: string
  description?: string
  maxValue: number
}

export type ConfigurationType = "TASK" | "STAKEHOLDER"
export type ConfigurationStatus = "ACTIVE" | "INACTIVE"

export type Configuration = {
  id: string
  name: string
  description?: string
  type: ConfigurationType
  status: ConfigurationStatus
  fields: RatingField[]
  creator: {
    name: string
    email: string
    avatar?: string
  }
  createdAt: string
  updatedAt: string
}

export type ConfigurationFormData = {
  name: string
  description: string
  type: ConfigurationType
  status: ConfigurationStatus
  fields: Omit<RatingField, "id">[]
}

export const configurations: Configuration[] = [
  {
    id: "cfg-001",
    name: "Documentation and Planning",
    description: "Evaluates quality of project documentation, planning accuracy, and structural organization.",
    type: "TASK",
    status: "ACTIVE",
    fields: [
      { id: "f1", name: "Precision & Accuracy", description: "How well the work meets defined requirements and correctness standards.", maxValue: 10 },
      { id: "f2", name: "Creative Execution", description: "Innovation and creativity applied to task solutions.", maxValue: 10 },
      { id: "f3", name: "Structural Integrity", description: "Logical organization and structural soundness of delivered work.", maxValue: 10 },
      { id: "f4", name: "Timeline Discipline", description: "Adherence to deadlines and timely progress updates.", maxValue: 10 },
    ],
    creator: {
      name: "Marcus Thorne",
      email: "marcus.thorne@company.com",
      avatar: "https://i.pravatar.cc/150?u=marcus",
    },
    createdAt: "2025-11-01",
    updatedAt: "2026-01-15",
  },
  {
    id: "cfg-002",
    name: "Stakeholder Engagement",
    description: "Rates stakeholder communication quality, responsiveness, and collaboration effectiveness.",
    type: "STAKEHOLDER",
    status: "ACTIVE",
    fields: [
      { id: "f5", name: "Communication Clarity", description: "Clarity and effectiveness of stakeholder communications.", maxValue: 10 },
      { id: "f6", name: "Responsiveness", description: "Speed and quality of responses to feedback and requests.", maxValue: 10 },
      { id: "f7", name: "Collaboration", description: "Willingness to collaborate and align with team objectives.", maxValue: 10 },
    ],
    creator: {
      name: "Elena Rodriguez",
      email: "elena.rodriguez@company.com",
      avatar: "https://i.pravatar.cc/150?u=elena",
    },
    createdAt: "2025-11-15",
    updatedAt: "2026-02-01",
  },
  {
    id: "cfg-003",
    name: "Code Quality Review",
    description: "Technical code quality assessment covering readability, test coverage, and performance.",
    type: "TASK",
    status: "ACTIVE",
    fields: [
      { id: "f8", name: "Code Readability", description: "How clean, readable, and maintainable the code is.", maxValue: 10 },
      { id: "f9", name: "Test Coverage", description: "Percentage and quality of unit and integration tests.", maxValue: 10 },
      { id: "f10", name: "Performance", description: "Runtime performance and resource efficiency of the solution.", maxValue: 10 },
      { id: "f11", name: "Security Practices", description: "Adherence to security best practices and vulnerability mitigation.", maxValue: 10 },
    ],
    creator: {
      name: "Julian Vance",
      email: "julian.vance@company.com",
      avatar: "https://i.pravatar.cc/150?u=julian",
    },
    createdAt: "2025-12-01",
    updatedAt: "2026-01-20",
  },
  {
    id: "cfg-004",
    name: "Client Satisfaction Survey",
    description: "Measures client satisfaction with deliverables and service experience.",
    type: "STAKEHOLDER",
    status: "INACTIVE",
    fields: [
      { id: "f12", name: "Delivery Quality", description: "Overall quality of deliverables as perceived by the client.", maxValue: 5 },
      { id: "f13", name: "Service Experience", description: "Client experience throughout the engagement.", maxValue: 5 },
    ],
    creator: {
      name: "Sarah Jenkins",
      email: "sarah.jenkins@company.com",
      avatar: "https://i.pravatar.cc/150?u=sarah",
    },
    createdAt: "2026-01-10",
    updatedAt: "2026-01-10",
  },
  {
    id: "cfg-005",
    name: "Design Review Standards",
    description: "Assesses visual design quality, UX principles adherence, and brand consistency.",
    type: "TASK",
    status: "ACTIVE",
    fields: [
      { id: "f14", name: "Visual Consistency", description: "Adherence to design system and brand guidelines.", maxValue: 10 },
      { id: "f15", name: "UX Usability", description: "How intuitive and accessible the design is for users.", maxValue: 10 },
      { id: "f16", name: "Responsiveness", description: "Quality of responsive design across screen sizes.", maxValue: 10 },
    ],
    creator: {
      name: "Lila Rossi",
      email: "lila.rossi@company.com",
      avatar: "https://i.pravatar.cc/150?u=lila",
    },
    createdAt: "2026-02-01",
    updatedAt: "2026-03-05",
  },
]
