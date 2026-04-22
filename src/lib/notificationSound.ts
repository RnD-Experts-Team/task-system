// src/lib/notificationSound.ts
// Plays a soft two-tone chime using the Web Audio API.
// No audio files required — the tone is synthesised in-browser.

let audioCtx: AudioContext | null = null

function getContext(): AudioContext | null {
  try {
    if (!audioCtx || audioCtx.state === "closed") {
      audioCtx = new AudioContext()
    }
    return audioCtx
  } catch {
    return null
  }
}

/**
 * Play a short notification chime.
 * Safe to call even before any user gesture — browsers will resume the
 * AudioContext automatically on the first interaction after it is created.
 */
export function playNotificationChime(): void {
  const ctx = getContext()
  if (!ctx) return

  const resume = () => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    // High note then lower note — classic "ding-dong" feel
    osc.type = "sine"
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    osc.frequency.setValueAtTime(660, ctx.currentTime + 0.18)

    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.01)
    gain.gain.setValueAtTime(0.25, ctx.currentTime + 0.17)
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.19)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.55)
  }

  if (ctx.state === "suspended") {
    ctx.resume().then(resume).catch(() => {})
  } else {
    resume()
  }
}
