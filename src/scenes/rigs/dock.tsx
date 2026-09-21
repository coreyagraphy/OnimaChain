import { useFrame } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei/core/PerspectiveCamera'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { ChainRenderer } from '../chain/ChainRenderer'
import type { RigProps } from './types'

const vert = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`
const frag = /* glsl */ `
uniform float uPulse; uniform vec3 uColor; uniform float uIntensity;
varying vec2 vUv;
void main(){
  vec2 p = vUv - 0.5;
  float d = length(p) * 2.0;
  // expanding ring: radius = uPulse, fades as it grows
  float ring = smoothstep(0.06, 0.0, abs(d - uPulse)) * (1.0 - uPulse);
  float inner = smoothstep(uPulse, uPulse - 0.5, d) * 0.15 * (1.0 - uPulse);
  float a = (ring + inner) * uIntensity;
  if (a < 0.01) discard;
  gl_FragColor = vec4(uColor, a);
}`

/** Metabolic — Dock. The chain (ligand) approaches a receptor ring; on contact a signal wave propagates. */
export function DockRig({ geometry, tint, accent, glow, lod, intensity, tempo }: RigProps) {
  const ligand = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const uniforms = useMemo(
    () => ({ uPulse: { value: 1 }, uColor: { value: new THREE.Color(accent) }, uIntensity: { value: intensity } }),
    [accent, intensity],
  )
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt * 0.35 * tempo
    const cycle = t.current % 1
    // 0–0.55 approach, 0.55–0.75 contact (pulse), 0.75–1 retreat
    let x: number
    if (cycle < 0.55) x = THREE.MathUtils.lerp(1.7, 0.15, easeInOut(cycle / 0.55))
    else if (cycle < 0.75) x = 0.1
    else x = THREE.MathUtils.lerp(0.15, 1.7, easeInOut((cycle - 0.75) / 0.25))
    if (ligand.current) {
      ligand.current.position.x = x
      ligand.current.rotation.z = Math.sin(t.current * 2) * 0.15
    }
    const pulse = cycle < 0.55 ? 1 : cycle < 0.95 ? (cycle - 0.55) / 0.4 : 1
    uniforms.uPulse.value = pulse
    uniforms.uIntensity.value = intensity * (cycle > 0.55 && cycle < 0.95 ? 1 : 0)
    if (ring.current) {
      ring.current.rotation.y += dt * 0.4
      const m = ring.current.material as THREE.MeshStandardMaterial
      m.emissiveIntensity = 0.5 + (cycle > 0.55 && cycle < 0.8 ? 1.6 : 0) * intensity
    }
  })
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.4, 6.2]} fov={38} />
      <group position={[-1.1, 0, 0]}>
        <mesh ref={ring} rotation={[0, 0, 0]}>
          <torusGeometry args={[1.05, 0.08, 10, 48]} />
          <meshStandardMaterial color={tint} emissive={glow} emissiveIntensity={0.5} roughness={0.4} />
        </mesh>
        <mesh>
          <planeGeometry args={[5, 5]} />
          <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
      <group ref={ligand}>
        <ChainRenderer geometry={geometry} tint={tint} accent={accent} lod={lod} intensity={intensity} fit={0.4} rotate={0.5 * tempo} tempo={tempo} />
      </group>
    </>
  )
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}
