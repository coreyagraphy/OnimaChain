// Generates public/posters/hero.svg — a static projection of the BPC-157 chain (LCP element).
// Uses the same procedural geometry as the WebGL scene so the poster and the first frame match.
import { writeFileSync } from 'node:fs'
import { buildChain, CLASS_COLORS, sizeRadius } from '../src/scenes/chain/geometry.ts'
import { COMPOUND_BY_SLUG } from '../src/data/compounds.ts'

const g = buildChain(COMPOUND_BY_SLUG['bpc-157'])
const n = g.length
const W = 1440
const H = 900
const cx = W / 2 + 40
const cy = H / 2 - 40
const S = 22 // px per Å

// Same axis swap + tilt as the renderer: local (x,y,z) → (z, y, -x), then small tilt.
type V = [number, number, number]
const rot = (p: V): V => {
  let [x, y, z] = [p[2] - g.bounds.center[2], p[1] - g.bounds.center[1], -(p[0] - g.bounds.center[0])]
  const a = 0.18, b = 0.12
  ;[x, z] = [x * Math.cos(a) + z * Math.sin(a), -x * Math.sin(a) + z * Math.cos(a)]
  ;[y, z] = [y * Math.cos(b) - z * Math.sin(b), y * Math.sin(b) + z * Math.cos(b)]
  return [x, y, z]
}
const proj = (p: V) => {
  const persp = 1 + p[2] * 0.03
  return [cx + p[0] * S * persp, cy - p[1] * S * persp, p[2]] as const
}
const pts: V[] = []
for (let i = 0; i < n; i++) pts.push(rot([g.ca[i * 3], g.ca[i * 3 + 1], g.ca[i * 3 + 2]]))
const path = pts.map((p, i) => { const q = proj(p); return `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}` }).join(' ')

let seed = 11
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 }

const circles = pts
  .map((p, i) => ({ q: proj(p), i }))
  .sort((a, b) => a.q[2] - b.q[2])
  .map(({ q, i }) => {
    const r = g.residues[i]
    const depth = (q[2] + 8) / 16
    const rad = sizeRadius(r.size) * 0.72 * S * (0.85 + depth * 0.3)
    const col = CLASS_COLORS[r.cls]
    return `<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="${rad.toFixed(1)}" fill="${col}" fill-opacity="${(0.55 + depth * 0.45).toFixed(2)}" filter="url(#soft)"/>
<circle cx="${(q[0] - rad * 0.3).toFixed(1)}" cy="${(q[1] - rad * 0.32).toFixed(1)}" r="${(rad * 0.28).toFixed(1)}" fill="#ffffff" fill-opacity="0.35"/>`
  })
  .join('\n')

let dust = ''
for (let i = 0; i < 260; i++) dust += `<circle cx="${(rnd() * W).toFixed(0)}" cy="${(rnd() * H).toFixed(0)}" r="${(0.5 + rnd() * 1.3).toFixed(1)}" fill="${rnd() > 0.8 ? '#B9A2FF' : '#7FB7D9'}" fill-opacity="${(0.15 + rnd() * 0.4).toFixed(2)}"/>`

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice">
<defs>
<radialGradient id="bg" cx="55%" cy="45%" r="70%"><stop offset="0%" stop-color="#121826"/><stop offset="60%" stop-color="#0C0F16"/><stop offset="100%" stop-color="#0A0B0E"/></radialGradient>
<radialGradient id="glow" cx="58%" cy="42%" r="32%"><stop offset="0%" stop-color="#5FE3FF" stop-opacity="0.16"/><stop offset="100%" stop-color="#5FE3FF" stop-opacity="0"/></radialGradient>
<radialGradient id="glow2" cx="30%" cy="60%" r="30%"><stop offset="0%" stop-color="#8A63FF" stop-opacity="0.14"/><stop offset="100%" stop-color="#8A63FF" stop-opacity="0"/></radialGradient>
<filter id="blur"><feGaussianBlur stdDeviation="2.2"/></filter>
<filter id="soft"><feGaussianBlur stdDeviation="0.6"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
<rect width="${W}" height="${H}" fill="url(#glow)"/>
<rect width="${W}" height="${H}" fill="url(#glow2)"/>
${dust}
<path d="${path}" fill="none" stroke="#5FE3FF" stroke-opacity="0.45" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" filter="url(#blur)"/>
<path d="${path}" fill="none" stroke="#2F7C8F" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
${circles}
</svg>`
writeFileSync(new URL('../public/posters/hero.svg', import.meta.url), svg)
console.log('wrote hero.svg', svg.length, 'bytes')
