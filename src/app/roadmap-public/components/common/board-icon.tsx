import { BarChart3, Bug, Globe, Layers, Lightbulb, ListChecks, MessageSquare, Package, Rocket, Settings, Smartphone, Star, Users, type LucideIcon } from "lucide-react"

const EMOJI = /\p{Extended_Pictographic}/u

// Curated set of icon names admins can type in the board settings; anything else falls back to a lightbulb.
const ICONS: Record<string, LucideIcon> = {
  "list-checks": ListChecks,
  lightbulb: Lightbulb,
  smartphone: Smartphone,
  mobile: Smartphone,
  globe: Globe,
  web: Globe,
  layers: Layers,
  rocket: Rocket,
  star: Star,
  bug: Bug,
  "message-square": MessageSquare,
  settings: Settings,
  package: Package,
  users: Users,
  "bar-chart": BarChart3,
  chart: BarChart3,
}

export function BoardIcon({ icon, className }: { icon: string | null | undefined; className?: string }) {
  if (icon && EMOJI.test(icon)) return <span aria-hidden="true">{icon}</span>
  const Icon = (icon && ICONS[icon.trim().toLowerCase()]) || Lightbulb
  return <Icon aria-hidden="true" className={className} />
}
