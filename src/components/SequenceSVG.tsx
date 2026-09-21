import { useMemo } from 'react'
import { CLASS_COLORS, sizeRadius, type ChainGeometry } from '~/scenes/chain/geometry'

interface Props {
  geometry: ChainGeometry
  tint?: string
  className?: string
  /** Fraction of residues shown (for scroll-tied static fallback). */
  progress?: number
  label?: boolean
}

/** Rotate + orthographic-project Cα points into 2D. Same axis swap as ChainRenderer (helix axis → screen x), then a 22°/18° tilt. */
export function projectChain(geometry: ChainGeometry): { pts: [number, number, number][]; minX: number; minY: number; w: number; h: number } {
  const ax = (22 * Math.PI) / 180
  const ay = (18 * Math.PI) / 180
  const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay)
  const [ccx, ccy, ccz] = geometry.bounds.center
  const pts: [number, number, number][] = []
  for (let i = 0; i < geometry.length; i++) {
    // axis swap: local (x, y, z) → (z, y, -x)
    let x = geometry.ca[i * 3 + 2] - ccz
    let y = geometry.ca[i * 3 + 1] - ccy
    let z = -(geometry.ca[i * 3] - ccx)
    // rotate around X
    const y1 = y * cx - z * sx
    const z1 = y * sx + z * cx
    y = y1; z = z1
    // rotate around Y
    const x2 = x * cy + z * sy
    const z2 = -x * sy + z * cy
    x = x2; z = z2
    pts.push([x, -y, z])
  }
  const r = geometry.bounds.radius
  return { pts, minX: -r, minY: -r, w: r * 2, h: r * 2 }
}

function projectPoint(geometry: ChainGeometry, p: [number, number, number]): [number, number] {
  const q = projectChain({ ...geometry, ca: new Float32Array(p), length: 1 })
  return [q.pts[0][0], q.pts[0][1]]
}

export function SequenceSVG({ geometry, tint = "#5FE3FF", className, progress = 1, label }: Props) {
  const { pts, minX, minY, w, h } = useMemo(() => projectChain(geometry), [geometry])
  const shown = Math.max(0, Math.min(geometry.length, Math.round(progress * geometry.length)))
  const order = pts.map((p, i) => i).sort((a, b) => pts[a][2] - pts[b][2]) // back-to-front
  const path = pts.slice(0, shown).map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' ')
  const ph = geometry.placeholder
  return (
    <svg
      viewBox={`${minX} ${minY} ${w} ${h}`}
      className={className}
      role="img"
      aria-label={ph ? 'Sequence pending verification' : `Static backbone diagram of ${geometry.slug}, ${geometry.length} residues`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id={`g-${geometry.slug}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={tint} stopOpacity="0.18" />
          <stop offset="100%" stopColor={tint} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={minX} y={minY} width={w} height={h} fill={`url(#g-${geometry.slug})`} />
      {path && (
        <path
          d={path}
          fill="none"
          stroke={tint}
          strokeWidth={ph ? 0.5 : 0.9}
          strokeOpacity={ph ? 0.35 : 0.85}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={ph ? '1.2 1.6' : undefined}
        />
      )}
      {geometry.bridges.map((b) => (
        <path
          key={`b${b.from}`}
          d={`M${pts[b.from][0]} ${pts[b.from][1]} Q${projectPoint(geometry, b.points[1]).join(' ')} ${pts[b.to][0]} ${pts[b.to][1]}`}
          fill="none"
          stroke="#8A63FF"
          strokeWidth={0.6}
          strokeOpacity={0.9}
        />
      ))}
      {!ph &&
        order.map((i) => {
          if (i >= shown) return null
          const r = geometry.residues[i]
          const p = pts[i]
          const depth = (p[2] + geometry.bounds.radius) / (geometry.bounds.radius * 2)
          const rad = sizeRadius(r.size) * (0.7 + depth * 0.5)
          return (
            <g key={i}>
              <circle cx={p[0]} cy={p[1]} r={rad} fill={CLASS_COLORS[r.cls]} fillOpacity={0.55 + depth * 0.45} />
              {r.chirality === 'D' && (
                <circle cx={p[0]} cy={p[1]} r={rad + 0.7} fill="none" stroke="#5FE3FF" strokeWidth={0.35} />
              )}
              {label && (
                <text x={p[0]} y={p[1] + 0.4} fontSize={1.4} textAnchor="middle" fill="#0A0B0E" fontFamily="Inter, sans-serif">
                  {r.code}
                </text>
              )}
            </g>
          )
        })}
      {geometry.metal && (
        <g>
          {geometry.metal.residues.map((ri) => (
            <line key={ri} x1={pts[ri][0]} y1={pts[ri][1]} x2={projectPoint(geometry, geometry.metal!.position)[0]} y2={projectPoint(geometry, geometry.metal!.position)[1]} stroke="#8A63FF" strokeWidth={0.3} strokeOpacity={0.8} />
          ))}
          <circle cx={projectPoint(geometry, geometry.metal.position)[0]} cy={projectPoint(geometry, geometry.metal.position)[1]} r={1.4} fill="#8A63FF" />
        </g>
      )}
      {ph && (
        <text x={0} y={geometry.bounds.radius * 0.9} fontSize={geometry.bounds.radius * 0.11} textAnchor="middle" fill="#5FE3FF" fillOpacity={0.8} fontFamily="Inter, sans-serif" letterSpacing="0.15em">
          SEQUENCE PENDING VERIFICATION
        </text>
      )}
    </svg>
  )
}
