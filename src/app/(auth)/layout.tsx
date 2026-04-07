import { Outlet } from "react-router"

export default function AuthLayout() {
  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.35_0.15_25)_0%,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,oklch(0.25_0.10_20)_0%,transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 backdrop-blur-[1px]" />
      <div className="relative z-10 w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
