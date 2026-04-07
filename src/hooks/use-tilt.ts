import { useRef, useState, useCallback, useEffect, type RefObject } from "react"

type TiltState = {
  rotateX: number
  rotateY: number
  scale: number
  shadow: string
}

const REST_STATE: TiltState = {
  rotateX: 0,
  rotateY: 0,
  scale: 1,
  shadow: "0 0 0 rgba(0,0,0,0)",
}

type UseTiltOptions = {
  maxTilt?: number
  scale?: number
  speed?: number
  perspective?: number
}

export function useTilt<T extends HTMLElement = HTMLDivElement>(
  options: UseTiltOptions = {}
): {
  ref: RefObject<T | null>
  style: React.CSSProperties
  isHovered: boolean
} {
  const { maxTilt = 6, scale = 1.02, speed = 400, perspective = 1000 } = options
  const ref = useRef<T | null>(null)
  const [state, setState] = useState<TiltState>(REST_STATE)
  const [isHovered, setIsHovered] = useState(false)
  const [prefersReduced, setPrefersReduced] = useState(false)
  const raf = useRef<number>(0)

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (prefersReduced) return
      const el = ref.current
      if (!el) return

      cancelAnimationFrame(raf.current)
      raf.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        const rotateX = (0.5 - y) * maxTilt * 2
        const rotateY = (x - 0.5) * maxTilt * 2

        setState({
          rotateX,
          rotateY,
          scale,
          shadow: `${rotateY * -0.5}px ${rotateX * 0.5}px 20px rgba(0,0,0,0.12)`,
        })
      })
    },
    [maxTilt, scale, prefersReduced]
  )

  const handleMouseEnter = useCallback(() => setIsHovered(true), [])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
    cancelAnimationFrame(raf.current)
    setState(REST_STATE)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    el.addEventListener("mousemove", handleMouseMove)
    el.addEventListener("mouseenter", handleMouseEnter)
    el.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      el.removeEventListener("mousemove", handleMouseMove)
      el.removeEventListener("mouseenter", handleMouseEnter)
      el.removeEventListener("mouseleave", handleMouseLeave)
      cancelAnimationFrame(raf.current)
    }
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave])

  const style: React.CSSProperties = prefersReduced
    ? {}
    : {
        transform: `perspective(${perspective}px) rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg) scale3d(${state.scale}, ${state.scale}, ${state.scale})`,
        transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99), box-shadow ${speed}ms ease`,
        boxShadow: state.shadow,
        willChange: "transform",
      }

  return { ref, style, isHovered }
}
