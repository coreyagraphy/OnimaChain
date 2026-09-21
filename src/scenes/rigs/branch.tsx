import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei/core/PerspectiveCamera'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ChainRenderer } from '../chain/ChainRenderer'
import { mulberry32 } from '../chain/geometry'
import type { RigProps } from './types'

const vert = /* glsl */ `
attribute float aBirth; attribute float aLife;
uniform float uGrowth;
varying float vAlpha;
void main(){
  float t = clamp((uGrowth - aBirth) / max(aLife, 0.001), 0.0, 1.0);
  vAlpha = t;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`
const frag = /* glsl */ `
uniform vec3 uColor; uniform float uIntensity;
varying float vAlpha;
void main(){ if (vAlpha <= 0.0) discard; gl_FragColor = vec4(uColor, vAlpha * 0.85 * uIntensity); }`

/** Seeded branching network growing from the frame edges toward the centre. */
function buildNetwork(seed: number) {
  const rnd = mulberry32(seed)
  const pos: number[] = []
  const birth: number[] = []
  const life: number[] = []
  const grow = (x: number, y: number, ang: number, len: number, depth: number, t0: number) => {
    if (depth > 5 || len < 0.08) return
    const nx = x + Math.cos(ang) * len
    const ny = y + Math.sin(ang) * len
    pos.push(x, y, 0, nx, ny, 0)
    const dur = len * 0.9
    birth.push(t0, t0)
    life.push(dur, dur)
    const toCentre = Math.atan2(-ny, -nx)
    const branches = rnd() < 0.55 ? 2 : 1
    for (let b = 0; b < branches; b++) {
      const bias = 0.35
      const na = ang * (1 - bias) + toCentre * bias + (rnd() - 0.5) * 1.1
      grow(nx, ny, na, len * (0.62 + rnd() * 0.25), depth + 1, t0 + dur)
    }
  }
  const roots = 7
  for (let i = 0; i < roots; i++) {
    const a = (i / roots) * Math.PI * 2 + rnd() * 0.6
    const R = 2.4
    const x = Math.cos(a) * R
    const y = Math.sin(a) * R
    grow(x, y, Math.atan2(-y, -x) + (rnd() - 0.5) * 0.8, 0.55 + rnd() * 0.35, 0, rnd() * 0.3)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('aBirth', new THREE.Float32BufferAttribute(birth, 1))
  geo.setAttribute('aLife', new THREE.Float32BufferAttribute(life, 1))
  return geo
}

/** Repair — Branch. A line network grows from the edges toward the centre and closes over a mask. */
export function BranchRig({ geometry, tint, accent, glow, lod, intensity, tempo, seed }: RigProps) {
  const geo = useMemo(() => buildNetwork(seed), [seed])
  const uniforms = useMemo(
    () => ({ uGrowth: { value: 0 }, uColor: { value: new THREE.Color(glow) }, uIntensity: { value: intensity } }),
    [glow, intensity],
  )
  const mask = useRef<THREE.Mesh>(null)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 0.28 * tempo
    const c = t.current % 1
    // grow 0–0.7, hold, fade 0.85–1
    const growth = Math.min(1, c / 0.7) * 3.2
    uniforms.uGrowth.value = growth
    uniforms.uIntensity.value = intensity * (c > 0.85 ? 1 - (c - 0.85) / 0.15 : 1)
    if (mask.current) {
      const m = mask.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.18 * Math.max(0, 1 - c / 0.7) * intensity
    }
  })
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5.2]} fov={42} />
      <mesh ref={mask} position={[0, 0, -0.4]}>
        <circleGeometry args={[0.9, 32]} />
        <meshBasicMaterial color={accent} transparent opacity={0.15} />
      </mesh>
      <lineSegments geometry={geo} position={[0, 0, -0.3]}>
        <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} />
      </lineSegments>
      <ChainRenderer geometry={geometry} tint={tint} accent={accent} lod={lod} intensity={intensity} fit={0.62} rotate={0.2 * tempo} tempo={tempo} />
    </>
  )
}
