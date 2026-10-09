import { useEffect, useRef } from 'react'
import { tilt } from '~/motion/tilt'

/*
 * Site-wide depth: a fixed 2D canvas behind every page (z-index −1, no pointer events).
 * Three depth bands of glowing particles; nearer ones are bigger, brighter, and move more with scroll and tilt,
 * so the page reads as layered space instead of a flat dark background. A few near particles carry a glint.
 * Cheap on phones: pre-rendered sprites, additive blending, one canvas, no WebGL. Pauses in hidden tabs.
 * Reduced motion: one still frame, no drift, no parallax.
 */
const COLORS = ['#5FE3FF', '#AE66FF', '#8AEFFF', '#F2EEE6', '#4D8DFF']

interface P { x: number; y: number; z: number; r: number; c: number; ph: number; sp: number; vx: number; vy: number; glint: boolean }

function sprite(color: string, size: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.12, color)
  grad.addColorStop(0.4, color + '55')
  grad.addColorStop(1, color + '00')
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  return c
}

export function DepthBackdrop() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const mobile = window.innerWidth < 768
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5)
    const sprites = COLORS.map((c) => sprite(c, 64))
    const N = mobile ? 72 : 140
    let seed = 0x9e3779b1
    const rnd = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return ((seed >>> 0) % 100000) / 100000 }
    const ps: P[] = Array.from({ length: N }, () => {
      const z = Math.pow(rnd(), 1.8) * 0.9 + 0.1 // most particles far, a few near
      return { x: rnd(), y: rnd() * 1.6, z, r: 1.6 + z * z * 22, c: Math.floor(rnd() * COLORS.length), ph: rnd() * 6.28, sp: 0.6 + rnd() * 1.8, vx: (rnd() - 0.5) * 0.012, vy: (rnd() - 0.5) * 0.01, glint: z > 0.6 && rnd() < 0.45 }
    })
    let W = 0, H = 0
    const resize = () => { W = window.innerWidth; H = window.innerHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.width = W + 'px'; cv.style.height = H + 'px' }
    resize()
    window.addEventListener('resize', resize)
    let raf = 0, last = performance.now(), lastPaint = 0, t = 0
    const tx = { x: 0, y: 0 }
    const draw = (now: number) => {
      // The particles drift slowly; drawing them at 25–30 fps is visually smooth
      // while leaving the main thread and GPU available for the active lesson.
      if (!reduced && now - lastPaint < (mobile ? 40 : 33)) {
        raf = requestAnimationFrame(draw)
        return
      }
      lastPaint = now
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt
      tx.x += (tilt.x - tx.x) * Math.min(1, dt * 3)
      tx.y += (tilt.y - tx.y) * Math.min(1, dt * 3)
      const sy = window.scrollY
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'
      const span = H * 1.6
      for (const p of ps) {
        if (!reduced) { p.x = (p.x + p.vx * dt + 1) % 1; p.y = (p.y + p.vy * dt + 1.6) % 1.6 }
        // parallax: near bands move farther per scrolled pixel and per degree of tilt
        const px = p.x * W + (reduced ? 0 : tx.x * p.z * 60)
        let py = p.y * H - (reduced ? 0 : sy * p.z * 0.45) + (reduced ? 0 : tx.y * p.z * 40)
        py = ((py % span) + span) % span - H * 0.3
        if (py < -40 || py > H + 40) continue
        const tw = reduced ? 1 : 0.55 + 0.45 * Math.sin(t * p.sp + p.ph)
        const r = p.r * (0.85 + 0.15 * tw)
        ctx.globalAlpha = Math.min(1, (0.3 + p.z * 0.9) * tw)
        ctx.drawImage(sprites[p.c], px - r, py - r, r * 2, r * 2)
        if (p.glint) {
          ctx.globalAlpha = 0.5 * tw * p.z
          ctx.fillStyle = COLORS[p.c]
          ctx.fillRect(px - r * 1.6, py - 0.5, r * 3.2, 1)
          ctx.fillRect(px - 0.5, py - r * 1.6, 1, r * 3.2)
        }
      }
      ctx.globalAlpha = 1
      if (!reduced) raf = requestAnimationFrame(draw)
    }
    const start = () => { cancelAnimationFrame(raf); last = performance.now(); raf = requestAnimationFrame(draw) }
    const onVis = () => { if (document.visibilityState === 'hidden') cancelAnimationFrame(raf); else start() }
    document.addEventListener('visibilitychange', onVis)
    start()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); document.removeEventListener('visibilitychange', onVis) }
  }, [])
  return <canvas ref={ref} className="depth-backdrop" aria-hidden />
}
