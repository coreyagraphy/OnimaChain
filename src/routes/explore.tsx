import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { COMPOUNDS, displayName } from '~/data/compounds'
import { DOMAINS, type DomainId } from '~/data/domains'
import { PRICE_PLACEHOLDER, themeFor } from '~/data/commerce'
import { CompoundCard } from '~/components/CompoundCard'
import { useCommerceStore } from '~/stores/commerce'
import { BRAND } from '~/brand'

const TOPIC_NAME: Record<DomainId, string> = { repair:'Recovery', metabolic:'Metabolism', somatotropic:'Growth signals', dermal:'Skin & hair', cognitive:'Brain & focus', longevity:'Cell energy', immune:'Immune response' }

export const Route = createFileRoute('/explore')({ head:()=>({meta:[{title:`Shop the molecular collection — ${BRAND}`}]}), component:Explore })
type Sort='alpha'|'length'; type View='grid'|'table'

function Explore(){
  const [q,setQ]=useState(''),[domain,setDomain]=useState<DomainId|'all'>('all'),[sort,setSort]=useState<Sort>('alpha'),[view,setView]=useState<View>('grid')
  const add=useCommerceStore((s)=>s.add), quick=useCommerceStore((s)=>s.setQuickView)
  const rows=useMemo(()=>{
    const t=q.trim().toLowerCase()
    return COMPOUNDS.filter(c=>(domain==='all'||c.domain===domain)&&(!t||displayName(c).toLowerCase().includes(t)||c.aliases.some(a=>a.toLowerCase().includes(t))||c.tags.some(x=>x.includes(t)))).sort((a,b)=>sort==='alpha'?displayName(a).localeCompare(displayName(b)):(b.sequence?.length??0)-(a.sequence?.length??0))
  },[q,domain,sort])
  return (
    <div className="pt-28 pb-20">
      <header className="wrap shop-hero py-12 md:py-20"><p className="label label-cyan">Shop</p><h1 className="display text-[clamp(3.2rem,9vw,8.6rem)] mt-3">Explore the<br/><span className="outline-word">collection.</span></h1><p className="lede mt-6 max-w-2xl">Browse all {COMPOUNDS.length} names. Open any product to learn what it is, why people look it up, and which sources we have checked.</p><p className="text-[12px] muted mt-4">Prices are temporary placeholders. Checkout is disabled while commercial requirements are finalized.</p></header>
      <section className="wrap">
        <div className="shop-controls">
          <label><span className="label">Search the collection</span><input type="search" value={q} onChange={e=>setQ(e.target.value)} placeholder="Name, alias, or tag…"/></label>
          <label><span className="label">Shop by topic</span><select value={domain} onChange={e=>setDomain(e.target.value as DomainId|'all')}><option value="all">All topics</option>{DOMAINS.map(d=><option key={d.id} value={d.id}>{TOPIC_NAME[d.id]}</option>)}</select></label>
          <label><span className="label">Sort by</span><select value={sort} onChange={e=>setSort(e.target.value as Sort)}><option value="alpha">Name</option><option value="length">Molecule length</option></select></label>
          <div className="flex gap-1"><button className="btn btn-sm" aria-pressed={view==='grid'} onClick={()=>setView('grid')}>Grid</button><button className="btn btn-sm" aria-pressed={view==='table'} onClick={()=>setView('table')}>Details</button></div>
        </div>
        <div className="mt-5 flex justify-between gap-4"><p className="mono text-[11px] text-bone/50">{rows.length} of {COMPOUNDS.length} products</p><p className="label hidden sm:block">Quick view and cart are ready</p></div>
        {view==='grid'?<div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{rows.map((c,i)=><CompoundCard key={c.slug} compound={c} index={i} fluid/>)}</div>:
        <div className="mt-8 panel-flat overflow-x-auto"><table className="data commerce-table"><thead><tr><th>Product</th><th>Topic</th><th>Length</th><th>Price</th><th/></tr></thead><tbody>{rows.map(c=>{const t=themeFor(c);return <tr key={c.slug}><td><Link to="/compound/$slug" params={{slug:c.slug}} className="font-semibold text-lg hover:text-cyan" style={{color:t.primary}}>{displayName(c)}</Link><span className="block text-[11px] muted capitalize">{c.tags.slice(0,2).map(x=>x.replaceAll('-', ' ')).join(' · ')}</span></td><td>{TOPIC_NAME[c.domain]}</td><td className="mono">{c.sequence?`${c.sequence.length} amino acids`:'Pending'}</td><td className="mono">{PRICE_PLACEHOLDER}</td><td><div className="flex gap-2 justify-end"><button className="btn btn-sm" onClick={()=>quick(c.slug)}>Quick view</button><button className="btn btn-sm commerce-btn" onClick={()=>add(c.slug)}>Add to cart</button></div></td></tr>})}</tbody></table></div>}
        {rows.length===0&&<div className="panel p-10 mt-8 text-center"><h2 className="display-md text-2xl">No match yet.</h2><p className="muted text-sm mt-2">Try a different product name, alternate name, or topic.</p></div>}
      </section>
    </div>
  )
}
