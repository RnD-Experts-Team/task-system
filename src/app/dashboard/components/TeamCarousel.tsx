import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mail, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Demo data
const TEAM_MEMBERS = [
  { id: 1, name: "Elena Wright", role: "Lead Designer", email: "elena.w@company.io", initials: "EW", department: "Design" },
  { id: 2, name: "Marcus Chen", role: "Senior Developer", email: "m.chen@company.io", initials: "MC", department: "Engineering" },
  { id: 3, name: "Sarah Jenkins", role: "Project Manager", email: "s.jenkins@company.io", initials: "SJ", department: "Operations" },
  { id: 4, name: "Alex Kim", role: "DevOps Engineer", email: "a.kim@company.io", initials: "AK", department: "Engineering" },
  { id: 5, name: "Priya Sharma", role: "QA Lead", email: "p.sharma@company.io", initials: "PS", department: "Quality" },
]

const STATUS_COLORS = {
  online: "bg-emerald-500",
  away: "bg-amber-400",
  offline: "bg-zinc-500",
} as const

type ExtendedMember = (typeof TEAM_MEMBERS)[number] & { _key: string; status?: keyof typeof STATUS_COLORS }

const MEMBER_STATUSES: Record<number, ExtendedMember["status"]> = {
  1: "online",
  2: "online",
  3: "away",
  4: "online",
  5: "offline",
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
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])
  return reduced
}

const TeamCard = memo(function TeamCard({ member, isActive }: { member: ExtendedMember; isActive: boolean }) {
  return (
    <div
      className={cn(
        "glass-panel flex flex-col items-center gap-3 rounded-2xl border p-4 text-center min-w-0 max-w-full",
        "select-none transition-all duration-300",
        isActive
          ? "border-primary/30 shadow-lg shadow-primary/10 scale-100 opacity-100"
          : "border-border/20 scale-95 opacity-50",
      )}
    >
      <div className="relative">
        <Avatar className="size-14 ring-2 ring-primary/20">
          <AvatarFallback className="bg-primary/10 text-base font-bold text-primary">{member.initials}</AvatarFallback>
        </Avatar>
        {member.status && (
          <span
            className={cn(
              "absolute bottom-0.5 right-0.5 size-3 rounded-full border-2 border-background",
              // @ts-ignore color class
              STATUS_COLORS[member.status],
            )}
            aria-label={member.status}
          />
        )}
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
  const visibleCards = useVisibleCards()
  const prefersReducedMotion = usePrefersReducedMotion()

  const CLONE_COUNT = visibleCards
  const REAL_COUNT = TEAM_MEMBERS.length

  const extended = useMemo<ExtendedMember[]>(
    () => [
      ...TEAM_MEMBERS.slice(-CLONE_COUNT).map((m, i) => ({ ...m, _key: `pre-${i}-${m.id}`, status: MEMBER_STATUSES[m.id] })),
      ...TEAM_MEMBERS.map((m) => ({ ...m, _key: `real-${m.id}`, status: MEMBER_STATUSES[m.id] })),
      ...TEAM_MEMBERS.slice(0, CLONE_COUNT).map((m, i) => ({ ...m, _key: `post-${i}-${m.id}`, status: MEMBER_STATUSES[m.id] })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [CLONE_COUNT],
  )

  const TOTAL = extended.length

  const [currentIndex, setCurrentIndex] = useState<number>(CLONE_COUNT)
  const [isAnimating, setIsAnimating] = useState<boolean>(false)
  const [dragOffset, setDragOffset] = useState<number>(0)
  const [isHovered, setIsHovered] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragOffsetRef = useRef(0)
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    setCurrentIndex(CLONE_COUNT)
    setIsAnimating(false)
    setDragOffset(0)
    dragOffsetRef.current = 0
  }, [CLONE_COUNT])

  const navigate = useCallback((dir: 1 | -1) => {
    if (isAnimating) return
    setIsAnimating(true)
    setCurrentIndex((prev) => prev + dir)
  }, [isAnimating])

  const handleTransitionEnd = useCallback((e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return
    setIsAnimating(false)
    setCurrentIndex((prev) => {
      if (prev < CLONE_COUNT) return prev + REAL_COUNT
      if (prev >= CLONE_COUNT + REAL_COUNT) return prev - REAL_COUNT
      return prev
    })
  }, [CLONE_COUNT, REAL_COUNT])

  useEffect(() => {
    if (isHovered || prefersReducedMotion) {
      clearInterval(autoPlayTimerRef.current)
      return
    }
    autoPlayTimerRef.current = setInterval(() => navigate(1), AUTOPLAY_INTERVAL_MS)
    return () => clearInterval(autoPlayTimerRef.current)
  }, [isHovered, prefersReducedMotion, navigate])

  const onPointerStart = useCallback((clientX: number) => {
    isDraggingRef.current = true
    setIsDragging(true)
    dragStartXRef.current = clientX
    dragOffsetRef.current = 0
    setDragOffset(0)
  }, [])

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
    dragOffsetRef.current = 0
    setDragOffset(0)

    const containerWidth = containerRef.current?.clientWidth ?? 300
    const snapThreshold = (containerWidth / visibleCards) * 0.25
    if (Math.abs(offset) > snapThreshold) {
      navigate(offset < 0 ? 1 : -1)
    }
  }, [navigate, visibleCards])

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
  const cardWidthPx = containerWidth > 0 ? containerWidth / visibleCards : 1
  const dragCards = dragOffset / cardWidthPx
  const translatePct = -((currentIndex - dragCards) / TOTAL) * 100

  // Show the middle visible card as active instead of the left-most one.
  const centerOffset = Math.floor(visibleCards / 2)
  const activeIndex = currentIndex + centerOffset

  const trackStyle = {
    width: `${(TOTAL / visibleCards) * 100}%`,
    transform: `translate3d(${translatePct}%, 0, 0)`,
    transition: isAnimating && !isDraggingRef.current && !prefersReducedMotion ? "transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94)" : "none",
    willChange: "transform",
  }

  const dotIndex = ((activeIndex - CLONE_COUNT) % REAL_COUNT + REAL_COUNT) % REAL_COUNT

  return (
    <section aria-label="Active team members" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold tracking-tight">Active Team Members</h2>
        <Button variant="ghost" size="sm" className="h-auto p-0 text-sm font-semibold text-primary hover:text-primary/80">View All</Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex">
          <CarouselControl direction="prev" onClick={() => navigate(-1)} disabled={isAnimating} />
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
          onKeyDown={(e) => { if (e.key === "ArrowLeft") { e.preventDefault(); navigate(-1) } if (e.key === "ArrowRight") { e.preventDefault(); navigate(1) } }}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Team members"
        >
          <div style={trackStyle} onTransitionEnd={handleTransitionEnd} className="flex py-1">
            {extended.map((member, idx) => (
              <div key={member._key} style={{ width: `${100 / TOTAL}%` }} className="flex-none px-1.5" aria-hidden={idx < CLONE_COUNT || idx >= CLONE_COUNT + REAL_COUNT}>
                <TeamCard member={member} isActive={idx === activeIndex} />
              </div>
            ))}
          </div>
        </div>

        <div className="hidden sm:flex">
          <CarouselControl direction="next" onClick={() => navigate(1)} disabled={isAnimating} />
        </div>
      </div>

      <div className="flex justify-center gap-1.5" role="tablist" aria-label="Carousel pagination">
        {TEAM_MEMBERS.map((member, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === dotIndex}
            aria-label={`Go to ${member.name}`}
            onClick={() => { if (isAnimating) return; setIsAnimating(true); setCurrentIndex(CLONE_COUNT + i - centerOffset) }}
            className={cn("h-1 rounded-full transition-all duration-300", i === dotIndex ? "w-5 bg-primary" : "w-1 bg-border hover:bg-primary/40")}
          />
        ))}
      </div>
    </section>
  )
}
