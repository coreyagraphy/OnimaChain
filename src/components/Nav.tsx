import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { SearchModal } from './SearchModal'
import { BRAND } from '~/brand'
import { BrandWordmark } from './BrandWordmark'

const links = [
  { to: '/explore', label: 'Explore' },
  { to: '/learn', label: 'Play & Learn' },
  { to: '/claims', label: 'Research' },
  { to: '/methodology', label: 'Method' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
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
      <header className="fixed top-0 inset-x-0 z-40 nav-glass">
        <div className="wrap h-[72px] flex items-center justify-between">
          <Link to="/" className="brand-home group" aria-label={`${BRAND} home`}><BrandWordmark decorative /></Link>
          <nav className="hidden xl:flex items-center gap-4" aria-label="Primary">
            {links.map((l) => <Link key={l.to} to={l.to} className="nav-link" activeProps={{ className: 'nav-link is-active' }}>{l.label}</Link>)}
          </nav>
          <div className="flex items-center gap-2">
            <button className="nav-icon hidden sm:grid" onClick={() => setOpen(true)} aria-label="Search (Cmd/Ctrl K)"><SearchIcon /></button>
            <button className="nav-icon xl:hidden" onClick={() => setMenu((v) => !v)} aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} aria-controls="mobile-nav"><MenuIcon /></button>
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan/15 to-transparent" />
        {menu && (
          <nav id="mobile-nav" className="xl:hidden bg-obsidian/95 border-b hairline px-5 py-5 grid grid-cols-2 gap-2 fade-up" aria-label="Mobile">
            {links.map((l) => <Link key={l.to} to={l.to} className="label !text-bone py-3" onClick={() => setMenu(false)}>{l.label}</Link>)}
            <button className="label !text-bone py-3 text-left" onClick={() => { setOpen(true); setMenu(false) }}>Search</button>
          </nav>
        )}
      </header>
      <SearchModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

const SearchIcon = () => <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor"/><path d="m13 13 4 4" stroke="currentColor"/></svg>
const MenuIcon = () => <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 6h14M3 14h14" stroke="currentColor"/></svg>
