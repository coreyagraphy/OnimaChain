import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei/core/PerspectiveCamera'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ChainRenderer } from '../chain/ChainRenderer'
import { mulberry32 } from '../chain/geometry'
import type { RigProps } from './types'

const vert = /* glsl */ `
attribute float aIndex; uniform float uHead; varying float vGlow;
void main(){
  float d = uHead - aIndex;
  vGlow = d < 0.0 ? 0.0 : exp(-d * 1.4);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`
const frag = /* glsl */ `
uniform vec3 uColor; uniform vec3 uHot; uniform float uIntensity; varying float vGlow;
void main(){ gl_FragColor = vec4(mix(uColor, uHot, vGlow), (0.22 + vGlow * 0.9) * uIntensity); }`

function buildGraph(seed: number) {
  const rnd = mulberry32(seed)
  const nodes: THREE.Vector3[] = []
  const count = 14
  for (let i = 0; i < count; i++) {
    const x = -2.6 + (i / (count - 1)) * 5.2 + (rnd() - 0.5) * 0.5
    nodes.push(new THREE.Vector3(x, (rnd() - 0.5) * 2.4, (rnd() - 0.5) * 1.2 - 0.6))
  }
  // path edges left→right with occasional side hops
  const pos: number[] = []
  const idx: number[] = []
  const path: THREE.Vector3[] = []
  let edgeIndex = 0
  for (let i = 0; i < count - 1; i++) {
    const a = nodes[i]
    const b = nodes[i + 1]
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z)
    idx.push(edgeIndex, edgeIndex + 1)
    path.push(a)
    edgeIndex++
    if (rnd() < 0.4 && i + 2 < count) {
      const c = nodes[i + 2]
      pos.push(b.x, b.y, b.z, c.x, c.y, c.z)
      idx.push(edgeIndex + 3, edgeIndex + 4) // side branch lights later, faintly
    }
  }
  path.push(nodes[count - 1])
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('aIndex', new THREE.Float32BufferAttribute(idx, 1))
  return { geo, nodes, path, edges: count - 1 }
}

/** Cognitive — Propagate. A signal packet hops nodes of a sparse graph; edges flash in sequence. */
export function PropagateRig({ geometry, tint, accent, glow, lod, intensity, tempo, seed }: RigProps) {
  const { geo, nodes, path, edges } = useMemo(() => buildGraph(seed), [seed])
  const uniforms = useMemo(
    () => ({ uHead: { value: -1 }, uColor: { value: new THREE.Color(tint) }, uHot: { value: new THREE.Color(accent) }, uIntensity: { value: intensity } }),
    [tint, accent, intensity],
  )
  const packet = useRef<THREE.Mesh>(null)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 0.22 * tempo
    const c = t.current % 1
    const head = c * (edges + 2) - 1
    uniforms.uHead.value = head
    uniforms.uIntensity.value = intensity
    if (packet.current) {
      const i = Math.max(0, Math.min(path.length - 2, Math.floor(head)))
      const f = THREE.MathUtils.clamp(head - i, 0, 1)
      packet.current.position.lerpVectors(path[i], path[i + 1], f)
      packet.current.visible = head >= 0 && head <= edges
    }
  })
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5.8]} fov={40} />
      <lineSegments geometry={geo}>
        <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} />
      </lineSegments>
      {nodes.map((n, i) => (
        <mesh key={i} position={n}>
          <sphereGeometry args={[0.05, 8, 6]} />
          <meshBasicMaterial color={glow} transparent opacity={0.6} />
        </mesh>
      ))}
      <mesh ref={packet}>
        <sphereGeometry args={[0.11, 12, 8]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      <ChainRenderer geometry={geometry} tint={tint} accent={accent} lod={lod} intensity={intensity} fit={0.6} rotate={0.22 * tempo} tempo={tempo} />
    </>
  )
}
