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
uniform float uTime; uniform float uRadius; uniform vec3 uWarm; uniform vec3 uCool; uniform float uIntensity; uniform vec2 uCenter;
varying vec2 vUv;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
void main(){
  vec2 p = vUv - uCenter;
  float d = length(p);
  float n = noise(p * 6.0 + uTime * 0.15) * 0.35 + noise(p * 14.0 - uTime * 0.1) * 0.15;
  float front = smoothstep(uRadius + 0.05, uRadius - 0.25, d + n * 0.25);
  float core = exp(-d * 6.0) * 0.8;
  float field = (front * 0.55 + core) * uIntensity;
  vec3 col = mix(uCool, uWarm, clamp(front + core, 0.0, 1.0));
  float a = field * (0.5 + 0.5 * n);
  if (a < 0.01) discard;
  gl_FragColor = vec4(col, a);
}`

/** Dermal — Bloom. A radial diffusion field spreads from a warm point. */
export function BloomRig({ geometry, tint, accent, glow, lod, intensity, tempo }: RigProps) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRadius: { value: 0 },
      uWarm: { value: new THREE.Color(accent) },
      uCool: { value: new THREE.Color(tint) },
      uIntensity: { value: intensity },
      uCenter: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    [accent, tint, intensity],
  )
  const light = useRef<THREE.PointLight>(null)
  const t = useRef(0)
  useFrame((_, dt) => {
    t.current += dt
    uniforms.uTime.value = t.current
    const c = (t.current * 0.16 * tempo) % 1
    // spread 0–0.7, settle, fade
    const r = Math.pow(Math.min(1, c / 0.7), 0.6) * 0.75
    uniforms.uRadius.value = r
    uniforms.uIntensity.value = intensity * (c > 0.8 ? 1 - (c - 0.8) / 0.2 : 1)
    if (light.current) light.current.intensity = (1.5 + 3 * Math.min(1, c / 0.3)) * intensity
  })
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 5.6]} fov={40} />
      <pointLight ref={light} position={[0.6, 0.4, 1.2]} color={accent} distance={7} decay={1.6} />
      <mesh position={[0, 0, -1.2]}>
        <planeGeometry args={[7, 7]} />
        <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <ChainRenderer geometry={geometry} tint={glow} accent={accent} lod={lod} intensity={intensity * 1.2} fit={0.7} rotate={0.15 * tempo} tempo={tempo} />
    </>
  )
}
