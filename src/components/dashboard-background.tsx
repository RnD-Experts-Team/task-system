/**
 * Multi-layered dashboard background with glassmorphism depth system.
 *
 * Layer 1 – Base gradient (via CSS class `dashboard-bg`)
 * Layer 2 – Floating gradient blobs (mid-layer depth)
 * Layer 3 – Noise texture overlay
 * Layer 4 – Vignette edge darkening
 *
 * All layers are fixed, non-interactive, and sit behind content (z-0).
 */
export function DashboardBackground() {
  return (
    <div
      aria-hidden
      className="dashboard-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Mid-layer: floating gradient blobs */}
      <div className="glass-blob glass-blob--primary animate-pulse" style={{ animationDuration: "8s" }} />
      <div className="glass-blob glass-blob--secondary animate-pulse" style={{ animationDuration: "12s" }} />
      <div className="glass-blob glass-blob--accent animate-pulse" style={{ animationDuration: "10s" }} />

      {/* Noise grain texture */}
      <div className="noise-overlay" />

      {/* Vignette: soft edge darkening */}
      <div className="vignette-overlay" />
    </div>
  )
}
