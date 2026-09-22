import type { Compound, Mod, ModKind } from '~/data/compounds'
import { decodeConformer } from '~/data/conformers'

/*
 * Procedural, sequence-driven backbone illustration. Without deposited coordinates,
 * residue positions are a deterministic open-chain schematic, not a predicted fold.
 * Units are Ångström; the renderer normalises with `bounds`.
 *
 * It must never be described as a measured structure.
 */

export type ResidueClass = 'hydrophobic' | 'polar' | 'positive' | 'negative' | 'special'
export type ResidueSize = 'S' | 'M' | 'L'
export type HotspotKind =
  | 'proline'
  | 'glycine'
  | 'copper'
  | 'lactam'
  | 'acyl'
  | 'acetyl'
  | 'amide'
  | 'aib'
  | 'd-residue'
  | 'nonstandard'
  | 'gamma'
  | 'disulfide'

export interface ResidueMeta {
  index: number // 0-based
  pos: number // 1-based
  code: string
  name: string
  cls: ResidueClass
  size: ResidueSize
  chirality: 'L' | 'D'
  nonStandard?: 'Aib' | 'Nle' | 'Dmt' | 'Nal' | 'MeLeu'
  mods: ModKind[]
  hotspots: HotspotKind[]
}

export interface Hotspot {
  kind: HotspotKind
  residues: number[] // 0-based indices
  label: string
  position: [number, number, number]
}

export interface Bridge {
  from: number
  to: number
  type: 'lactam' | 'disulfide'
  points: [number, number, number][]
}

export interface Tether {
  residue: number
  points: [number, number, number][]
}

export interface ChainGeometry {
  slug: string
  length: number
  ca: Float32Array
  scatter: Float32Array
  residues: ResidueMeta[]
  bridges: Bridge[]
  hotspots: Hotspot[]
  tethers: Tether[]
  metal?: { position: [number, number, number]; element: string; residues: number[] }
  /** Index pairs (i, i-4) whose helical H-bond visual is broken (proline). */
  brokenHBonds: number[]
  bounds: { center: [number, number, number]; radius: number; extent: [number, number, number] }
  placeholder: boolean
}

export const RESIDUE_NAMES: Record<string, string> = {
  A: 'Alanine', R: 'Arginine', N: 'Asparagine', D: 'Aspartate', C: 'Cysteine', E: 'Glutamate',
  Q: 'Glutamine', G: 'Glycine', H: 'Histidine', I: 'Isoleucine', L: 'Leucine', K: 'Lysine',
  M: 'Methionine', F: 'Phenylalanine', P: 'Proline', S: 'Serine', T: 'Threonine', W: 'Tryptophan',
  Y: 'Tyrosine', V: 'Valine', X: 'Non-standard',
}

const NONSTD_NAMES: Record<string, string> = {
  Aib: 'α-Aminoisobutyric acid',
  Nle: 'Norleucine',
  Dmt: "2',6'-Dimethyltyrosine",
  Nal: '2-Naphthylalanine',
  MeLeu: 'α-Methyl-leucine',
}

export function residueClass(code: string, nonStandard?: string): ResidueClass {
  if (nonStandard === 'Nle' || nonStandard === 'Aib' || nonStandard === 'Nal' || nonStandard === 'MeLeu') return 'hydrophobic'
  if (nonStandard === 'Dmt') return 'polar'
  if ('AVLIMFW'.includes(code)) return 'hydrophobic'
  if ('STNQYC'.includes(code)) return 'polar'
  if ('KRH'.includes(code)) return 'positive'
  if ('DE'.includes(code)) return 'negative'
  return 'special' // G, P, X
}

export function residueSize(code: string, nonStandard?: string): ResidueSize {
  if (nonStandard === 'Nal' || nonStandard === 'Dmt' || nonStandard === 'MeLeu') return 'L'
  if (nonStandard === 'Aib') return 'S'
  if (nonStandard === 'Nle') return 'M'
  if ('GASC'.includes(code)) return 'S'
  if ('TDNPVEQ'.includes(code)) return 'M'
  return 'L'
}

export const CLASS_COLORS: Record<ResidueClass, string> = {
  hydrophobic: '#9C9691', // warm grey
  polar: '#DCE8EE', // cool white
  positive: '#E8C89A', // pale gold (warm, not the semantic amber)
  negative: '#5FE3FF', // cyan
  special: '#B9A2FF', // violet
}

export function sizeRadius(size: ResidueSize): number {
  return size === 'S' ? 0.9 : size === 'M' ? 1.2 : 1.5
}

// ---------- seeded RNG ----------
export function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ---------- tiny vector helpers ----------
type V3 = [number, number, number]
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s]
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: V3, b: V3): V3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]
const len = (a: V3) => Math.hypot(a[0], a[1], a[2])
const norm = (a: V3): V3 => {
  const l = len(a) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}
/** Rodrigues rotation of v around unit axis k by angle. */
function rotate(v: V3, k: V3, angle: number): V3 {
  const c = Math.cos(angle)
  const s = Math.sin(angle)
  return add(add(scale(v, c), scale(cross(k, v), s)), scale(k, dot(k, v) * (1 - c)))
}

const RISE = 1.5
const ANGLE = (100 * Math.PI) / 180
const RADIUS = 2.3

/** Ideal alpha helix Cα positions for n residues, along +z, starting at the origin. */
export function idealHelix(n: number): Float32Array {
  const out = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    const t = i * ANGLE
    out[i * 3] = RADIUS * Math.cos(t)
    out[i * 3 + 1] = RADIUS * Math.sin(t)
    out[i * 3 + 2] = i * RISE
  }
  return out
}

function modsAt(mods: Mod[], pos: number): ModKind[] {
  return mods.filter((m) => m.pos === pos).map((m) => m.kind)
}

export function buildResidues(c: Pick<Compound, 'sequence' | 'mods'>): ResidueMeta[] {
  const seq = c.sequence ?? ''
  const out: ResidueMeta[] = []
  for (let i = 0; i < seq.length; i++) {
    const code = seq[i]
    const pos = i + 1
    const mods = modsAt(c.mods, pos)
    const nonStandard = (['Aib', 'Nle', 'Dmt', 'Nal', 'MeLeu'] as const).find((k) => mods.includes(k))
    const hotspots: HotspotKind[] = []
    if (code === 'P') hotspots.push('proline')
    if (code === 'G') hotspots.push('glycine')
    if (mods.includes('D')) hotspots.push('d-residue')
    if (mods.includes('Aib')) hotspots.push('aib')
    else if (nonStandard) hotspots.push('nonstandard')
    if (mods.includes('acetyl')) hotspots.push('acetyl')
    if (mods.includes('amide')) hotspots.push('amide')
    if (mods.includes('acyl') || mods.includes('PEG')) hotspots.push('acyl')
    if (mods.includes('gamma')) hotspots.push('gamma')
    out.push({
      index: i,
      pos,
      code,
      name: nonStandard ? NONSTD_NAMES[nonStandard] : (RESIDUE_NAMES[code] ?? 'Unknown'),
      cls: residueClass(code, nonStandard),
      size: residueSize(code, nonStandard),
      chirality: mods.includes('D') ? 'D' : 'L',
      nonStandard,
      mods,
      hotspots,
    })
  }
  return out
}

/** Dominant residue class in a chain (ties broken by class order). */
export function dominantClass(residues: ResidueMeta[]): ResidueClass {
  const counts: Record<ResidueClass, number> = { hydrophobic: 0, polar: 0, positive: 0, negative: 0, special: 0 }
  for (const r of residues) counts[r.cls]++
  return (Object.keys(counts) as ResidueClass[]).reduce((a, b) => (counts[b] > counts[a] ? b : a))
}

function computeBounds(ca: Float32Array, n: number) {
  const center: V3 = [0, 0, 0]
  for (let i = 0; i < n; i++) {
    center[0] += ca[i * 3]
    center[1] += ca[i * 3 + 1]
    center[2] += ca[i * 3 + 2]
  }
  if (n > 0) {
    center[0] /= n
    center[1] /= n
    center[2] /= n
  }
  let radius = 0
  const min: V3 = [Infinity, Infinity, Infinity]
  const max: V3 = [-Infinity, -Infinity, -Infinity]
  for (let i = 0; i < n; i++) {
    const d = Math.hypot(ca[i * 3] - center[0], ca[i * 3 + 1] - center[1], ca[i * 3 + 2] - center[2])
    if (d > radius) radius = d
    for (let k = 0; k < 3; k++) {
      min[k] = Math.min(min[k], ca[i * 3 + k])
      max[k] = Math.max(max[k], ca[i * 3 + k])
    }
  }
  const extent: V3 = n ? [max[0] - min[0] + 4, max[1] - min[1] + 4, max[2] - min[2] + 4] : [4, 4, 4]
  return { center, radius: Math.max(radius + 2.5, 4), extent }
}

function scatterFor(seed: number, n: number, bounds: { center: V3; radius: number }): Float32Array {
  const rnd = mulberry32(seed ^ 0x5bd1e995)
  const out = new Float32Array(n * 3)
  const R = bounds.radius * 2.4 + 6
  for (let i = 0; i < n; i++) {
    // uniform on a spherical shell
    const u = rnd() * 2 - 1
    const phi = rnd() * Math.PI * 2
    const r = R * (0.75 + rnd() * 0.5)
    const s = Math.sqrt(1 - u * u)
    out[i * 3] = bounds.center[0] + r * s * Math.cos(phi)
    out[i * 3 + 1] = bounds.center[1] + r * s * Math.sin(phi)
    out[i * 3 + 2] = bounds.center[2] + r * u
  }
  return out
}

/** Build a sequence-derived illustration. Callers must not display placeholders as molecules. */
export function buildChain(c: Compound): ChainGeometry {
  const seed = hashString(c.slug)
  if (!c.sequence) return buildPlaceholder(c.slug, 18)

  const residues = buildResidues(c)
  const n = residues.length
  const rnd = mulberry32(seed)
  const ca = new Float32Array(n * 3)
  const brokenHBonds: number[] = []

  const ring = c.cyclic
  const ringFrom = ring ? ring.from - 1 : -1
  const ringTo = ring ? ring.to - 1 : -1

  if (ring && ringTo > ringFrom) {
    // A closure is a chemical bond, not a perfect planar backbone hoop. Keep an
    // irregular three-dimensional loop so the bridge and both tails remain legible.
    const m = ringTo - ringFrom + 1
    const R = (m * 3.8) / (2 * Math.PI)
    const pts: V3[] = []
    for (let k = 0; k < m; k++) {
      const t = (k / m) * Math.PI * 2
      const radial = R * (1 + 0.17 * Math.sin(t * 3 + 0.4) + 0.09 * Math.cos(t * 2.4))
      pts.push([
        1.8 * Math.sin(t * 1.6) + 0.55 * Math.cos(t * 3.1),
        radial * Math.cos(t) + 0.6 * Math.sin(t * 2),
        radial * Math.sin(t) * (ring.type === 'disulfide' ? 0.72 : 0.92),
      ])
    }
    for (let k = 0; k < m; k++) {
      const i = ringFrom + k
      ca.set(pts[k], i * 3)
    }
    // leading tail
    const tangent0 = norm(sub(pts[0], pts[1]))
    for (let i = ringFrom - 1, step = 1; i >= 0; i--, step++) {
      const p = add(pts[0], add(scale(tangent0, 3.6 * step), [1.2 * step, 0, 0]))
      ca.set(p, i * 3)
    }
    // trailing tail
    const tangent1 = norm(sub(pts[m - 1], pts[m - 2]))
    for (let i = ringTo + 1, step = 1; i < n; i++, step++) {
      const p = add(pts[m - 1], add(scale(tangent1, 3.6 * step), [-1.2 * step, 0, 0]))
      ca.set(p, i * 3)
    }
  } else {
    // Open-chain schematic: preserve Cα spacing and residue order, but do not
    // impose one alpha helix on unrelated peptides or a disordered sequence.
    let center: V3 = [0, 0, 0]
    const heading = rnd() * Math.PI * 2
    let d: V3 = norm([Math.cos(heading) * 0.65, Math.sin(heading) * 0.65, 0.76])
    let u: V3 = norm(cross([0, 1, 0], d))
    let v: V3 = norm(cross(d, u))
    for (let i = 0; i < n; i++) {
      const r = residues[i]
      ca.set(center, i * 3)
      const axis = norm(add(scale(u, Math.cos(rnd() * Math.PI * 2)), scale(v, Math.sin(rnd() * Math.PI * 2))))
      const turn = r.code === 'P' ? 0.6 + rnd() * 0.6 : r.code === 'G' ? 0.2 + rnd() * 1.0 : 0.35 + rnd() * 0.6
      d = norm(rotate(d, axis, turn))
      u = norm(rotate(u, axis, turn))
      v = norm(cross(d, u))
      center = add(center, scale(d, 3.8))
    }
  }

  // Use deposited C-alpha coordinates when available. Some receptor-bound PDBs omit a
  // flexible tail; keep the resolved core and extend only the missing end as a model.
  const deposited = decodeConformer(c.slug)
  if (deposited) {
    const known = Math.min(n, deposited.length / 3)
    let rendered = deposited
    // Deposited peptide chains use arbitrary file axes. Align their end-to-end axis to +z so
    // the card fitter frames the molecule consistently without changing internal distances.
    if (known > 2 && n < 80) {
      const first: V3 = [deposited[0], deposited[1], deposited[2]]
      const last: V3 = [deposited[(known - 1) * 3], deposited[(known - 1) * 3 + 1], deposited[(known - 1) * 3 + 2]]
      const direction = norm(sub(last, first))
      const target: V3 = [0, 0, 1]
      const axis = cross(direction, target)
      const axisLength = len(axis)
      if (axisLength > 0.0001) {
        const angle = Math.acos(Math.max(-1, Math.min(1, dot(direction, target))))
        rendered = new Float32Array(deposited.length)
        for (let index = 0; index < known; index++) {
          const point = sub([deposited[index * 3], deposited[index * 3 + 1], deposited[index * 3 + 2]], first)
          rendered.set(rotate(point, scale(axis, 1 / axisLength), angle), index * 3)
        }
      }
    }
    ca.set(rendered.subarray(0, known * 3), 0)
    if (known < n && known >= 2) {
      let previous: V3 = [ca[(known - 1) * 3], ca[(known - 1) * 3 + 1], ca[(known - 1) * 3 + 2]]
      let direction = norm(sub(previous, [ca[(known - 2) * 3], ca[(known - 2) * 3 + 1], ca[(known - 2) * 3 + 2]]))
      const side = norm(cross(direction, Math.abs(direction[2]) < 0.9 ? [0, 0, 1] : [0, 1, 0]))
      for (let index = known; index < n; index++) {
        direction = norm(add(direction, scale(side, Math.sin((index - known + 1) * 0.72) * 0.13)))
        previous = add(previous, scale(direction, 3.8))
        ca.set(previous, index * 3)
      }
    }
  }

  const bounds = computeBounds(ca, n)
  const scatter = scatterFor(seed, n, bounds)
  const at = (i: number): V3 => [ca[i * 3], ca[i * 3 + 1], ca[i * 3 + 2]]

  // Bridges
  const bridges: Bridge[] = []
  if (ring) {
    const a = at(ringFrom)
    const b = at(ringTo)
    const mid = scale(add(a, b), 0.5)
    const out = norm(sub(mid, bounds.center))
    const bulge = add(mid, scale(out, 2.6))
    bridges.push({ from: ringFrom, to: ringTo, type: ring.type, points: [a, bulge, b] })
  }

  // Metal
  let metal: ChainGeometry['metal']
  if (c.metal) {
    const idx = c.metal.residues.map((p) => p - 1)
    let cen: V3 = [0, 0, 0]
    for (const i of idx) cen = add(cen, at(i))
    cen = scale(cen, 1 / idx.length)
    // offset the ion slightly off the backbone plane so bonds are visible
    const n0 = idx.length >= 3 ? norm(cross(sub(at(idx[1]), at(idx[0])), sub(at(idx[2]), at(idx[0])))) : [0, 0, 1]
    metal = { position: add(cen, scale(n0 as V3, 1.6)), element: c.metal.element, residues: idx }
  }

  // Tethers (acyl / PEG)
  const tethers: Tether[] = []
  for (const m of c.mods) {
    if (m.kind === 'acyl' || m.kind === 'PEG') {
      const i = m.pos - 1
      const p = at(i)
      const out = norm(sub(p, bounds.center))
      const side = norm(cross(out, [0, 0, 1]))
      const pts: V3[] = []
      for (let k = 0; k <= 6; k++) {
        const t = k / 6
        pts.push(add(add(p, scale(out, 2 + t * 9)), scale(side, Math.sin(t * Math.PI * 1.5) * 2.2)))
      }
      tethers.push({ residue: i, points: pts })
    }
  }

  // Hotspots
  const hotspots: Hotspot[] = []
  const label = (k: HotspotKind, r: ResidueMeta) => {
    switch (k) {
      case 'proline': return `Pro${r.pos} — backbone kink, H-bond broken`
      case 'glycine': return `Gly${r.pos} — flexible, no side chain`
      case 'd-residue': return `D-${r.code === 'X' ? r.nonStandard ?? 'residue' : RESIDUE_NAMES[r.code]}${r.pos} — mirrored stereocentre`
      case 'aib': return `Aib${r.pos} — α,α-dimethyl, helix-favouring`
      case 'nonstandard': return `${r.nonStandard}${r.pos} — non-standard residue`
      case 'acetyl': return `N-acetyl cap at residue ${r.pos}`
      case 'amide': return `C-terminal amide at residue ${r.pos}`
      case 'acyl': return `Acyl tether on residue ${r.pos}`
      case 'gamma': return `γ-linkage at residue ${r.pos} — side-chain carboxyl in the backbone`
      default: return k
    }
  }
  // group consecutive prolines into one hotspot (e.g. BPC-157 "PPP")
  let i = 0
  while (i < n) {
    const r = residues[i]
    if (r.code === 'P') {
      let j = i
      while (j + 1 < n && residues[j + 1].code === 'P') j++
      const ids = []
      for (let k = i; k <= j; k++) ids.push(k)
      const mid = ids.length === 1 ? at(i) : scale(ids.reduce((acc, k) => add(acc, at(k)), [0, 0, 0] as V3), 1 / ids.length)
      hotspots.push({
        kind: 'proline',
        residues: ids,
        label: ids.length > 1 ? `Pro${residues[i].pos}–Pro${residues[j].pos} — consecutive prolines, rigid hinge` : label('proline', r),
        position: mid,
      })
      i = j + 1
      continue
    }
    for (const k of r.hotspots) {
      if (k === 'glycine') continue // too common to annotate every one
      hotspots.push({ kind: k, residues: [i], label: label(k, r), position: at(i) })
    }
    i++
  }
  if (metal) {
    hotspots.push({
      kind: 'copper',
      residues: metal.residues,
      label: `${metal.element}(II) coordination site — residues ${metal.residues.map((x) => x + 1).join(', ')}`,
      position: metal.position,
    })
  }
  for (const b of bridges) {
    hotspots.push({
      kind: b.type === 'disulfide' ? 'disulfide' : 'lactam',
      residues: [b.from, b.to],
      label: b.type === 'disulfide'
        ? `Disulfide bridge Cys${residues[b.from].pos}–Cys${residues[b.to].pos}`
        : `Lactam bridge ${residues[b.from].code}${residues[b.from].pos}–${residues[b.to].code}${residues[b.to].pos} — side-chain ring closure`,
      position: b.points[1],
    })
  }

  return {
    slug: c.slug,
    length: n,
    ca,
    scatter,
    residues,
    bridges,
    hotspots,
    tethers,
    metal,
    brokenHBonds,
    bounds,
    placeholder: false,
  }
}

/** Faint dashed helix of unknown length for compounds whose sequence is pending verification. */
export function buildPlaceholder(slug: string, n = 18): ChainGeometry {
  const ca = idealHelix(n)
  const bounds = computeBounds(ca, n)
  const residues: ResidueMeta[] = []
  for (let i = 0; i < n; i++) {
    residues.push({
      index: i, pos: i + 1, code: '?', name: 'Pending', cls: 'polar', size: 'S', chirality: 'L', mods: [], hotspots: [],
    })
  }
  return {
    slug,
    length: n,
    ca,
    scatter: scatterFor(hashString(slug), n, bounds),
    residues,
    bridges: [],
    hotspots: [],
    tethers: [],
    brokenHBonds: [],
    bounds,
    placeholder: true,
  }
}

/** Longest common substring between two sequences (for the Structure Lab). */
export function longestSharedSubsequence(a: string, b: string): { text: string; ai: number; bi: number } {
  let best = { text: '', ai: -1, bi: -1 }
  const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0))
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
        if (dp[i][j] > best.text.length) {
          best = { text: a.slice(i - dp[i][j], i), ai: i - dp[i][j], bi: j - dp[i][j] }
        }
      }
    }
  }
  return best
}
