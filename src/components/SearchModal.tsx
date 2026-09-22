import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { COMPOUNDS, displayName } from '~/data/compounds'
import { CLAIMS } from '~/data/claims'
import { verifiedStudies } from '~/data/studies'
import { brand } from '~/brand'
import { COMBINATIONS, TARGETS, WATCHLIST } from '~/data/research-entities'

interface Hit { group: 'Compounds' | 'Aliases' | 'Targets' | 'Watchlist' | 'Combinations' | 'Claims' | 'Studies'; label: string; sub: string; href: string }

function index(): Hit[] {
  const hits: Hit[] = []
  for (const c of COMPOUNDS) {
    hits.push({ group: 'Compounds', label: displayName(c), sub: c.slug === 'wolverine-blend' ? 'Community stack · Informational profile' : 'Compound · Informational profile', href: c.slug === 'wolverine-blend' ? '/combinations' : `/compound/${c.slug}` })
    for (const a of c.aliases) hits.push({ group: 'Aliases', label: a, sub: `→ ${displayName(c)}`, href: `/compound/${c.slug}` })
  }
  for (const c of WATCHLIST) {
    hits.push({ group: 'Watchlist', label: c.name, sub: 'Compound · Informational profile', href: `/watchlist/${c.id}` })
    for (const alias of c.aliases) hits.push({ group: 'Aliases', label: alias, sub: `→ ${c.name} · Watchlist`, href: `/watchlist/${c.id}` })
  }
  for (const c of COMBINATIONS) hits.push({ group: 'Combinations', label: c.name, sub: c.type === 'COMMUNITY_STACK' ? 'Community stack' : 'Clinical combination', href: `/combinations#${c.id}` })
  for (const t of TARGETS) hits.push({ group: 'Targets', label: t.label, sub: 'Receptor map', href: '/targets' })
  for (const cl of CLAIMS) hits.push({ group: 'Claims', label: cl.title, sub: cl.id, href: `/claim/${cl.id}` })
  for (const s of verifiedStudies()) hits.push({ group: 'Studies', label: s.title ?? '', sub: `PMID ${s.pmid} · ${s.journal} ${s.year ?? ''}`, href: `/compound/${s.compounds[0]}#sources` })
  return hits
}

/** Command-palette search over compounds, aliases, claims, studies. Cmd/Ctrl+K. */
export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [cursor, setCursor] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const nav = useNavigate()
  const all = useMemo(index, [])
  const hits = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (!t) return all.filter((h) => h.group === 'Compounds').slice(0, 8)
    return all.filter((h) => h.label.toLowerCase().includes(t) || h.sub.toLowerCase().includes(t)).slice(0, 14)
  }, [q, all])
  useEffect(() => { if (open) { setQ(''); setCursor(0); setTimeout(() => input.current?.focus(), 10) } }, [open])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => Math.min(hits.length - 1, c + 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => Math.max(0, c - 1)) }
      if (e.key === 'Enter' && hits[cursor]) { onClose(); nav({ to: hits[cursor].href }) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, hits, cursor, onClose, nav])
  if (!open) return null
  let lastGroup = ''
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[12vh] px-4" role="dialog" aria-modal="true" aria-label={`Search ${brand.name}`}>
      <button className="absolute inset-0 bg-obsidian/75" onClick={onClose} aria-label="Close search" />
      <div className="relative w-full max-w-2xl panel overflow-hidden fade-up" data-lenis-prevent>
        <input ref={input} type="search" value={q} onChange={(e) => { setQ(e.target.value); setCursor(0) }} placeholder="Search compounds, targets, stacks, studies…" className="w-full !rounded-none !border-0 !border-b hairline !bg-transparent !px-5 !py-4 text-base" aria-label="Search" />
        <ul className="max-h-[50vh] overflow-y-auto py-2" role="listbox">
          {hits.length === 0 && <li className="px-5 py-4 text-sm muted">We could not find that here yet. Try a peptide name or a shorter search.</li>}
          {hits.map((h, i) => {
            const head = h.group !== lastGroup
            lastGroup = h.group
            return (
              <li key={h.href + h.label} role="option" aria-selected={i === cursor}>
                {head && <p className="label px-5 pt-3 pb-1">{h.group}</p>}
                <button className={`w-full text-left px-5 py-2.5 flex items-baseline justify-between gap-4 ${i === cursor ? 'bg-cyan/10' : 'hover:bg-bone/5'}`} onMouseEnter={() => setCursor(i)} onClick={() => { onClose(); nav({ to: h.href }) }}>
                  <span className="text-sm text-bone/90 truncate">{h.label}</span>
                  <span className="mono text-[11px] text-bone/45 shrink-0 truncate max-w-[45%]">{h.sub}</span>
                </button>
              </li>
            )
          })}
        </ul>
        <div className="px-5 py-2 border-t hairline flex gap-4 mono text-[10px] text-bone/40">
          <span>↑↓ navigate</span><span>↵ open</span><span>esc close</span>
        </div>
      </div>
    </div>
  )
}
