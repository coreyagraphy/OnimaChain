import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { SearchModal } from './SearchModal'
import { BRAND } from '~/brand'
import { cartCount, useCommerceStore } from '~/stores/commerce'

const links = [
  { to: '/explore', label: 'Shop' },
  { to: '/claims', label: 'Research' },
  { to: '/signal', label: 'Portal of Tides' },
  { to: '/bond-theory', label: 'Bond Theory' },
  { to: '/learn', label: 'Learn' },
  { to: '/about', label: 'About' },
] as const

export function Nav() {
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const count = useCommerceStore(cartCount)
  const setCartOpen = useCommerceStore((s) => s.setCartOpen)
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
          <Link to="/" className="flex items-center gap-3 group" aria-label={`${BRAND} home`}><Mark /><span className="display text-[15px] tracking-[0.18em] uppercase text-bone group-hover:text-cyan transition-colors">{BRAND}</span></Link>
          <nav className="hidden lg:flex items-center gap-8" aria-label="Primary">
            {links.map((l) => <Link key={l.to} to={l.to} className="nav-link" activeProps={{ className: 'nav-link is-active' }}>{l.label}</Link>)}
          </nav>
          <div className="flex items-center gap-2">
            <button className="nav-icon hidden sm:grid" onClick={() => setOpen(true)} aria-label="Search (Cmd/Ctrl K)"><SearchIcon /></button>
            <span className="nav-icon hidden lg:grid opacity-45" aria-label="Account coming soon" title="Account coming soon"><AccountIcon /></span>
            <button className="cart-trigger" onClick={() => setCartOpen(true)} aria-label={`Open cart, ${count} items`} data-cursor="cart"><BagIcon /><span>Cart</span><b key={count}>{count}</b></button>
            <button className="nav-icon lg:hidden" onClick={() => setMenu((v) => !v)} aria-expanded={menu} aria-controls="mobile-nav"><MenuIcon /></button>
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan/15 to-transparent" />
        {menu && (
          <nav id="mobile-nav" className="lg:hidden bg-obsidian/95 border-b hairline px-5 py-5 grid grid-cols-2 gap-2 fade-up" aria-label="Mobile">
            {links.map((l) => <Link key={l.to} to={l.to} className="label !text-bone py-3" onClick={() => setMenu(false)}>{l.label}</Link>)}
            <button className="label !text-bone py-3 text-left" onClick={() => { setOpen(true); setMenu(false) }}>Search</button>
            <Link to="/methodology" className="label !text-bone py-3" onClick={() => setMenu(false)}>Our method</Link>
          </nav>
        )}
      </header>
      <SearchModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

export function Mark({ size = 24 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="5" cy="12" r="2.2" fill="#5FE3FF" /><circle cx="12" cy="6" r="2.2" fill="#F2EEE6" /><circle cx="19" cy="14" r="2.2" fill="#8A63FF" /><path d="M6.6 10.8 10.5 7.4M13.7 7.2l3.7 5.6M6.9 12.6l10.3 1.6" stroke="#F2EEE6" strokeOpacity=".55" strokeWidth="1.1" strokeLinecap="round" /></svg>
}
const SearchIcon = () => <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor"/><path d="m13 13 4 4" stroke="currentColor"/></svg>
const AccountIcon = () => <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="6" r="3" stroke="currentColor"/><path d="M4 17c.4-3.2 2.4-5 6-5s5.6 1.8 6 5" stroke="currentColor"/></svg>
const BagIcon = () => <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4 7h12l-1 10H5L4 7Z" stroke="currentColor"/><path d="M7 7V5a3 3 0 0 1 6 0v2" stroke="currentColor"/></svg>
const MenuIcon = () => <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 6h14M3 14h14" stroke="currentColor"/></svg>
