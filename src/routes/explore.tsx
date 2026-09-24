import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { COMPOUNDS, displayName, type Compound } from '~/data/compounds'
import { DOMAINS, type DomainId } from '~/data/domains'
import { themeFor } from '~/data/commerce'
import { CompoundCard } from '~/components/CompoundCard'
import { useReaderStore } from '~/stores/reader'
import { BRAND } from '~/brand'
import { structurePresentation } from '~/data/structure-presentation'

const TOPIC_NAME = Object.fromEntries(DOMAINS.map((d) => [d.id, d.name])) as Record<DomainId, string>

export const Route = createFileRoute('/explore')({ validateSearch:(s:Record<string,unknown>):{ topic?: string }=>(typeof s.topic==='string' ? { topic: s.topic } : {}), head:()=>({meta:[{title:`Research library — ${BRAND}`},{ name:'description', content:'Browse molecule identity records by name or scientific subject. Each profile separates citation metadata from scientific review.' }]}), component:Explore })
type Sort='alpha'|'length'; type View='grid'|'table'

/*
 * The research library. Records are on screen immediately: a short title, then a slim sticky bar (search + topic + sort),
 * then the grid. The grid "pushes in" when the page opens or the filter changes, and cards fly in from depth
 * one after another; cards further down fly in as they scroll into view.
 */
function Explore(){
  const search=Route.useSearch()
  const [q,setQ]=useState(''),[domain,setDomain]=useState<DomainId|'all'>(DOMAINS.some(d=>d.id===search.topic)?(search.topic as DomainId):'all'),[sort,setSort]=useState<Sort>('alpha'),[view,setView]=useState<View>('grid')
  const grid=useRef<HTMLDivElement>(null)
  const rows=useMemo(()=>{
    const t=q.trim().toLowerCase()
    return COMPOUNDS.filter(c=>(domain==='all'||c.domain===domain)&&(!t||displayName(c).toLowerCase().includes(t)||c.aliases.some(a=>a.toLowerCase().includes(t))||c.tags.some(x=>x.includes(t)))).sort((a,b)=>sort==='alpha'?displayName(a).localeCompare(displayName(b)):(b.sequence?.length??0)-(a.sequence?.length??0))
  },[q,domain,sort])
  const scene=`${domain}|${sort}|${q.trim().toLowerCase()}`

  // fly-in for every card as it enters the screen
  useEffect(()=>{
    const el=grid.current
    if(!el||typeof IntersectionObserver==='undefined') return
    const io=new IntersectionObserver((es)=>{ for(const e of es) if(e.isIntersecting){ (e.target as HTMLElement).dataset.in='1'; io.unobserve(e.target) } },{rootMargin:'0px 0px -6% 0px',threshold:0.05})
    el.querySelectorAll<HTMLElement>('.shop-card').forEach((c)=>io.observe(c))
    return ()=>io.disconnect()
  },[scene,view])

  return (
    <div className="pt-24 pb-20">
      <header className="wrap shop-hero shop-hero-compact"><p className="label label-cyan">Research library · {COMPOUNDS.length} identity records</p><h1 className="display text-[clamp(2.2rem,6vw,4.6rem)] mt-2 leading-[0.95]">Explore the <span className="outline-word">molecules.</span></h1><p className="lede mt-5 max-w-3xl">Browse by name or scientific subject. Each profile shows the sources attached to that record and the limits of our review. A profile is not a product listing or recommendation.</p></header>
      <div className="shop-bar" role="search">
        <div className="wrap shop-bar-inner">
          <label className="shop-search"><svg viewBox="0 0 24 24" aria-hidden><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><span className="sr-only">Search the research library</span><input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search names and aliases…" enterKeyHint="search"/></label>
          <label className="shop-select"><span className="sr-only">Topic</span><select value={domain} onChange={e=>setDomain(e.target.value as DomainId|'all')}><option value="all">All topics</option>{DOMAINS.map(d=><option key={d.id} value={d.id}>{TOPIC_NAME[d.id]}</option>)}</select></label>
          <label className="shop-select"><span className="sr-only">Sort by</span><select value={sort} onChange={e=>setSort(e.target.value as Sort)}><option value="alpha">A–Z</option><option value="length">Longest first</option></select></label>
          <div className="shop-view" role="group" aria-label="View"><button aria-pressed={view==='grid'} onClick={()=>setView('grid')}>Grid</button><button aria-pressed={view==='table'} onClick={()=>setView('table')}>List</button></div>
        </div>
      </div>
      <section className="wrap">
        <p className="mt-4 mono text-[11px] text-bone/50" role="status">{rows.length} of {COMPOUNDS.length} records{domain!=='all'&&` · ${TOPIC_NAME[domain]}`}</p>
        {view==='grid'?<div ref={grid} key={scene} className="shop-grid mt-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{rows.map((c,i)=><div key={c.slug} className="shop-card" style={{'--i':Math.min(i,11)} as React.CSSProperties}><CompoundCard compound={c} index={i} fluid/></div>)}</div>:
        <div className="mt-6 panel-flat overflow-x-auto"><table className="data commerce-table"><thead><tr><th>Molecule record</th><th>Subject</th><th>Structure</th><th>Review state</th><th/></tr></thead><tbody>{rows.map(c=><ProductRow key={c.slug} compound={c} />)}</tbody></table></div>}
        {rows.length===0&&<div className="panel p-10 mt-8 text-center"><h2 className="display-md text-2xl">No match yet.</h2><p className="muted text-sm mt-2">Try a different name, alias, or subject.</p></div>}
        <p className="text-[12px] muted mt-10">Identity and citation records do not establish a clinical benefit. Outcome summaries remain withheld until claim-level review.</p>
      </section>
    </div>
  )
}

function ProductRow({ compound: c }: { compound: Compound }) {
  const quick = useReaderStore((s) => s.setQuickView)
  const theme = themeFor(c)
  const structure = structurePresentation(c)
  return <tr>
    <td><Link to="/compound/$slug" params={{ slug: c.slug }} className="font-semibold text-lg hover:text-cyan" style={{ color: theme.primary }}>{displayName(c)}</Link></td>
    <td>{TOPIC_NAME[c.domain]}</td>
    <td className="mono">{structure.detail}</td>
    <td>Summary review pending</td>
    <td><div className="flex gap-2 justify-end"><button className="btn btn-sm" onClick={() => quick(c.slug)}>Inspect model</button><Link to="/compound/$slug" params={{ slug: c.slug }} className="btn btn-sm commerce-btn">View sources</Link></div></td>
  </tr>
}
