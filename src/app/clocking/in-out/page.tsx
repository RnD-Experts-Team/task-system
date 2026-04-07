import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Play, Square, Coffee, Clock, CalendarDays, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { SessionEvent } from "../data"

function formatTime(date: Date): { hours: string; minutes: string; seconds: string; period: string } {
  const h = date.getHours()
  const period = h >= 12 ? "PM" : "AM"
  const hours12 = h % 12 || 12
  return {
    hours: String(hours12).padStart(2, "0"),
    minutes: String(date.getMinutes()).padStart(2, "0"),
    seconds: String(date.getSeconds()).padStart(2, "0"),
    period,
  }
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function formatTimeFromDate(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

export default function ClockingInOutPage() {
  const [now, setNow] = useState(new Date())
  const [isActive, setIsActive] = useState(false)
  const [isOnBreak, setIsOnBreak] = useState(false)
  const [clockInTime, setClockInTime] = useState<Date | null>(null)
  const [workMs, setWorkMs] = useState(0)
  const [breakMs, setBreakMs] = useState(0)
  const [breakCount, setBreakCount] = useState(0)
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null)
  const [sessionEvents, setSessionEvents] = useState<SessionEvent[]>([])

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Work/break timer
  useEffect(() => {
    if (!isActive) return
    const interval = setInterval(() => {
      const current = new Date()
      if (isOnBreak && breakStartTime) {
        setBreakMs((prev) => prev + 1000)
      } else if (clockInTime) {
        const totalElapsed = current.getTime() - clockInTime.getTime()
        setWorkMs(totalElapsed - breakMs)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [isActive, isOnBreak, clockInTime, breakStartTime, breakMs])

  const handleClockIn = useCallback(() => {
    const t = new Date()
    setIsActive(true)
    setClockInTime(t)
    setWorkMs(0)
    setBreakMs(0)
    setBreakCount(0)
    setIsOnBreak(false)
    setBreakStartTime(null)
    setSessionEvents([
      {
        type: "clock-in",
        label: `Clock In at ${formatTimeFromDate(t)}`,
        detail: "Session Started",
      },
    ])
  }, [])

  const handleClockOut = useCallback(() => {
    const t = new Date()
    setIsActive(false)
    setIsOnBreak(false)
    setSessionEvents((prev) => [
      ...prev,
      {
        type: "clock-out",
        label: `Clock Out at ${formatTimeFromDate(t)}`,
        detail: "Session Ended",
      },
    ])
  }, [])

  const handleToggleBreak = useCallback(() => {
    const t = new Date()
    if (isOnBreak && breakStartTime) {
      const dur = t.getTime() - breakStartTime.getTime()
      setIsOnBreak(false)
      setSessionEvents((prev) => {
        const updated = [...prev]
        const lastBreak = [...updated].reverse().find((e) => e.type === "break" && !e.duration)
        if (lastBreak) {
          lastBreak.duration = formatDuration(dur)
          lastBreak.detail = `${formatTimeFromDate(breakStartTime)} → ${formatTimeFromDate(t)}`
        }
        return updated
      })
      setBreakStartTime(null)
    } else {
      setIsOnBreak(true)
      setBreakStartTime(t)
      setBreakCount((c) => c + 1)
      setSessionEvents((prev) => [
        ...prev,
        {
          type: "break",
          label: `Break ${breakCount + 1}`,
          detail: `Started at ${formatTimeFromDate(t)}`,
        },
      ])
    }
  }, [isOnBreak, breakStartTime, breakCount])

  const time = formatTime(now)
  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Digital Clock */}
        <div className="mb-12">
          <h2 className="flex items-baseline gap-1 text-6xl font-thin tracking-tighter text-foreground sm:text-7xl lg:text-8xl">
            {time.hours}:{time.minutes}
            <span className="text-primary font-light">{time.seconds}</span>
            <span className="ml-3 text-xl font-bold uppercase tracking-widest text-muted-foreground sm:text-2xl">
              {time.period}
            </span>
          </h2>
          <div className="mt-2 flex items-center justify-center gap-2 text-muted-foreground">
            <CalendarDays className="size-3.5" />
            <p className="text-xs font-bold uppercase tracking-widest">{dateStr}</p>
          </div>
        </div>

        {/* Central Card */}
        <div
          className={cn(
            "w-full rounded-3xl border bg-card/60 p-6 backdrop-blur-xl transition-all sm:p-8 lg:p-10",
            isActive
              ? "border-primary/20 shadow-[0_0_40px_-10px] shadow-primary/20"
              : "border-border/50"
          )}
        >
          {/* Stats Row */}
          <div className="mb-8 grid grid-cols-3 gap-4 border-b border-border/20 pb-8 sm:gap-8">
            <div className="text-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-primary">
                Work Time
              </p>
              <p
                className={cn(
                  "font-mono text-lg font-light tracking-tight sm:text-2xl",
                  isActive && !isOnBreak && "animate-pulse"
                )}
              >
                {formatDuration(workMs)}
              </p>
            </div>
            <div className="border-x border-border/20 text-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Break Time
              </p>
              <p
                className={cn(
                  "font-mono text-lg font-light tracking-tight text-muted-foreground sm:text-2xl",
                  isOnBreak && "text-foreground animate-pulse"
                )}
              >
                {formatDuration(breakMs)}
              </p>
            </div>
            <div className="text-center">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Breaks Today
              </p>
              <p className="font-mono text-lg font-light tracking-tight sm:text-2xl">{breakCount}</p>
            </div>
          </div>

          {/* Action Area */}
          <div className="flex flex-col items-center gap-6">
            {!isActive ? (
              <>
                <button
                  onClick={handleClockIn}
                  className="group relative size-36 rounded-full bg-linear-to-br from-primary to-primary/60 p-0.5 shadow-2xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 sm:size-48"
                >
                  <div className="flex size-full flex-col items-center justify-center rounded-full border-4 border-background/20">
                    <Play className="mb-1 size-10 fill-primary-foreground text-primary-foreground sm:size-12" />
                    <span className="text-xs font-black uppercase tracking-widest text-primary-foreground">
                      Clock In
                    </span>
                  </div>
                </button>
                <p className="text-xs italic text-muted-foreground">
                  Press to start your recording session
                </p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1">
                  <span className="size-2 animate-pulse rounded-full bg-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                    {isOnBreak ? "On Break" : "Working"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Clocked in at{" "}
                  <span className="text-foreground">
                    {clockInTime && formatTimeFromDate(clockInTime)}
                  </span>
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleToggleBreak}
                    className="gap-2 rounded-full px-6"
                  >
                    <Coffee className="size-3.5" />
                    {isOnBreak ? "End Break" : "Start Break"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={handleClockOut}
                    className="gap-2 rounded-full bg-destructive px-6 text-white hover:bg-destructive/80"
                  >
                    <Square className="size-3.5" />
                    Clock Out
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Session Log / Status */}
        <div className="mt-6 w-full rounded-2xl border border-border/10 bg-card/40 p-6 text-left">
          {!isActive && sessionEvents.length === 0 ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                  <Info className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="text-sm font-bold">Current Session</h4>
                  <p className="text-xs text-muted-foreground">
                    No session for today. Clock in to start tracking.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  <h4 className="text-sm font-bold">Today&apos;s Session</h4>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  {isActive ? "In Progress" : "Completed"}
                </span>
              </div>
              <div className="space-y-3">
                {sessionEvents.map((event, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-1.5 size-1.5 shrink-0 rounded-full",
                        event.type === "clock-in" && "bg-primary",
                        event.type === "break" && "bg-muted-foreground",
                        event.type === "clock-out" && "bg-destructive"
                      )}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold">{event.label}</p>
                        {event.duration && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {event.duration}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {event.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
