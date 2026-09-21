import type { ReactNode } from 'react'

/*
 * Graph node primitives. Each renders both as an SVG symbol (inside a lineage graph) and as a DOM card
 * (mobile "scrollable node cards", SSR fallback). Shape AND colour differ per type so colour is never the only cue.
 */
export type NodeKind = 'research' | 'claim' | 'community' | 'regulatory' | 'contradiction'

export const NODE_STYLE: Record<NodeKind, { color: string; label: string; shape: 'circle' | 'diamond' | 'hexagon' | 'square' | 'triangle' }> = {
  research: { color: '#5FE3FF', label: 'Research', shape: 'circle' },
  claim: { color: '#F2EEE6', label: 'Claim', shape: 'diamond' },
  community: { color: '#8A63FF', label: 'Community', shape: 'hexagon' },
  regulatory: { color: '#8FB0FF', label: 'Regulatory', shape: 'square' },
  contradiction: { color: '#E5A03A', label: 'Contradiction', shape: 'triangle' },
}

export function shapePath(shape: (typeof NODE_STYLE)[NodeKind]['shape'], r: number): string {
  switch (shape) {
    case 'circle':
      return `M ${-r} 0 a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`
    case 'diamond':
      return `M 0 ${-r} L ${r} 0 L 0 ${r} L ${-r} 0 Z`
    case 'hexagon': {
      const pts = Array.from({ length: 6 }, (_, i) => { const a = (Math.PI / 3) * i; return `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}` })
      return `M ${pts.join(' L ')} Z`
    }
    case 'square':
      return `M ${-r * 0.85} ${-r * 0.85} h ${r * 1.7} v ${r * 1.7} h ${-r * 1.7} Z`
    case 'triangle':
      return `M 0 ${-r} L ${r} ${r * 0.8} L ${-r} ${r * 0.8} Z`
  }
}

interface SvgNodeProps {
  kind: NodeKind
  x: number
  y: number
  r?: number
  hollow?: boolean
  label?: string
  sublabel?: string
  active?: boolean
  onClick?: () => void
}

export function SvgNode({ kind, x, y, r = 14, hollow = false, label, sublabel, active = false, onClick }: SvgNodeProps) {
  const s = NODE_STYLE[kind]
  return (
    <g transform={`translate(${x} ${y})`} style={{ cursor: onClick ? 'pointer' : 'default' }} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      {active && <path d={shapePath(s.shape, r + 7)} fill="none" stroke={s.color} strokeOpacity={0.35} strokeWidth={1} />}
      <path d={shapePath(s.shape, r)} fill={hollow ? 'transparent' : s.color} fillOpacity={hollow ? 0 : kind === 'claim' ? 0.95 : 0.85} stroke={s.color} strokeWidth={hollow ? 1.2 : 1} strokeDasharray={hollow ? '3 3' : undefined} />
      {label && (
        <text x={r + 10} y={4} fill="#F2EEE6" fontSize={12} fontFamily="Inter Variable, sans-serif" fontWeight={600}>
          {label}
        </text>
      )}
      {sublabel && (
        <text x={r + 10} y={19} fill="#F2EEE6" fillOpacity={0.55} fontSize={10.5} fontFamily="JetBrains Mono Variable, monospace">
          {sublabel}
        </text>
      )}
    </g>
  )
}

interface CardProps { kind: NodeKind; title: string; meta?: ReactNode; hollow?: boolean; children?: ReactNode; href?: string }

/** DOM node card (mobile inspector / SSR). */
export function NodeCard({ kind, title, meta, hollow, children, href }: CardProps) {
  const s = NODE_STYLE[kind]
  const body = (
    <div className={`panel p-4 flex gap-3 items-start ${hollow ? 'border-dashed' : ''}`} style={{ borderColor: `${s.color}33` }}>
      <svg width="28" height="28" viewBox="-16 -16 32 32" aria-hidden>
        <path d={shapePath(s.shape, 12)} fill={hollow ? 'transparent' : s.color} stroke={s.color} strokeWidth={1.2} strokeDasharray={hollow ? '3 3' : undefined} />
      </svg>
      <div className="min-w-0">
        <p className="label" style={{ color: s.color }}>{s.label}</p>
        <p className="text-sm font-semibold mt-0.5 text-bone/90">{title}</p>
        {meta && <div className="mt-1 text-xs muted">{meta}</div>}
        {children}
      </div>
    </div>
  )
  return href ? <a href={href} target="_blank" rel="noreferrer noopener">{body}</a> : body
}

export const ResearchNode = (p: Omit<SvgNodeProps, 'kind'>) => <SvgNode kind="research" {...p} />
export const ClaimNode = (p: Omit<SvgNodeProps, 'kind'>) => <SvgNode kind="claim" {...p} />
export const CommunityNode = (p: Omit<SvgNodeProps, 'kind'>) => <SvgNode kind="community" {...p} />
export const RegulatoryNode = (p: Omit<SvgNodeProps, 'kind'>) => <SvgNode kind="regulatory" {...p} />
export const ContradictionNode = (p: Omit<SvgNodeProps, 'kind'>) => <SvgNode kind="contradiction" {...p} />

interface EdgeProps {
  x1: number; y1: number; x2: number; y2: number
  relationship?: string
  unresolved?: boolean
  color?: string
  lit?: boolean
}

/** LineageEdge: a relationship with provenance. Unresolved edges are dashed and labelled. */
export function LineageEdge({ x1, y1, x2, y2, relationship, unresolved = false, color = '#5FE3FF', lit = true }: EdgeProps) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeOpacity={lit ? (unresolved ? 0.35 : 0.6) : 0.15} strokeWidth={unresolved ? 1 : 1.4} strokeDasharray={unresolved ? '4 4' : undefined} />
      {relationship && (
        <text x={mx} y={my - 6} textAnchor="middle" fill={color} fillOpacity={0.8} fontSize={9.5} fontFamily="JetBrains Mono Variable, monospace" letterSpacing="0.08em">
          {relationship}
        </text>
      )}
    </g>
  )
}
