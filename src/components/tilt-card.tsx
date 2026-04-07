import { Card } from "@/components/ui/card"
import { useTilt } from "@/hooks/use-tilt"
import { cn } from "@/lib/utils"

type TiltCardProps = React.ComponentProps<typeof Card> & {
  maxTilt?: number
  tiltScale?: number
}

export function TiltCard({ maxTilt = 5, tiltScale = 1.015, className, children, ...props }: TiltCardProps) {
  const { ref, style } = useTilt<HTMLDivElement>({ maxTilt, scale: tiltScale })

  return (
    <Card ref={ref} style={style} className={cn(className)} {...props}>
      {children}
    </Card>
  )
}
