import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from "react"
import { isCancel } from "axios"
import { useNavigate } from "react-router"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail, ChevronLeft, ChevronRight, RefreshCw, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { usersService } from "@/services/usersService"
import type { User } from "@/app/users/data"

const STATUS_COLORS = {
  online: "bg-emerald-500",   // active users — green
  away: "bg-amber-400",       // away users — amber
  offline: "bg-red-500",      // inactive / suspended — red
  admin: "bg-violet-500",     // admin role — violet
} as const

const STATUS_LABELS: Record<keyof typeof STATUS_COLORS, string> = {
  online: "Active",
  away: "Away",
  offline: "Inactive",
  admin: "Admin",
}

type MemberStatus = keyof typeof STATUS_COLORS

type TeamMember = {
  id: string
  name: string
  role: string
  email: string
  initials: string
  department: string
  avatarUrl: string | null
  status: MemberStatus
}

type ExtendedMember = TeamMember & { _key: string }

const FALLBACK_ROLE = "Team Member"

function resolveStatus(user: User): MemberStatus {
  if (user.role.toLowerCase().includes("admin")) return "admin"
  if (user.status === "active") return "online"
  if (user.status === "away") return "away"
  return "offline"
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U"
}

function getDepartmentFromRole(role: string): string {
  if (!role || role === "—") return "General"
  const [firstWord] = role.split(" ")
  return firstWord || "General"
}

function mapUsersToTeamMembers(users: User[]): TeamMember[] {
  return users.map((user) => {
    const normalizedRole = user.role && user.role !== "—" ? user.role : FALLBACK_ROLE
    return {
      id: user.id,
      name: user.name,
      role: normalizedRole,
      email: user.email,
      initials: getInitials(user.name),
      department: getDepartmentFromRole(normalizedRole),
      avatarUrl: user.avatarUrl,
      status: resolveStatus(user),
    }
  })
}

function TeamCarouselLoading() {
  return (
    <section aria-label="Active team members" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold tracking-tight">Active Team Members</h2>
        <Skeleton className="h-4 w-14" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((idx) => (
          <div key={idx} className="glass-panel rounded-2xl border p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-14 rounded-full" />
              <div className="space-y-2 min-w-0 flex-1">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ))}
      </div>
    </section>
  )
}

function useVisibleCards(): number {
  const getCount = (): number => {
    if (typeof window === "undefined") return 3
    if (window.innerWidth < 640) return 1
    if (window.innerWidth < 1024) return 2
    return 3
  }
  const [count, setCount] = useState<number>(getCount)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const handler = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setCount(getCount()), 150)
    }
    window.addEventListener("resize", handler)
    return () => {
      window.removeEventListener("resize", handler)
      clearTimeout(timer)
    }
  }, [])
  return count
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return reduced
}

const TeamCard = memo(function TeamCard({ member, isActive, onClick }: { member: ExtendedMember; isActive: boolean; onClick?: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View ${member.name}'s profile`}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.() }}
      className={cn(
        "glass-panel flex flex-col items-center gap-3 rounded-2xl border p-4 text-center min-w-0 max-w-full",
        "select-none transition-all duration-300",
        onClick && "cursor-pointer hover:border-primary/50 hover:shadow-primary/20",
        isActive
          ? "border-primary/30 shadow-lg shadow-primary/10 scale-100 opacity-100"
          : "border-border/20 scale-95 opacity-50",
      )}
    >
      <div className="relative">
        <Avatar className="size-14 ring-2 ring-primary/20">
          {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt={member.name} /> : null}
          <AvatarFallback className="bg-primary/10 text-base font-bold text-primary">{member.initials}</AvatarFallback>
        </Avatar>
        <span
          className={cn(
            "absolute bottom-0.5 right-0.5 size-3 rounded-full border-2 border-background",
            STATUS_COLORS[member.status],
          )}
          aria-label={STATUS_LABELS[member.status]}
          title={STATUS_LABELS[member.status]}
        />
      </div>

      <div className="space-y-0.5">
        <h3 className="font-heading text-sm font-bold leading-tight">{member.name}</h3>
        <p className="text-xs text-muted-foreground">{member.role}</p>
        <Badge variant="outline" className="mt-1 text-[10px] uppercase tracking-wide">{member.department}</Badge>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Mail className="size-3 shrink-0" />
        <span className="max-w-36 truncate">{member.email}</span>
      </div>
    </div>
  )
})

const CarouselControl = memo(function CarouselControl({ direction, onClick, disabled }: { direction: "prev" | "next"; onClick: () => void; disabled: boolean }) {
  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        "size-8 shrink-0 rounded-full border-border/50 bg-card",
        "hover:border-primary/30 hover:bg-primary/10",
        "focus-visible:ring-2 focus-visible:ring-primary/40",
      )}
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous member" : "Next member"}
    >
      {direction === "prev" ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
    </Button>
  )
})

const AUTOPLAY_INTERVAL_MS = 3500

export default function TeamCarousel() {
  const routerNavigate = useNavigate()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch the first users page and map it for the carousel cards.
  const fetchTeamMembers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { users } = await usersService.getAll(1)
      setMembers(mapUsersToTeamMembers(users))
    } catch (err) {
      // Ignore canceled requests; show other failures in the UI.
      if (!isCancel(err)) {
        setError("Failed to load users. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTeamMembers()
  }, [fetchTeamMembers])

  const visibleCards = useVisibleCards()
  const prefersReducedMotion = usePrefersReducedMotion()

  const hasMembers = members.length > 0
  const REAL_COUNT = members.length
  const VISIBLE_COUNT = Math.max(1, Math.min(visibleCards, Math.max(REAL_COUNT, 1)))
  const CLONE_COUNT = VISIBLE_COUNT
  const canSlide = REAL_COUNT > 1

  const extended = useMemo<ExtendedMember[]>(
    () => {
      if (members.length === 0) return []
      return [
        ...members.slice(-CLONE_COUNT).map((m, i) => ({ ...m, _key: `pre-${i}-${m.id}` })),
        ...members.map((m) => ({ ...m, _key: `real-${m.id}` })),
        ...members.slice(0, CLONE_COUNT).map((m, i) => ({ ...m, _key: `post-${i}-${m.id}` })),
      ]
    },
    [members, CLONE_COUNT],
  )

  const TOTAL = Math.max(1, extended.length)

  const [currentIndex, setCurrentIndex] = useState<number>(CLONE_COUNT)
  const [isAnimating, setIsAnimating] = useState<boolean>(false)
  const [dragOffset, setDragOffset] = useState<number>(0)
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragOffsetRef = useRef(0)
  const lastDragDistanceRef = useRef(0)
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    setCurrentIndex(CLONE_COUNT)
    setIsAnimating(false)
    setDragOffset(0)
    dragOffsetRef.current = 0
  }, [CLONE_COUNT])

  const goSlide = useCallback((dir: 1 | -1) => {
    if (isAnimating || !canSlide) return
    setIsAnimating(true)
    setCurrentIndex((prev) => prev + dir)
  }, [isAnimating, canSlide])

  const handleTransitionEnd = useCallback((e: React.TransitionEvent<HTMLDivElement>) => {
    if (!canSlide) return
    if (e.target !== e.currentTarget) return
    setIsAnimating(false)
    setCurrentIndex((prev) => {
      if (prev < CLONE_COUNT) return prev + REAL_COUNT
      if (prev >= CLONE_COUNT + REAL_COUNT) return prev - REAL_COUNT
      return prev
    })
  }, [canSlide, CLONE_COUNT, REAL_COUNT])

  useEffect(() => {
    if (!canSlide || isHovered || prefersReducedMotion) {
      clearInterval(autoPlayTimerRef.current)
      return
    }
    autoPlayTimerRef.current = setInterval(() => goSlide(1), AUTOPLAY_INTERVAL_MS)
    return () => clearInterval(autoPlayTimerRef.current)
  }, [canSlide, isHovered, prefersReducedMotion, goSlide])

  const onPointerStart = useCallback((clientX: number) => {
    if (!canSlide) return
    isDraggingRef.current = true
    setIsDragging(true)
    dragStartXRef.current = clientX
    dragOffsetRef.current = 0
    setDragOffset(0)
  }, [canSlide])

  const onPointerMove = useCallback((clientX: number) => {
    if (!isDraggingRef.current) return
    const offset = clientX - dragStartXRef.current
    dragOffsetRef.current = offset
    setDragOffset(offset)
  }, [])

  const onPointerEnd = useCallback(() => {
    if (!isDraggingRef.current) return
    isDraggingRef.current = false
    setIsDragging(false)
    const offset = dragOffsetRef.current
    lastDragDistanceRef.current = Math.abs(offset)
    dragOffsetRef.current = 0
    setDragOffset(0)

    const containerWidth = containerRef.current?.clientWidth ?? 300
    const snapThreshold = (containerWidth / VISIBLE_COUNT) * 0.25
    if (Math.abs(offset) > snapThreshold) {
      goSlide(offset < 0 ? 1 : -1)
    }
  }, [goSlide, VISIBLE_COUNT])

  useEffect(() => {
    const onMM = (e: MouseEvent) => onPointerMove(e.clientX)
    const onMU = () => onPointerEnd()
    const onTM = (e: TouchEvent) => { if (isDraggingRef.current) e.preventDefault(); onPointerMove(e.touches[0].clientX) }
    const onTE = () => onPointerEnd()
    document.addEventListener("mousemove", onMM)
    document.addEventListener("mouseup", onMU)
    document.addEventListener("touchmove", onTM, { passive: false })
    document.addEventListener("touchend", onTE)
    return () => {
      document.removeEventListener("mousemove", onMM)
      document.removeEventListener("mouseup", onMU)
      document.removeEventListener("touchmove", onTM)
      document.removeEventListener("touchend", onTE)
    }
  }, [onPointerMove, onPointerEnd])

  const containerWidth = containerRef.current?.clientWidth ?? 0
  const cardWidthPx = containerWidth > 0 ? containerWidth / VISIBLE_COUNT : 1
  const dragCards = dragOffset / cardWidthPx
  const translatePct = -((currentIndex - dragCards) / TOTAL) * 100

  // Show the middle visible card as active instead of the left-most one.
  const centerOffset = Math.floor(VISIBLE_COUNT / 2)
  const activeIndex = currentIndex + centerOffset

  const trackStyle = {
    width: `${(TOTAL / VISIBLE_COUNT) * 100}%`,
    transform: `translate3d(${translatePct}%, 0, 0)`,
    transition: isAnimating && !isDraggingRef.current && !prefersReducedMotion ? "transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
    willChange: "transform",
  }

  const dotIndex = REAL_COUNT > 0
    ? ((activeIndex - CLONE_COUNT) % REAL_COUNT + REAL_COUNT) % REAL_COUNT
    : 0

  if (loading) {
    return <TeamCarouselLoading />
  }

  if (error) {
    return (
      <section aria-label="Active team members" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold tracking-tight">Active Team Members</h2>
        </div>

        <div className="glass-panel rounded-2xl border p-6 text-center space-y-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="gap-2" onClick={fetchTeamMembers}>
            <RefreshCw className="size-4" />
            Retry
          </Button>
        </div>
      </section>
    )
  }

  if (!hasMembers) {
    return (
      <section aria-label="Active team members" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold tracking-tight">Active Team Members</h2>
        </div>

        <div className="glass-panel rounded-2xl border p-6 text-center">
          <Users className="mx-auto size-5 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No users available yet.</p>
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Active team members" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold tracking-tight">Active Team Members</h2>
        <Button variant="ghost" size="sm" className="h-auto p-0 text-sm font-semibold text-primary hover:text-primary/80" disabled>
          {REAL_COUNT} Members
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex">
          <CarouselControl direction="prev" onClick={() => goSlide(-1)} disabled={isAnimating || !canSlide} />
        </div>

        <div
          ref={containerRef}
          className="relative min-w-0 flex-1 overflow-hidden"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
            cursor: isDragging ? "grabbing" : "grab",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => { setIsHovered(false); if (isDraggingRef.current) onPointerEnd() }}
          onMouseDown={(e) => { e.preventDefault(); onPointerStart(e.clientX) }}
          onTouchStart={(e) => onPointerStart(e.touches[0].clientX)}
          onKeyDown={(e) => {
            if (!canSlide) return
            if (e.key === "ArrowLeft") { e.preventDefault(); goSlide(-1) }
            if (e.key === "ArrowRight") { e.preventDefault(); goSlide(1) }
          }}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Team members"
        >
          <div style={trackStyle} onTransitionEnd={handleTransitionEnd} className="flex py-1">
            {extended.map((member, idx) => (
              <div key={member._key} style={{ width: `${100 / TOTAL}%` }} className="flex-none px-1.5" aria-hidden={idx < CLONE_COUNT || idx >= CLONE_COUNT + REAL_COUNT}>
                <TeamCard
                  member={member}
                  isActive={idx === activeIndex}
                  onClick={() => {
                    if (lastDragDistanceRef.current > 5) return
                    routerNavigate("/users", { state: { openUserId: member.id } })
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden sm:flex">
          <CarouselControl direction="next" onClick={() => goSlide(1)} disabled={isAnimating || !canSlide} />
        </div>
      </div>

      <div className="flex justify-center gap-1.5" role="tablist" aria-label="Carousel pagination">
        {members.map((member, i) => (
          <button
            key={member.id}
            role="tab"
            aria-selected={i === dotIndex}
            aria-label={`Go to ${member.name}`}
            onClick={() => {
              if (isAnimating || !canSlide) return
              setIsAnimating(true)
              setCurrentIndex(CLONE_COUNT + i)
            }}
            disabled={!canSlide}
            className={cn("h-1 rounded-full transition-all duration-300", i === dotIndex ? "w-5 bg-primary" : "w-1 bg-border hover:bg-primary/40")}
          />
        ))}
      </div>
    </section>
  )
}
