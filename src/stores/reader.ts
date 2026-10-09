import { create } from 'zustand'

interface ReaderState {
  quickView: string | null
  setQuickView: (slug: string | null) => void
}

/** Ephemeral educational UI state; no shopping or health data is stored. */
export const useReaderStore = create<ReaderState>((set) => ({
  quickView: null,
  setQuickView: (quickView) => set({ quickView }),
}))
