export type UserStatus = "active" | "away" | "suspended"

export type User = {
  id: string
  name: string
  email: string
  role: string
  status: UserStatus
  avatarUrl: string
  createdAt: string
}

export const users: User[] = [
  {
    id: "1",
    name: "Marcus Thorne",
    email: "m.thorne@system.io",
    role: "Senior Architect",
    status: "active",
    avatarUrl: "https://i.pravatar.cc/150?u=marcus",
    createdAt: "Oct 12, 2023",
  },
  {
    id: "2",
    name: "Elena Rodriguez",
    email: "elena.rod@system.io",
    role: "Product Lead",
    status: "away",
    avatarUrl: "https://i.pravatar.cc/150?u=elena",
    createdAt: "Nov 04, 2023",
  },
  {
    id: "3",
    name: "Julian Vance",
    email: "j.vance@system.io",
    role: "Developer",
    status: "active",
    avatarUrl: "https://i.pravatar.cc/150?u=julian",
    createdAt: "Jan 18, 2024",
  },
  {
    id: "4",
    name: "Sarah Jenkins",
    email: "s.jenkins@system.io",
    role: "Designer",
    status: "suspended",
    avatarUrl: "https://i.pravatar.cc/150?u=sarah",
    createdAt: "Feb 02, 2024",
  },
  {
    id: "5",
    name: "Adrian Thorne",
    email: "a.thorne@system.io",
    role: "Senior Architect",
    status: "active",
    avatarUrl: "https://i.pravatar.cc/150?u=adrian",
    createdAt: "Oct 12, 2023",
  },
  {
    id: "6",
    name: "Elara Vance",
    email: "e.vance@system.io",
    role: "Product Lead",
    status: "active",
    avatarUrl: "https://i.pravatar.cc/150?u=elara",
    createdAt: "Jan 05, 2024",
  },
  {
    id: "7",
    name: "Sasha Wright",
    email: "s.wright@system.io",
    role: "Chief Editor",
    status: "active",
    avatarUrl: "https://i.pravatar.cc/150?u=sasha",
    createdAt: "Nov 18, 2023",
  },
  {
    id: "8",
    name: "Lila Rossi",
    email: "l.rossi@system.io",
    role: "Copywriter",
    status: "away",
    avatarUrl: "https://i.pravatar.cc/150?u=lila",
    createdAt: "Apr 15, 2024",
  },
  {
    id: "9",
    name: "Elena Kostas",
    email: "e.kostas@system.io",
    role: "Lead Designer",
    status: "active",
    avatarUrl: "https://i.pravatar.cc/150?u=kostas",
    createdAt: "Dec 03, 2023",
  },
  {
    id: "10",
    name: "Thomas Hale",
    email: "t.hale@system.io",
    role: "Legal Counsel",
    status: "active",
    avatarUrl: "https://i.pravatar.cc/150?u=thomas",
    createdAt: "May 20, 2023",
  },
  {
    id: "11",
    name: "Riley Quinn",
    email: "r.quinn@system.io",
    role: "Content Strategy",
    status: "active",
    avatarUrl: "https://i.pravatar.cc/150?u=riley",
    createdAt: "Jun 12, 2024",
  },
  {
    id: "12",
    name: "Derek Stone",
    email: "d.stone@system.io",
    role: "DevOps Engineer",
    status: "suspended",
    avatarUrl: "https://i.pravatar.cc/150?u=derek",
    createdAt: "Mar 01, 2024",
  },
]
