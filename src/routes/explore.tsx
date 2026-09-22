import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { COMPOUNDS, displayName, type Compound } from '~/data/compounds'
import { DOMAINS, type DomainId } from '~/data/domains'
import { themeFor } from '~/data/commerce'
import { defaultVariantId } from '~/data/variants'
import { CompoundCard } from '~/components/CompoundCard'
import { StrengthPrice } from '~/components/StrengthPrice'
import { useCommerceStore } from '~/stores/commerce'
import { BRAND } from '~/brand'
import { structurePresentation } from '~/data/structure-presentation'
import { availableListingFor } from '~/data/research-entities'

const TOPIC_NAME = Object.fromEntries(DOMAINS.map((d) => [d.id, d.name])) as Record<DomainId, string>

export const Route = createFileRoute('/explore')({ validateSearch:(s:Record<string,unknown>):{ topic?: string }=>(typeof s.topic==='string' ? { topic: s.topic } : {}), head:()=>({meta:[{title:`Explore the molecular research library — ${BRAND}`}]}), component:Explore })
type Sort='alpha'|'length'; type View='grid'|'table'
type Scope = 'all' | 'available' | 'informational'

/*
 * The shop. Products are on screen immediately: a short title, then a slim sticky bar (search + topic + sort),
 * then the grid. The grid "pushes in" when the page opens or the filter changes, and cards fly in from depth
 * one after another; cards further down fly in as they scroll into view.
 */
function Explore(){
  const search=Route.useSearch()
  const [q,setQ]=useState(''),[domain,setDomain]=useState<DomainId|'all'>(DOMAINS.some(d=>d.id===search.topic)?(search.topic as DomainId):'all'),[sort,setSort]=useState<Sort>('alpha'),[view,setView]=useState<View>('grid'),[scope,setScope]=useState<Scope>('all')
  const grid=useRef<HTMLDivElement>(null)
  const rows=useMemo(()=>{
    const t=q.trim().toLowerCase()
    return COMPOUNDS.filter(c=>(scope==='all'||(scope==='available'?!!availableListingFor(c.slug):!availableListingFor(c.slug)))&&(domain==='all'||c.domain===domain)&&(!t||displayName(c).toLowerCase().includes(t)||c.aliases.some(a=>a.toLowerCase().includes(t))||c.tags.some(x=>x.includes(t)))).sort((a,b)=>sort==='alpha'?displayName(a).localeCompare(displayName(b)):(b.sequence?.length??0)-(a.sequence?.length??0))
  },[q,domain,sort,scope])
  const scene=`${scope}|${domain}|${sort}|${q.trim().toLowerCase()}`

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
      <header className="wrap shop-hero shop-hero-compact"><p className="label label-cyan">Research library · {COMPOUNDS.length} compounds</p><h1 className="display text-[clamp(2.2rem,6vw,4.6rem)] mt-2 leading-[0.95]">Explore the <span className="outline-word">collection.</span></h1><p className="muted mt-4 max-w-2xl">Profiles are informational unless a verified product listing and current inventory are shown. No inventory is currently verified.</p><div className="flex flex-wrap gap-2 mt-5" role="group" aria-label="Research library sections"><button className="btn btn-sm" aria-pressed={scope==='all'} onClick={()=>setScope('all')}>All research</button><button className="btn btn-sm" aria-pressed={scope==='available'} onClick={()=>setScope('available')}>Available</button><button className="btn btn-sm" aria-pressed={scope==='informational'} onClick={()=>setScope('informational')}>Informational</button><Link to="/watchlist" className="btn btn-sm">Watchlist</Link><Link to="/combinations" className="btn btn-sm">Stacks & combinations</Link></div></header>
      <div className="shop-bar" role="search">
        <div className="wrap shop-bar-inner">
          <label className="shop-search"><svg viewBox="0 0 24 24" aria-hidden><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><span className="sr-only">Search the collection</span><input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Search peptides…" enterKeyHint="search"/></label>
          <label className="shop-select"><span className="sr-only">Topic</span><select value={domain} onChange={e=>setDomain(e.target.value as DomainId|'all')}><option value="all">All topics</option>{DOMAINS.map(d=><option key={d.id} value={d.id}>{TOPIC_NAME[d.id]}</option>)}</select></label>
          <label className="shop-select"><span className="sr-only">Sort by</span><select value={sort} onChange={e=>setSort(e.target.value as Sort)}><option value="alpha">A–Z</option><option value="length">Longest first</option></select></label>
          <div className="shop-view" role="group" aria-label="View"><button aria-pressed={view==='grid'} onClick={()=>setView('grid')}>Grid</button><button aria-pressed={view==='table'} onClick={()=>setView('table')}>List</button></div>
        </div>
      </div>
      <section className="wrap">
        <p className="mt-4 mono text-[11px] text-bone/50" role="status">{rows.length} of {COMPOUNDS.length} profiles{domain!=='all'&&` · ${TOPIC_NAME[domain]}`}</p>
        {view==='grid'?<div ref={grid} key={scene} className="shop-grid mt-4 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{rows.map((c,i)=><div key={c.slug} className="shop-card" style={{'--i':Math.min(i,11)} as React.CSSProperties}><CompoundCard compound={c} index={i} fluid lively/></div>)}</div>:
        <div className="mt-6 panel-flat overflow-x-auto"><table className="data commerce-table"><thead><tr><th>Profile</th><th>Topic</th><th>Structure</th><th>Status</th><th/></tr></thead><tbody>{rows.map(c=><ProductRow key={c.slug} compound={c} />)}</tbody></table></div>}
        {rows.length===0&&<div className="panel p-10 mt-8 text-center"><h2 className="display-md text-2xl">{scope==='available'?'No verified available listings.':'No match yet.'}</h2><p className="muted text-sm mt-2">{scope==='available'?'This section opens only when specific product and lot inventory are verified.':'Try a different compound name, alternate name, or topic.'}</p></div>}
        <p className="text-[12px] muted mt-10">This library is for research and education. A profile does not imply that OnimaChain stocks or sells the substance.</p>
      </section>
    </div>
  )
}

function ProductRow({ compound: c }: { compound: Compound }) {
  const [variantId, setVariantId] = useState<string | null>(() => defaultVariantId(c.slug))
  const add = useCommerceStore((s) => s.add)
  const quick = useCommerceStore((s) => s.setQuickView)
  const theme = themeFor(c)
  const structure = structurePresentation(c)
  return <tr>
    <td><Link to="/compound/$slug" params={{ slug: c.slug }} className="font-semibold text-lg hover:text-cyan" style={{ color: theme.primary }}>{displayName(c)}</Link><span className="block text-[11px] muted capitalize">{c.tags.slice(0, 2).map((tag) => tag.replaceAll('-', ' ')).join(' · ')}</span></td>
    <td>{TOPIC_NAME[c.domain]}</td>
    <td className="mono">{structure.detail}</td>
    <td>{availableListingFor(c.slug) ? <StrengthPrice compound={c} value={variantId} onChange={setVariantId} compact /> : <span className="label label-cyan">Informational profile</span>}</td>
    <td><div className="flex gap-2 justify-end"><button className="btn btn-sm" onClick={() => quick(c.slug)}>Quick view</button>{availableListingFor(c.slug) ? <button className="btn btn-sm commerce-btn" onClick={() => add(c.slug, 1, variantId)}>Add to cart</button> : <Link to="/compound/$slug" params={{ slug: c.slug }} className="btn btn-sm">View research</Link>}</div></td>
  </tr>
}
