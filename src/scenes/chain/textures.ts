import * as THREE from 'three'
import { mulberry32 } from './geometry'

/*
 * Procedural surface detail for the chain. These are artistic material treatments, not claims about how
 * molecules look. Everything is deterministic (seeded) so surfaces never change between renders.
 *
 *  - atomMaps():  fine ceramic / mineral grain as a tangent-space normal map + matching roughness map.
 *  - bondMaps():  softly brushed, striated connector: stripes run along the tube (v axis) with a faint cross grain.
 *
 * Both are generated once per session at a size chosen by the quality tier and shared by every instance.
 * Per-atom variation comes from a seeded per-instance rotation in ChainRenderer, not from unique textures.
 */

export interface SurfaceMaps {
  normal: THREE.CanvasTexture
  roughness: THREE.CanvasTexture
}

let atomCache: Record<number, SurfaceMaps> = {}
let bondCache: Record<number, SurfaceMaps> = {}

/** Value-noise height field in [0,1], tileable, with a few octaves. */
function heightField(size: number, seed: number, octaves: number, base: number): Float32Array {
  const rnd = mulberry32(seed)
  const h = new Float32Array(size * size)
  let amp = 1
  let total = 0
  for (let o = 0; o < octaves; o++) {
    const cells = base << o
    const grid = new Float32Array(cells * cells)
    for (let i = 0; i < grid.length; i++) grid[i] = rnd()
    for (let y = 0; y < size; y++) {
      const gy = (y / size) * cells
      const y0 = Math.floor(gy), y1 = (y0 + 1) % cells, ty = gy - y0
      for (let x = 0; x < size; x++) {
        const gx = (x / size) * cells
        const x0 = Math.floor(gx), x1 = (x0 + 1) % cells, tx = gx - x0
        const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty)
        const a = grid[y0 * cells + x0], b = grid[y0 * cells + x1], c = grid[y1 * cells + x0], d = grid[y1 * cells + x1]
        const v = (a * (1 - sx) + b * sx) * (1 - sy) + (c * (1 - sx) + d * sx) * sy
        h[y * size + x] += v * amp
      }
    }
    total += amp
    amp *= 0.5
  }
  for (let i = 0; i < h.length; i++) h[i] /= total
  return h
}

function toTextures(size: number, height: Float32Array, strength: number, roughBase: number, roughVar: number): SurfaceMaps {
  const nc = document.createElement('canvas')
  nc.width = nc.height = size
  const nctx = nc.getContext('2d')!
  const nimg = nctx.createImageData(size, size)
  const rc = document.createElement('canvas')
  rc.width = rc.height = size
  const rctx = rc.getContext('2d')!
  const rimg = rctx.createImageData(size, size)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x
      const l = height[y * size + ((x - 1 + size) % size)], r = height[y * size + ((x + 1) % size)]
      const u = height[((y - 1 + size) % size) * size + x], d = height[((y + 1) % size) * size + x]
      let nx = (l - r) * strength, ny = (u - d) * strength, nz = 1
      const len = Math.hypot(nx, ny, nz)
      nx /= len; ny /= len; nz /= len
      nimg.data[i * 4] = (nx * 0.5 + 0.5) * 255
      nimg.data[i * 4 + 1] = (ny * 0.5 + 0.5) * 255
      nimg.data[i * 4 + 2] = (nz * 0.5 + 0.5) * 255
      nimg.data[i * 4 + 3] = 255
      const rough = Math.min(1, Math.max(0, roughBase + (height[i] - 0.5) * roughVar))
      const rv = rough * 255
      rimg.data[i * 4] = rv; rimg.data[i * 4 + 1] = rv; rimg.data[i * 4 + 2] = rv; rimg.data[i * 4 + 3] = 255
    }
  }
  nctx.putImageData(nimg, 0, 0)
  rctx.putImageData(rimg, 0, 0)
  const normal = new THREE.CanvasTexture(nc)
  const roughness = new THREE.CanvasTexture(rc)
  for (const t of [normal, roughness]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.anisotropy = 4
    t.colorSpace = THREE.NoColorSpace
  }
  return { normal, roughness }
}

/** Finely grained ceramic / mineral surface for atoms. */
export function atomMaps(size = 256): SurfaceMaps | null {
  if (typeof document === 'undefined') return null
  if (atomCache[size]) return atomCache[size]
  const h = heightField(size, 0x41544f4d, 4, 14)
  // add a sparse speckle so the grain reads as mineral rather than plastic
  const rnd = mulberry32(0x53504b)
  for (let k = 0; k < size * size * 0.004; k++) {
    const i = Math.floor(rnd() * h.length)
    h[i] = Math.min(1, h[i] + 0.35)
  }
  const maps = toTextures(size, h, 26, 0.42, 0.5)
  maps.normal.repeat.set(2, 1)
  maps.roughness.repeat.set(2, 1)
  atomCache[size] = maps
  return maps
}

/** Softly brushed, striated connector surface for bonds. Stripes run along the tube. */
export function bondMaps(size = 256): SurfaceMaps | null {
  if (typeof document === 'undefined') return null
  if (bondCache[size]) return bondCache[size]
  const rnd = mulberry32(0x424f4e44)
  const h = new Float32Array(size * size)
  // striations: a 1-D profile across u, varied slowly along v, plus faint cross grain
  const profile = new Float32Array(size)
  for (let i = 0; i < size; i++) profile[i] = 0.5 + 0.3 * Math.sin(i * 0.9 + rnd() * 0.6) * (0.6 + 0.4 * rnd())
  const cross = heightField(size, 0x43524f53, 3, 8)
  for (let y = 0; y < size; y++) {
    const drift = Math.sin(y * 0.05) * 1.5
    for (let x = 0; x < size; x++) {
      const px = (x + Math.round(drift) + size) % size
      h[y * size + x] = profile[px] * 0.75 + cross[y * size + x] * 0.25
    }
  }
  const maps = toTextures(size, h, 64, 0.38, 0.45)
  maps.normal.repeat.set(3, 12)
  maps.roughness.repeat.set(3, 12)
  bondCache[size] = maps
  return maps
}

/** Test hook: drop caches (unused in the app). */
export function resetSurfaceCaches() {
  atomCache = {}
  bondCache = {}
}
