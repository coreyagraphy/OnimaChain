import { useEffect, useMemo, useRef, useState } from 'react'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide, type SimulationNodeDatum, type SimulationLinkDatum } from 'd3-force'
import type { Claim } from '~/data/claims'
import { RELATIONSHIP_LABEL } from '~/data/claims'
import { STUDY_BY_PMID, pubmedUrl } from '~/data/studies'
import { PLATFORMS } from '~/data/signal'
import { SvgNode, LineageEdge, NodeCard, NODE_STYLE, type NodeKind } from './nodes'
import { gsap } from '~/motion/timeline'

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

const srcId = (l: GLink) => (typeof l.source === 'string' ? l.source : (l.source as GNode).id)
const tgtId = (l: GLink) => (typeof l.target === 'string' ? l.target : (l.target as GNode).id)

/**
 * Claim Lineage: d3-force graph (desktop) + node cards (mobile / SSR). Every edge carries its relationship label.
 * When the graph enters the viewport the trace plays: source records activate → their edges illuminate →
 * the claim resolves → community branches reach outward (dashed: no access). Replayable.
 */
export function LineageGraph({ claim }: { claim: Claim }) {
  const data = useMemo(() => build(claim), [claim])
  const W = 900, H = 540
  const [pos, setPos] = useState<Array<{ x: number; y: number }> | null>(null)
  const [sel, setSel] = useState<GNode | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const svg = useRef<SVGSVGElement>(null)
  const played = useRef(false)

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

  const trace = () => {
    const el = svg.current
    if (!el) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const research = el.querySelectorAll('[data-n="research"], [data-n="contradiction"]')
    const resolvedEdges = el.querySelectorAll('[data-e="resolved"] line')
    const unresolvedEdges = el.querySelectorAll('[data-e="unresolved"] line, [data-e] text')
    const claimNode = el.querySelector('[data-n="claim"]')
    const community = el.querySelectorAll('[data-n="community"]')
    if (reduced) {
      gsap.set([research, claimNode, community], { opacity: 1 })
      gsap.set(resolvedEdges, { strokeDashoffset: 0 })
      gsap.set(unresolvedEdges, { opacity: 1 })
      return
    }
    gsap.killTweensOf([research, resolvedEdges, unresolvedEdges, claimNode, community])
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })
    tl.set([research, claimNode, community], { opacity: 0 })
      .set(resolvedEdges, { strokeDasharray: 1, strokeDashoffset: 1 })
      .set(unresolvedEdges, { opacity: 0 })
      .to(research, { opacity: 1, duration: 0.6, stagger: 0.12 })
      .to(resolvedEdges, { strokeDashoffset: 0, duration: 0.9, stagger: 0.1, ease: 'power2.inOut' }, '-=0.2')
      .to(claimNode, { opacity: 1, duration: 0.7 }, '-=0.3')
      .to(unresolvedEdges, { opacity: 1, duration: 0.7, stagger: 0.06 }, '-=0.2')
      .to(community, { opacity: 1, duration: 0.6, stagger: 0.1 }, '-=0.5')
  }

  useEffect(() => {
    if (!pos || !svg.current) return
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && !played.current) { played.current = true; trace() }
    }, { threshold: 0.35 })
    io.observe(svg.current)
    return () => io.disconnect()
  }, [pos]) // eslint-disable-line react-hooks/exhaustive-deps

  const idx = Object.fromEntries(data.nodes.map((n, i) => [n.id, i]))
  const lit = (id: string) => {
    if (!hover && !sel) return true
    const focus = hover ?? sel?.id
    if (id === focus) return true
    return data.links.some((l) => (srcId(l) === focus && tgtId(l) === id) || (tgtId(l) === focus && srcId(l) === id))
  }

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-5">
      <div className="panel-flat overflow-hidden hidden md:block relative">
        {pos ? (
          <svg ref={svg} viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Claim lineage graph with ${data.nodes.length} nodes; see node cards for a text equivalent`}>
            <defs>
              <radialGradient id="lg-bg" cx="50%" cy="50%" r="60%"><stop offset="0%" stopColor="#5FE3FF" stopOpacity="0.06" /><stop offset="100%" stopColor="#5FE3FF" stopOpacity="0" /></radialGradient>
              <filter id="lg-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <rect width={W} height={H} fill="url(#lg-bg)" />
            {data.links.map((l, i) => {
              const s = pos[idx[srcId(l)]]
              const t = pos[idx[tgtId(l)]]
              const kind = data.nodes[idx[srcId(l)]].kind
              const on = lit(srcId(l)) && lit(tgtId(l))
              return (
                <g key={i} data-e={l.unresolved ? 'unresolved' : 'resolved'} style={{ transition: 'opacity .4s', opacity: on ? 1 : 0.25 }}>
                  <LineageEdge x1={s.x} y1={s.y} x2={t.x} y2={t.y} relationship={l.rel} unresolved={l.unresolved} color={NODE_STYLE[kind].color} />
                </g>
              )
            })}
            {data.nodes.map((n, i) => {
              const on = lit(n.id)
              const active = sel?.id === n.id || hover === n.id
              return (
                <g key={n.id} data-n={n.kind} style={{ transition: 'opacity .4s', opacity: on ? 1 : 0.3 }} filter={active ? 'url(#lg-glow)' : undefined} onPointerEnter={() => setHover(n.id)} onPointerLeave={() => setHover(null)}>
                  <SvgNode kind={n.kind} x={pos[i].x} y={pos[i].y} r={(n.kind === 'claim' ? 20 : 12) * (active ? 1.15 : 1)} hollow={n.hollow} label={n.kind === 'claim' ? undefined : n.label.length > 26 ? n.label.slice(0, 26) + '…' : n.label} sublabel={n.kind === 'claim' ? undefined : n.sub.length > 30 ? n.sub.slice(0, 30) + '…' : n.sub} active={active} onClick={() => setSel(n)} />
                </g>
              )
            })}
            <text x={pos[0].x} y={pos[0].y + 40} textAnchor="middle" fontSize={12} fontWeight={700} fill="#F2EEE6" fontFamily="Manrope Variable, sans-serif">{claim.title}</text>
          </svg>
        ) : <div className="h-[420px] flex items-center justify-center text-sm muted">Laying out lineage…</div>}
        <div className="flex flex-wrap gap-4 px-4 py-3 border-t hairline mono text-[10px] text-bone/55 items-center">
          {(Object.keys(NODE_STYLE) as NodeKind[]).map((k) => <span key={k} className="flex items-center gap-1.5"><span className="w-2 h-2" style={{ background: NODE_STYLE[k].color, borderRadius: NODE_STYLE[k].shape === 'circle' ? 99 : 0 }} />{NODE_STYLE[k].label}</span>)}
          <span>dashed = unresolved / no access</span>
          <button className="btn btn-sm ml-auto" onClick={trace}>Replay trace</button>
        </div>
      </div>
      <aside className="grid gap-2 content-start" aria-label="Node inspector">
        {sel ? (
          <div className="panel glass relative p-4 fade-up">
            <p className="label" style={{ color: NODE_STYLE[sel.kind].color }}>{NODE_STYLE[sel.kind].label}</p>
            <p className="font-semibold mt-1 text-sm">{sel.label}</p>
            <p className="mono text-[11px] text-bone/50 mt-1">{sel.sub}</p>
            <p className="text-sm mt-3 text-bone/80">{sel.detail}</p>
            {sel.href && <a href={sel.href} target="_blank" rel="noreferrer noopener" className="btn btn-sm mt-3">Open source ↗</a>}
          </div>
        ) : <p className="text-sm muted hidden md:block">Select a node to inspect its provenance. Hover to isolate its relationships.</p>}
        <div className="grid gap-2 md:hidden">
          {data.nodes.map((n) => <NodeCard key={n.id} kind={n.kind} title={n.label} meta={n.sub} hollow={n.hollow} href={n.href} />)}
        </div>
      </aside>
    </div>
  )
}
