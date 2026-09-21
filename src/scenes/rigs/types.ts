import type { ChainGeometry } from '../chain/geometry'

export interface RigProps {
  geometry: ChainGeometry
  tint: string
  accent: string
  glow: string
  lod: 0 | 1 | 2
  intensity: number
  /** Tempo multiplier derived from chain length (short = quick, long = stately). */
  tempo: number
  seed: number
}

export function tempoFor(length: number): number {
  // 3 residues → ~1.6x, 43 residues → ~0.6x
  return Math.max(0.55, Math.min(1.7, 1.9 - Math.log2(Math.max(2, length)) * 0.24))
}
