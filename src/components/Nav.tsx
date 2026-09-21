import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { SearchModal } from './SearchModal'
import { BRAND } from '~/brand'

const links = [
  { to: '/explore', label: 'Explore' },
  { to: '/claims', label: 'Claims' },
  { to: '/signal', label: 'Signal Map' },
  { to: '/compare', label: 'Compare' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/learn', label: 'Learn' },
] as const

export function Nav() {
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen((v) => !v) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-gradient-to-b from-obsidian/95 via-obsidian/70 to-transparent backdrop-blur-[2px]">
        <div className="wrap h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group" aria-label={`${BRAND} home`}>
            <Mark />
            <span className="display text-[15px] tracking-[0.18em] uppercase text-bone group-hover:text-cyan transition-colors">{BRAND}</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className="label hover:!text-bone transition-colors" activeProps={{ className: 'label !text-bone' }}>
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-4">
            <button className="btn btn-sm" onClick={() => setOpen(true)} aria-label="Search (Cmd/Ctrl K)">
              Search <span className="kbd">⌘K</span>
            </button>
            <Link to="/saved" className="label hover:!text-bone">Saved</Link>
            <Link to="/methodology" className="label hover:!text-bone">Methodology</Link>
          </div>
          <div className="flex lg:hidden items-center gap-2">
            <button className="btn btn-sm" onClick={() => setOpen(true)} aria-label="Search">Search</button>
            <button className="btn btn-sm" onClick={() => setMenu((v) => !v)} aria-expanded={menu} aria-controls="mobile-nav">Menu</button>
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-bone/15 to-transparent" />
        {menu && (
          <nav id="mobile-nav" className="lg:hidden bg-obsidian/95 border-b hairline px-5 py-4 grid grid-cols-2 gap-3 fade-up" aria-label="Mobile">
            {[...links, { to: '/methodology', label: 'Methodology' }, { to: '/coverage', label: 'Coverage' }].map((l) => (
              <Link key={l.to} to={l.to} className="label !text-bone py-2" onClick={() => setMenu(false)}>{l.label}</Link>
            ))}
          </nav>
        )}
      </header>
      <SearchModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="5" cy="12" r="2" fill="#5FE3FF" />
      <circle cx="12" cy="6" r="2" fill="#F2EEE6" />
      <circle cx="19" cy="14" r="2" fill="#8A63FF" />
      <path d="M6.6 10.8 10.5 7.4M13.7 7.2l3.7 5.6M6.9 12.6l10.3 1.6" stroke="#F2EEE6" strokeOpacity=".55" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}
