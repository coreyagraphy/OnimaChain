import { useEffect, useMemo, useState } from 'react'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, type SimulationNodeDatum, type SimulationLinkDatum } from 'd3-force'
import type { Claim } from '~/data/claims'
import { RELATIONSHIP_LABEL } from '~/data/claims'
import { STUDY_BY_PMID, pubmedUrl } from '~/data/studies'
import { PLATFORMS } from '~/data/signal'
import { SvgNode, LineageEdge, NodeCard, NODE_STYLE, type NodeKind } from './nodes'

interface GNode extends SimulationNodeDatum { id: string; kind: NodeKind; label: string; sub: string; hollow: boolean; href?: string; detail: string }
interface GLink extends SimulationLinkDatum<GNode> { rel: string; unresolved: boolean }

function build(claim: Claim): { nodes: GNode[]; links: GLink[] } {
  const nodes: GNode[] = [{ id: claim.id, kind: 'claim', label: claim.title, sub: claim.id, hollow: false, detail: 'Canonical claim. Status: tracked research claim. Not labelled true or false.' }]
  const links: GLink[] = []
  for (const s of claim.support) {
    const st = STUDY_BY_PMID[s.pmid]
    const ok = st?.status === 'verified'
    nodes.push({ id: s.pmid, kind: 'research', label: ok ? (st.title ?? '').slice(0, 58) + ((st.title ?? '').length > 58 ? '…' : '') : 'Unverified record', sub: ok ? `PMID ${s.pmid} · ${st.journal} ${st.year ?? ''}` : `PMID ${s.pmid}`, hollow: !ok, href: ok ? pubmedUrl(s.pmid) : undefined, detail: ok ? `${RELATIONSHIP_LABEL[s.relationship]}${s.basis ? ` — “${s.basis}”` : ' — the record discusses the theme but does not test the claim.'}` : 'Source relationship unresolved.' })
    links.push({ source: s.pmid, target: claim.id, rel: ok ? RELATIONSHIP_LABEL[s.relationship] : 'UNRESOLVED', unresolved: !ok || s.relationship === 'does_not_test' })
  }
  for (const p of PLATFORMS.slice(0, 4)) {
    nodes.push({ id: `platform-${p.id}`, kind: 'community', label: p.name, sub: 'No source access for this platform', hollow: true, detail: `Adapter: ${p.adapter}. ${p.state}. No mention is counted.` })
    links.push({ source: `platform-${p.id}`, target: claim.id, rel: 'NO ACCESS', unresolved: true })
  }
  for (const s of claim.contradictions) {
    nodes.push({ id: `c-${s.pmid}`, kind: 'contradiction', label: `PMID ${s.pmid}`, sub: 'contradicts', hollow: false, detail: s.basis ?? '' })
    links.push({ source: `c-${s.pmid}`, target: claim.id, rel: 'CONTRADICTS', unresolved: false })
  }
  return { nodes, links }
}

/** Claim Lineage: d3-force graph (desktop) + node cards (mobile / SSR). Every edge carries its relationship label. */
export function LineageGraph({ claim }: { claim: Claim }) {
  const data = useMemo(() => build(claim), [claim])
  const W = 900, H = 540
  const [pos, setPos] = useState<Array<{ x: number; y: number }> | null>(null)
  const [sel, setSel] = useState<GNode | null>(null)
  useEffect(() => {
    const nodes = data.nodes.map((n) => ({ ...n }))
    const links = data.links.map((l) => ({ ...l }))
    const sim = forceSimulation(nodes)
      .force('link', forceLink<GNode, GLink>(links).id((d) => d.id).distance((l) => ((l as GLink).unresolved ? 230 : 190)).strength(0.8))
      .force('charge', forceManyBody().strength(-760))
      .force('center', forceCenter(W / 2, H / 2))
      .force('collide', forceCollide(58))
      .stop()
    nodes[0].fx = W / 2
    nodes[0].fy = H / 2
    for (let i = 0; i < 260; i++) sim.tick()
    setPos(nodes.map((n) => ({ x: Math.max(40, Math.min(W - 40, n.x ?? 0)), y: Math.max(30, Math.min(H - 30, n.y ?? 0)) })))
  }, [data])
  const idx = Object.fromEntries(data.nodes.map((n, i) => [n.id, i]))
  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-5">
      <div className="panel-flat overflow-hidden hidden md:block">
        {pos ? (
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Claim lineage graph with ${data.nodes.length} nodes; see node cards for a text equivalent`}>
            <defs><radialGradient id="lg-bg" cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#5FE3FF" stopOpacity="0.05" /><stop offset="100%" stopColor="#5FE3FF" stopOpacity="0" /></radialGradient></defs>
            <rect width={W} height={H} fill="url(#lg-bg)" />
            {data.links.map((l, i) => {
              const s = pos[idx[typeof l.source === 'string' ? l.source : (l.source as GNode).id]]
              const t = pos[idx[typeof l.target === 'string' ? l.target : (l.target as GNode).id]]
              const kind = data.nodes[idx[typeof l.source === 'string' ? l.source : (l.source as GNode).id]].kind
              return <LineageEdge key={i} x1={s.x} y1={s.y} x2={t.x} y2={t.y} relationship={l.rel} unresolved={l.unresolved} color={NODE_STYLE[kind].color} />
            })}
            {data.nodes.map((n, i) => (
              <SvgNode key={n.id} kind={n.kind} x={pos[i].x} y={pos[i].y} r={n.kind === 'claim' ? 20 : 12} hollow={n.hollow} label={n.kind === 'claim' ? undefined : n.label.length > 26 ? n.label.slice(0, 26) + '…' : n.label} sublabel={n.kind === 'claim' ? undefined : n.sub.length > 30 ? n.sub.slice(0, 30) + '…' : n.sub} active={sel?.id === n.id} onClick={() => setSel(n)} />
            ))}
            <text x={pos[0].x} y={pos[0].y + 40} textAnchor="middle" fontSize={12} fontWeight={700} fill="#F2EEE6" fontFamily="Manrope Variable, sans-serif">{claim.title}</text>
          </svg>
        ) : <div className="h-[420px] flex items-center justify-center text-sm muted">Laying out lineage…</div>}
        <div className="flex flex-wrap gap-4 px-4 py-3 border-t hairline mono text-[10px] text-bone/55">
          {(Object.keys(NODE_STYLE) as NodeKind[]).map((k) => <span key={k} className="flex items-center gap-1.5"><span className="w-2 h-2" style={{ background: NODE_STYLE[k].color, borderRadius: NODE_STYLE[k].shape === 'circle' ? 99 : 0 }} />{NODE_STYLE[k].label}</span>)}
          <span>dashed = unresolved / no access</span>
        </div>
      </div>
      <aside className="grid gap-2 content-start" aria-label="Node inspector">
        {sel ? (
          <div className="panel p-4 fade-up">
            <p className="label" style={{ color: NODE_STYLE[sel.kind].color }}>{NODE_STYLE[sel.kind].label}</p>
            <p className="font-semibold mt-1 text-sm">{sel.label}</p>
            <p className="mono text-[11px] text-bone/50 mt-1">{sel.sub}</p>
            <p className="text-sm mt-3 text-bone/80">{sel.detail}</p>
            {sel.href && <a href={sel.href} target="_blank" rel="noreferrer noopener" className="btn btn-sm mt-3">Open source ↗</a>}
          </div>
        ) : <p className="text-sm muted hidden md:block">Select a node to inspect its provenance.</p>}
        <div className="grid gap-2 md:hidden">
          {data.nodes.map((n) => <NodeCard key={n.id} kind={n.kind} title={n.label} meta={n.sub} hollow={n.hollow} href={n.href} />)}
        </div>
      </aside>
    </div>
  )
}
