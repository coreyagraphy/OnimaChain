import { create } from 'zustand'

export interface CartLine { slug: string; quantity: number }

interface CommerceState {
  items: CartLine[]
  cartOpen: boolean
  quickView: string | null
  hydrated: boolean
  hydrate: () => void
  add: (slug: string, quantity?: number) => void
  setQuantity: (slug: string, quantity: number) => void
  remove: (slug: string) => void
  setCartOpen: (open: boolean) => void
  setQuickView: (slug: string | null) => void
}

const KEY = 'onimachain-commerce-cart-v1'
const LEGACY_KEYS = ['ominachain-commerce-cart-v1', 'cyravon-commerce-cart-v1']

function save(items: CartLine[]) {
  if (typeof window !== 'undefined') window.localStorage.setItem(KEY, JSON.stringify(items))
}

export const useCommerceStore = create<CommerceState>((set, get) => ({
  items: [], cartOpen: false, quickView: null, hydrated: false,
  hydrate: () => {
    if (get().hydrated || typeof window === 'undefined') return
    try {
      const current = window.localStorage.getItem(KEY)
      const legacyEntry = current === null
        ? LEGACY_KEYS.map((key) => [key, window.localStorage.getItem(key)] as const).find(([, value]) => value !== null)
        : undefined
      const legacy = legacyEntry?.[1] ?? null
      const parsed = JSON.parse(current ?? legacy ?? '[]') as CartLine[]
      const items = Array.isArray(parsed) ? parsed.filter((x) => x?.slug && x.quantity > 0) : []
      if (legacy !== null) {
        window.localStorage.setItem(KEY, JSON.stringify(items))
        for (const key of LEGACY_KEYS) window.localStorage.removeItem(key)
      }
      set({ items, hydrated: true })
    } catch { set({ hydrated: true }) }
  },
  add: (slug, quantity = 1) => set((state) => {
    const found = state.items.find((line) => line.slug === slug)
    const items = found
      ? state.items.map((line) => line.slug === slug ? { ...line, quantity: line.quantity + quantity } : line)
      : [...state.items, { slug, quantity }]
    save(items)
    return { items, cartOpen: true }
  }),
  setQuantity: (slug, quantity) => set((state) => {
    const items = quantity <= 0 ? state.items.filter((line) => line.slug !== slug) : state.items.map((line) => line.slug === slug ? { ...line, quantity } : line)
    save(items)
    return { items }
  }),
  remove: (slug) => set((state) => {
    const items = state.items.filter((line) => line.slug !== slug)
    save(items)
    return { items }
  }),
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setQuickView: (quickView) => set({ quickView }),
}))

export const cartCount = (state: CommerceState) => state.items.reduce((sum, line) => sum + line.quantity, 0)
