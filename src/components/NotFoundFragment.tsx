import { useMemo } from 'react'
import { mulberry32 } from '~/scenes/chain/geometry'

/** A floating, disconnected molecular fragment (SVG, no WebGL dependency) for the 404 page. */
export function NotFoundFragment() {
  const pts = useMemo(() => {
    const rnd = mulberry32(404)
    return Array.from({ length: 7 }, (_, i) => ({ x: 120 + i * 70 + (rnd() - 0.5) * 30, y: 200 + Math.sin(i * 1.7) * 60 + (rnd() - 0.5) * 30, r: 10 + rnd() * 10, c: ['#5FE3FF', '#F2EEE6', '#B9A2FF', '#9C9691'][i % 4] }))
  }, [])
  return (
    <svg className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[70vw] max-w-[900px] opacity-70 pointer-events-none" viewBox="0 0 700 400" aria-hidden>
      <g style={{ animation: 'fragFloat 9s ease-in-out infinite' }}>
        {pts.slice(0, 4).map((p, i) => i < 3 && <line key={i} x1={p.x} y1={p.y} x2={pts[i + 1].x} y2={pts[i + 1].y} stroke="#5FE3FF" strokeOpacity=".5" strokeWidth="6" strokeLinecap="round" />)}
        {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={p.c} fillOpacity={i > 3 ? 0.35 : 0.9} />)}
        <line x1={pts[3].x} y1={pts[3].y} x2={pts[4].x} y2={pts[4].y} stroke="#E5A03A" strokeOpacity=".7" strokeWidth="2" strokeDasharray="4 8" />
      </g>
      <style>{`@keyframes fragFloat { 0%,100% { transform: translateY(0) rotate(0deg) } 50% { transform: translateY(-14px) rotate(1.5deg) } }`}</style>
    </svg>
  )
}
