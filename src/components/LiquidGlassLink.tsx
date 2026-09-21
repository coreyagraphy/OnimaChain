import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'

/*
 * A lit, 3D "liquid glass" pill. The highlight inside follows the pointer (CSS variables only, no re-render),
 * a slow caustic swims under the surface, and the rim catches light. Reduced motion keeps the look, drops the motion.
 */
export function LiquidGlassLink({ to, children }: { to: '/explore'; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="liquid-glass"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
        e.currentTarget.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
        e.currentTarget.style.setProperty('--rx', `${(-((e.clientY - r.top) / r.height - 0.5) * 14).toFixed(2)}deg`)
        e.currentTarget.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width - 0.5) * 18).toFixed(2)}deg`)
      }}
      onPointerLeave={(e) => { for (const k of ['--mx', '--my', '--rx', '--ry']) e.currentTarget.style.removeProperty(k) }}
    >
      <span className="liquid-glass-caustic" aria-hidden />
      <span className="liquid-glass-shine" aria-hidden />
      <span className="liquid-glass-label">{children}</span>
    </Link>
  )
}
