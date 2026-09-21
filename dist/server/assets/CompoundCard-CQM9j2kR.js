import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useRef, useMemo, useState, Suspense, lazy } from "react";
import { j as useThree, W as WebGLRenderTarget, H as HalfFloatType, k as LinearFilter, D as DepthTexture, F as FloatType, m as useFrame, n as Color, M as MathUtils, A as AdditiveBlending, V as Vector3, o as Matrix4, Q as Quaternion, p as mulberry32, B as BufferGeometry, q as Float32BufferAttribute, r as Vector2, t as DoubleSide, v as dominantClass, i as CLASS_COLORS, w as hashString, x as buildChain, y as buildPlaceholder, z as SceneView, g as displayName } from "./router-CxtrX1wR.js";
import { D as DOMAIN_BY_ID, d as distributionFor, l as latestChangeFor } from "./evidence-Dz2qVTbe.js";
import _extends from "@babel/runtime/helpers/esm/extends";
import { C as ChainRenderer } from "./ChainRenderer-DYgLieBk.js";
import { S as SequenceSVG } from "./SequenceSVG-qNlYzj3F.js";
import { p as provenanceText } from "./SourceBadge-DFiLYoWt.js";
function useFBO(width, height, settings) {
  const size = useThree((state) => state.size);
  const viewport = useThree((state) => state.viewport);
  const _width = typeof width === "number" ? width : size.width * viewport.dpr;
  const _height = size.height * viewport.dpr;
  const _settings = (typeof width === "number" ? settings : width) || {};
  const {
    samples = 0,
    depth,
    ...targetSettings
  } = _settings;
  const depthBuffer = depth !== null && depth !== void 0 ? depth : _settings.depthBuffer;
  const target = React.useMemo(() => {
    const target2 = new WebGLRenderTarget(_width, _height, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      type: HalfFloatType,
      ...targetSettings
    });
    if (depthBuffer) {
      target2.depthTexture = new DepthTexture(_width, _height, FloatType);
    }
    target2.samples = samples;
    return target2;
  }, []);
  React.useLayoutEffect(() => {
    target.setSize(_width, _height);
    if (samples) target.samples = samples;
  }, [samples, target, _width, _height]);
  React.useEffect(() => {
    return () => target.dispose();
  }, []);
  return target;
}
const isFunction = (node) => typeof node === "function";
const PerspectiveCamera = /* @__PURE__ */ React.forwardRef(({
  envMap,
  resolution = 256,
  frames = Infinity,
  makeDefault,
  children,
  ...props
}, ref) => {
  const set = useThree(({
    set: set2
  }) => set2);
  const camera = useThree(({
    camera: camera2
  }) => camera2);
  const size = useThree(({
    size: size2
  }) => size2);
  const cameraRef = React.useRef(null);
  React.useImperativeHandle(ref, () => cameraRef.current, []);
  const groupRef = React.useRef(null);
  const fbo = useFBO(resolution);
  React.useLayoutEffect(() => {
    if (!props.manual) {
      cameraRef.current.aspect = size.width / size.height;
    }
  }, [size, props]);
  React.useLayoutEffect(() => {
    cameraRef.current.updateProjectionMatrix();
  });
  let count = 0;
  let oldEnvMap = null;
  const functional = isFunction(children);
  useFrame((state) => {
    if (functional && (frames === Infinity || count < frames)) {
      groupRef.current.visible = false;
      state.gl.setRenderTarget(fbo);
      oldEnvMap = state.scene.background;
      if (envMap) state.scene.background = envMap;
      state.gl.render(state.scene, cameraRef.current);
      state.scene.background = oldEnvMap;
      state.gl.setRenderTarget(null);
      groupRef.current.visible = true;
      count++;
    }
  });
  React.useLayoutEffect(() => {
    if (makeDefault) {
      const oldCam = camera;
      set(() => ({
        camera: cameraRef.current
      }));
      return () => set(() => ({
        camera: oldCam
      }));
    }
  }, [cameraRef, makeDefault, set]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("perspectiveCamera", _extends({
    ref: cameraRef
  }, props), !functional && children), /* @__PURE__ */ React.createElement("group", {
    ref: groupRef
  }, functional && children(fbo.texture)));
});
const vert$3 = (
  /* glsl */
  `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`
);
const frag$3 = (
  /* glsl */
  `
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
);
function DockRig({ geometry, tint, accent, glow, lod, intensity, tempo }) {
  const ligand = useRef(null);
  const ring = useRef(null);
  const uniforms = useMemo(
    () => ({ uPulse: { value: 1 }, uColor: { value: new Color(accent) }, uIntensity: { value: intensity } }),
    [accent, intensity]
  );
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt * 0.35 * tempo;
    const cycle = t.current % 1;
    let x;
    if (cycle < 0.55) x = MathUtils.lerp(1.7, 0.15, easeInOut(cycle / 0.55));
    else if (cycle < 0.75) x = 0.1;
    else x = MathUtils.lerp(0.15, 1.7, easeInOut((cycle - 0.75) / 0.25));
    if (ligand.current) {
      ligand.current.position.x = x;
      ligand.current.rotation.z = Math.sin(t.current * 2) * 0.15;
    }
    const pulse = cycle < 0.55 ? 1 : cycle < 0.95 ? (cycle - 0.55) / 0.4 : 1;
    uniforms.uPulse.value = pulse;
    uniforms.uIntensity.value = intensity * (cycle > 0.55 && cycle < 0.95 ? 1 : 0);
    if (ring.current) {
      ring.current.rotation.y += dt * 0.4;
      const m = ring.current.material;
      m.emissiveIntensity = 0.5 + (cycle > 0.55 && cycle < 0.8 ? 1.6 : 0) * intensity;
    }
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PerspectiveCamera, { makeDefault: true, position: [0, 0.4, 6.2], fov: 38 }),
    /* @__PURE__ */ jsxs("group", { position: [-1.1, 0, 0], children: [
      /* @__PURE__ */ jsxs("mesh", { ref: ring, rotation: [0, 0, 0], children: [
        /* @__PURE__ */ jsx("torusGeometry", { args: [1.05, 0.08, 10, 48] }),
        /* @__PURE__ */ jsx("meshStandardMaterial", { color: tint, emissive: glow, emissiveIntensity: 0.5, roughness: 0.4 })
      ] }),
      /* @__PURE__ */ jsxs("mesh", { children: [
        /* @__PURE__ */ jsx("planeGeometry", { args: [5, 5] }),
        /* @__PURE__ */ jsx("shaderMaterial", { vertexShader: vert$3, fragmentShader: frag$3, uniforms, transparent: true, depthWrite: false, blending: AdditiveBlending })
      ] })
    ] }),
    /* @__PURE__ */ jsx("group", { ref: ligand, children: /* @__PURE__ */ jsx(ChainRenderer, { geometry, tint, accent, lod, intensity, fit: 0.4, rotate: 0.5 * tempo, tempo }) })
  ] });
}
function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
const N$1 = 90;
const M$1 = new Matrix4();
const V$1 = new Vector3();
const S$1 = new Vector3();
const Q$1 = new Quaternion();
function nightWeight(date = /* @__PURE__ */ new Date()) {
  const h = date.getHours() + date.getMinutes() / 60;
  return 0.5 + 0.5 * Math.cos((h - 3) / 24 * Math.PI * 2);
}
function PulseRig({ geometry, tint, accent, glow, lod, intensity, tempo, seed }) {
  const inst = useRef(null);
  const light = useRef(null);
  const dirs = useMemo(() => {
    const rnd = mulberry32(seed);
    const arr = new Float32Array(N$1 * 3);
    for (let i = 0; i < N$1; i++) {
      const u = rnd() * 2 - 1;
      const phi = rnd() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      arr[i * 3] = s * Math.cos(phi);
      arr[i * 3 + 1] = s * Math.sin(phi);
      arr[i * 3 + 2] = u;
    }
    return arr;
  }, [seed]);
  const t = useRef(0);
  const burstAge = useRef(10);
  const lastBeat = useRef(-1);
  const nw = useMemo(() => nightWeight(), []);
  useFrame((_, dt) => {
    t.current += dt;
    const rate = 0.9 * tempo;
    const phase = t.current * rate;
    const beat = Math.pow(Math.max(0, Math.sin(phase * Math.PI)), 6);
    const beatIndex = Math.floor(phase);
    if (beatIndex !== lastBeat.current) {
      lastBeat.current = beatIndex;
      burstAge.current = 0;
    }
    burstAge.current += dt;
    const e = (0.25 + 0.75 * nw) * (0.6 + beat * 1.8) * intensity;
    if (light.current) light.current.intensity = e * 4;
    if (inst.current) {
      const age = burstAge.current;
      const r = 0.6 + age * 1.6;
      const alpha = Math.max(0, 1 - age / 1.4);
      for (let i = 0; i < N$1; i++) {
        V$1.set(dirs[i * 3] * r, dirs[i * 3 + 1] * r, dirs[i * 3 + 2] * r);
        S$1.setScalar(0.035 * alpha * (0.5 + nw));
        M$1.compose(V$1, Q$1, S$1);
        inst.current.setMatrixAt(i, M$1);
      }
      inst.current.instanceMatrix.needsUpdate = true;
    }
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PerspectiveCamera, { makeDefault: true, position: [0, 0, 5.4], fov: 40 }),
    /* @__PURE__ */ jsx("pointLight", { ref: light, color: glow, position: [0, 0, 0.6], distance: 8, decay: 1.5 }),
    /* @__PURE__ */ jsx(ChainRenderer, { geometry, tint, accent, lod, intensity: intensity * (0.7 + nw * 0.6), fit: 0.7, rotate: 0.18 * tempo, tempo }),
    /* @__PURE__ */ jsxs("instancedMesh", { ref: inst, args: [void 0, void 0, N$1], frustumCulled: false, children: [
      /* @__PURE__ */ jsx("sphereGeometry", { args: [1, 6, 4] }),
      /* @__PURE__ */ jsx("meshBasicMaterial", { color: glow, transparent: true, opacity: 0.9 })
    ] })
  ] });
}
const vert$2 = (
  /* glsl */
  `
attribute float aBirth; attribute float aLife;
uniform float uGrowth;
varying float vAlpha;
void main(){
  float t = clamp((uGrowth - aBirth) / max(aLife, 0.001), 0.0, 1.0);
  vAlpha = t;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`
);
const frag$2 = (
  /* glsl */
  `
uniform vec3 uColor; uniform float uIntensity;
varying float vAlpha;
void main(){ if (vAlpha <= 0.0) discard; gl_FragColor = vec4(uColor, vAlpha * 0.85 * uIntensity); }`
);
function buildNetwork(seed) {
  const rnd = mulberry32(seed);
  const pos = [];
  const birth = [];
  const life = [];
  const grow = (x, y, ang, len, depth, t0) => {
    if (depth > 5 || len < 0.08) return;
    const nx = x + Math.cos(ang) * len;
    const ny = y + Math.sin(ang) * len;
    pos.push(x, y, 0, nx, ny, 0);
    const dur = len * 0.9;
    birth.push(t0, t0);
    life.push(dur, dur);
    const toCentre = Math.atan2(-ny, -nx);
    const branches = rnd() < 0.55 ? 2 : 1;
    for (let b = 0; b < branches; b++) {
      const bias = 0.35;
      const na = ang * (1 - bias) + toCentre * bias + (rnd() - 0.5) * 1.1;
      grow(nx, ny, na, len * (0.62 + rnd() * 0.25), depth + 1, t0 + dur);
    }
  };
  const roots = 7;
  for (let i = 0; i < roots; i++) {
    const a = i / roots * Math.PI * 2 + rnd() * 0.6;
    const R = 2.4;
    const x = Math.cos(a) * R;
    const y = Math.sin(a) * R;
    grow(x, y, Math.atan2(-y, -x) + (rnd() - 0.5) * 0.8, 0.55 + rnd() * 0.35, 0, rnd() * 0.3);
  }
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
  geo.setAttribute("aBirth", new Float32BufferAttribute(birth, 1));
  geo.setAttribute("aLife", new Float32BufferAttribute(life, 1));
  return geo;
}
function BranchRig({ geometry, tint, accent, glow, lod, intensity, tempo, seed }) {
  const geo = useMemo(() => buildNetwork(seed), [seed]);
  const uniforms = useMemo(
    () => ({ uGrowth: { value: 0 }, uColor: { value: new Color(glow) }, uIntensity: { value: intensity } }),
    [glow, intensity]
  );
  const mask = useRef(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt * 0.28 * tempo;
    const c = t.current % 1;
    const growth = Math.min(1, c / 0.7) * 3.2;
    uniforms.uGrowth.value = growth;
    uniforms.uIntensity.value = intensity * (c > 0.85 ? 1 - (c - 0.85) / 0.15 : 1);
    if (mask.current) {
      const m = mask.current.material;
      m.opacity = 0.18 * Math.max(0, 1 - c / 0.7) * intensity;
    }
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PerspectiveCamera, { makeDefault: true, position: [0, 0, 5.2], fov: 42 }),
    /* @__PURE__ */ jsxs("mesh", { ref: mask, position: [0, 0, -0.4], children: [
      /* @__PURE__ */ jsx("circleGeometry", { args: [0.9, 32] }),
      /* @__PURE__ */ jsx("meshBasicMaterial", { color: accent, transparent: true, opacity: 0.15 })
    ] }),
    /* @__PURE__ */ jsx("lineSegments", { geometry: geo, position: [0, 0, -0.3], children: /* @__PURE__ */ jsx("shaderMaterial", { vertexShader: vert$2, fragmentShader: frag$2, uniforms, transparent: true, depthWrite: false }) }),
    /* @__PURE__ */ jsx(ChainRenderer, { geometry, tint, accent, lod, intensity, fit: 0.62, rotate: 0.2 * tempo, tempo })
  ] });
}
const vert$1 = (
  /* glsl */
  `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`
);
const frag$1 = (
  /* glsl */
  `
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
);
function BloomRig({ geometry, tint, accent, glow, lod, intensity, tempo }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRadius: { value: 0 },
      uWarm: { value: new Color(accent) },
      uCool: { value: new Color(tint) },
      uIntensity: { value: intensity },
      uCenter: { value: new Vector2(0.5, 0.5) }
    }),
    [accent, tint, intensity]
  );
  const light = useRef(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    uniforms.uTime.value = t.current;
    const c = t.current * 0.16 * tempo % 1;
    const r = Math.pow(Math.min(1, c / 0.7), 0.6) * 0.75;
    uniforms.uRadius.value = r;
    uniforms.uIntensity.value = intensity * (c > 0.8 ? 1 - (c - 0.8) / 0.2 : 1);
    if (light.current) light.current.intensity = (1.5 + 3 * Math.min(1, c / 0.3)) * intensity;
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PerspectiveCamera, { makeDefault: true, position: [0, 0, 5.6], fov: 40 }),
    /* @__PURE__ */ jsx("pointLight", { ref: light, position: [0.6, 0.4, 1.2], color: accent, distance: 7, decay: 1.6 }),
    /* @__PURE__ */ jsxs("mesh", { position: [0, 0, -1.2], children: [
      /* @__PURE__ */ jsx("planeGeometry", { args: [7, 7] }),
      /* @__PURE__ */ jsx("shaderMaterial", { vertexShader: vert$1, fragmentShader: frag$1, uniforms, transparent: true, depthWrite: false, blending: AdditiveBlending })
    ] }),
    /* @__PURE__ */ jsx(ChainRenderer, { geometry, tint: glow, accent, lod, intensity: intensity * 1.2, fit: 0.7, rotate: 0.15 * tempo, tempo })
  ] });
}
const vert = (
  /* glsl */
  `
attribute float aIndex; uniform float uHead; varying float vGlow;
void main(){
  float d = uHead - aIndex;
  vGlow = d < 0.0 ? 0.0 : exp(-d * 1.4);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`
);
const frag = (
  /* glsl */
  `
uniform vec3 uColor; uniform vec3 uHot; uniform float uIntensity; varying float vGlow;
void main(){ gl_FragColor = vec4(mix(uColor, uHot, vGlow), (0.22 + vGlow * 0.9) * uIntensity); }`
);
function buildGraph(seed) {
  const rnd = mulberry32(seed);
  const nodes = [];
  const count = 14;
  for (let i = 0; i < count; i++) {
    const x = -2.6 + i / (count - 1) * 5.2 + (rnd() - 0.5) * 0.5;
    nodes.push(new Vector3(x, (rnd() - 0.5) * 2.4, (rnd() - 0.5) * 1.2 - 0.6));
  }
  const pos = [];
  const idx = [];
  const path = [];
  let edgeIndex = 0;
  for (let i = 0; i < count - 1; i++) {
    const a = nodes[i];
    const b = nodes[i + 1];
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
    idx.push(edgeIndex, edgeIndex + 1);
    path.push(a);
    edgeIndex++;
    if (rnd() < 0.4 && i + 2 < count) {
      const c = nodes[i + 2];
      pos.push(b.x, b.y, b.z, c.x, c.y, c.z);
      idx.push(edgeIndex + 3, edgeIndex + 4);
    }
  }
  path.push(nodes[count - 1]);
  const geo = new BufferGeometry();
  geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
  geo.setAttribute("aIndex", new Float32BufferAttribute(idx, 1));
  return { geo, nodes, path, edges: count - 1 };
}
function PropagateRig({ geometry, tint, accent, glow, lod, intensity, tempo, seed }) {
  const { geo, nodes, path, edges } = useMemo(() => buildGraph(seed), [seed]);
  const uniforms = useMemo(
    () => ({ uHead: { value: -1 }, uColor: { value: new Color(tint) }, uHot: { value: new Color(accent) }, uIntensity: { value: intensity } }),
    [tint, accent, intensity]
  );
  const packet = useRef(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt * 0.22 * tempo;
    const c = t.current % 1;
    const head = c * (edges + 2) - 1;
    uniforms.uHead.value = head;
    uniforms.uIntensity.value = intensity;
    if (packet.current) {
      const i = Math.max(0, Math.min(path.length - 2, Math.floor(head)));
      const f = MathUtils.clamp(head - i, 0, 1);
      packet.current.position.lerpVectors(path[i], path[i + 1], f);
      packet.current.visible = head >= 0 && head <= edges;
    }
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PerspectiveCamera, { makeDefault: true, position: [0, 0, 5.8], fov: 40 }),
    /* @__PURE__ */ jsx("lineSegments", { geometry: geo, children: /* @__PURE__ */ jsx("shaderMaterial", { vertexShader: vert, fragmentShader: frag, uniforms, transparent: true, depthWrite: false }) }),
    nodes.map((n, i) => /* @__PURE__ */ jsxs("mesh", { position: n, children: [
      /* @__PURE__ */ jsx("sphereGeometry", { args: [0.05, 8, 6] }),
      /* @__PURE__ */ jsx("meshBasicMaterial", { color: glow, transparent: true, opacity: 0.6 })
    ] }, i)),
    /* @__PURE__ */ jsxs("mesh", { ref: packet, children: [
      /* @__PURE__ */ jsx("sphereGeometry", { args: [0.11, 12, 8] }),
      /* @__PURE__ */ jsx("meshBasicMaterial", { color: accent })
    ] }),
    /* @__PURE__ */ jsx(ChainRenderer, { geometry, tint, accent, lod, intensity, fit: 0.6, rotate: 0.22 * tempo, tempo })
  ] });
}
function ReknitRig({ geometry, tint, accent, glow, lod, intensity, tempo }) {
  const progress = useRef(0);
  const g = useRef(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt * 0.11 * tempo;
    const c = t.current % 1;
    let p;
    if (c < 0.5) p = easeInOutSine(c / 0.5);
    else if (c < 0.86) p = 1;
    else p = 1 - easeInOutSine((c - 0.86) / 0.14);
    progress.current = p;
    if (g.current) g.current.rotation.x = Math.sin(t.current * 1.7) * 0.25;
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PerspectiveCamera, { makeDefault: true, position: [0, 0, 5.4], fov: 40 }),
    /* @__PURE__ */ jsx("pointLight", { position: [0, 2, 2], color: glow, intensity: 2 * intensity, distance: 8 }),
    /* @__PURE__ */ jsx("group", { ref: g, children: /* @__PURE__ */ jsx(ChainRenderer, { geometry, progress, tint, accent, lod, intensity, fit: 0.75, rotate: 0.1 * tempo, tempo }) })
  ] });
}
function easeInOutSine(x) {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}
const N = 40;
const M = new Matrix4();
const V = new Vector3();
const S = new Vector3();
const Q = new Quaternion();
function SweepRig({ geometry, tint, accent, glow, lod, intensity, tempo, seed }) {
  const pts = useMemo(() => {
    const rnd = mulberry32(seed);
    const arr = [];
    for (let i = 0; i < N; i++) arr.push({ a: rnd() * Math.PI * 2, r: 1.5 + rnd() * 1.3, z: (rnd() - 0.5) * 0.6 - 0.8 });
    return arr;
  }, [seed]);
  const foreign = useMemo(() => Math.floor(mulberry32(seed ^ 77)() * N), [seed]);
  const inst = useRef(null);
  const cone = useRef(null);
  const flag = useRef(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt * tempo;
    const period = 6;
    const c = t.current % period / period;
    const target = pts[foreign].a;
    let ang;
    if (c < 0.6) ang = target - Math.PI * 2 + c / 0.6 * Math.PI * 2;
    else if (c < 0.8) ang = target + Math.sin(t.current * 30) * 0.01;
    else ang = target + (c - 0.8) / 0.2 * Math.PI * 0.8;
    const locked = c >= 0.6 && c < 0.8;
    if (cone.current) {
      cone.current.rotation.z = ang;
      const m = cone.current.material;
      m.opacity = (locked ? 0.22 : 0.09) * intensity;
    }
    if (inst.current) {
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        V.set(Math.cos(p.a) * p.r, Math.sin(p.a) * p.r, p.z);
        const lit = Math.cos(p.a - ang) > 0.96 ? 1.8 : 1;
        S.setScalar(0.045 * lit * (i === foreign && locked ? 2.4 : 1));
        M.compose(V, Q, S);
        inst.current.setMatrixAt(i, M);
      }
      inst.current.instanceMatrix.needsUpdate = true;
    }
    if (flag.current) {
      const p = pts[foreign];
      flag.current.position.set(Math.cos(p.a) * p.r, Math.sin(p.a) * p.r, p.z);
      const s = locked ? 1 + (c - 0.6) / 0.2 * 1.6 : 1e-4;
      flag.current.scale.setScalar(s);
      const m = flag.current.material;
      m.opacity = locked ? 1 - (c - 0.6) / 0.2 : 0;
    }
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(PerspectiveCamera, { makeDefault: true, position: [0, 0, 5.6], fov: 42 }),
    /* @__PURE__ */ jsxs("mesh", { ref: cone, position: [0, 0, -0.9], children: [
      /* @__PURE__ */ jsx("circleGeometry", { args: [3.2, 40, 0, 0.3] }),
      /* @__PURE__ */ jsx("meshBasicMaterial", { color: glow, transparent: true, opacity: 0.16, depthWrite: false, blending: AdditiveBlending, side: DoubleSide })
    ] }),
    /* @__PURE__ */ jsxs("instancedMesh", { ref: inst, args: [void 0, void 0, N], frustumCulled: false, children: [
      /* @__PURE__ */ jsx("sphereGeometry", { args: [1, 6, 4] }),
      /* @__PURE__ */ jsx("meshBasicMaterial", { color: tint, transparent: true, opacity: 0.75 })
    ] }),
    /* @__PURE__ */ jsxs("mesh", { ref: flag, children: [
      /* @__PURE__ */ jsx("ringGeometry", { args: [0.16, 0.2, 32] }),
      /* @__PURE__ */ jsx("meshBasicMaterial", { color: accent, transparent: true, depthWrite: false, side: DoubleSide })
    ] }),
    /* @__PURE__ */ jsx(ChainRenderer, { geometry, tint, accent, lod, intensity, fit: 0.55, rotate: 0.16 * tempo, tempo })
  ] });
}
function tempoFor(length) {
  return Math.max(0.55, Math.min(1.7, 1.9 - Math.log2(Math.max(2, length)) * 0.24));
}
const RIGS = {
  dock: DockRig,
  pulse: PulseRig,
  branch: BranchRig,
  bloom: BloomRig,
  propagate: PropagateRig,
  reknit: ReknitRig,
  sweep: SweepRig
};
function rigVariation(domain, geometry) {
  const d = DOMAIN_BY_ID[domain];
  const cls = geometry.placeholder ? "polar" : dominantClass(geometry.residues);
  return {
    tint: d.palette.base,
    accent: geometry.placeholder ? d.palette.accent : CLASS_COLORS[cls],
    glow: d.palette.glow,
    tempo: tempoFor(geometry.length),
    dominant: cls
  };
}
function geometryFor(compound, sequence, slug = "anon") {
  if (compound) return buildChain(compound);
  if (sequence) return buildChain({ slug, sequence, mods: [] });
  return buildPlaceholder(slug);
}
function DomainRig$1({ domain, compound, sequence, lod = 2, intensity = 1 }) {
  const geometry = useMemo(() => geometryFor(compound, sequence, compound?.slug), [compound, sequence]);
  const v = useMemo(() => rigVariation(domain, geometry), [domain, geometry]);
  const Rig = RIGS[DOMAIN_BY_ID[domain].rig];
  return /* @__PURE__ */ jsx(Rig, { geometry, tint: v.tint, accent: v.accent, glow: v.glow, lod, intensity, tempo: v.tempo, seed: hashString(geometry.slug) });
}
const index = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DomainRig: DomainRig$1,
  geometryFor,
  rigVariation
}, Symbol.toStringTag, { value: "Module" }));
const DomainRig = lazy(() => Promise.resolve().then(() => index).then((m) => ({ default: m.DomainRig })));
const LAYOUTS = ["portrait", "wide", "square"];
const SIZE = {
  portrait: "w-[260px] h-[360px]",
  wide: "w-[400px] h-[270px]",
  square: "w-[300px] h-[300px]"
};
function CompoundCard({ compound, index: index2, layout, fluid = false }) {
  const lay = layout ?? LAYOUTS[index2 % 3];
  const domain = DOMAIN_BY_ID[compound.domain];
  const geometry = useMemo(() => buildChain(compound), [compound]);
  const v = useMemo(() => rigVariation(compound.domain, geometry), [compound.domain, geometry]);
  const dist = distributionFor(compound.slug);
  const change = latestChangeFor(compound.slug);
  const prov = provenanceText(compound);
  const [hover, setHover] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  return /* @__PURE__ */ jsxs(
    Link,
    {
      to: "/compound/$slug",
      params: { slug: compound.slug },
      className: `card-tilt group block relative shrink-0 rounded-2xl overflow-hidden panel-flat ${fluid ? "w-full h-[340px]" : SIZE[lay]}`,
      style: { transform: hover ? `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px)` : void 0 },
      onPointerEnter: () => setHover(true),
      onPointerLeave: () => {
        setHover(false);
        setTilt({ x: 0, y: 0 });
      },
      onPointerMove: (e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTilt({ x: -((e.clientY - r.top) / r.height - 0.5) * 7, y: ((e.clientX - r.left) / r.width - 0.5) * 9 });
      },
      "aria-label": `${displayName(compound)} — ${domain.name}`,
      children: [
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0", style: { background: `radial-gradient(120% 90% at 50% 110%, ${v.tint}1f, transparent 60%)` } }),
        /* @__PURE__ */ jsx(
          SceneView,
          {
            className: "absolute left-0 right-0 top-10 bottom-[118px]",
            fallback: /* @__PURE__ */ jsx(SequenceSVG, { geometry, tint: v.tint, className: "absolute inset-0 w-full h-full p-4 opacity-90" }),
            children: /* @__PURE__ */ jsx(Suspense, { fallback: null, children: /* @__PURE__ */ jsx(DomainRig, { domain: compound.domain, compound, lod: 2, intensity: hover ? 1.6 : 1 }) })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "absolute inset-x-0 top-0 p-4 flex items-start justify-between pointer-events-none", children: [
          /* @__PURE__ */ jsx("span", { className: "label whitespace-nowrap", children: domain.name }),
          /* @__PURE__ */ jsx("span", { className: "label !text-bone/45 mono whitespace-nowrap", children: geometry.placeholder ? "seq. pending" : `${geometry.length} aa` })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "absolute inset-x-0 bottom-0 p-4 pointer-events-none", children: [
          /* @__PURE__ */ jsx("h3", { className: "display text-[22px] text-bone", children: displayName(compound) }),
          /* @__PURE__ */ jsx("div", { className: "mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5", "aria-label": "Evidence distribution", children: dist.total === 0 ? /* @__PURE__ */ jsx("span", { className: "text-[11px] faint", children: "No qualifying record is currently indexed in Cyravon’s corpus" }) : /* @__PURE__ */ jsx(Fragment, { children: [["in vitro", dist.inVitro, "#B9A2FF"], ["animal", dist.animal, "#5FE3FF"], ["human", dist.human, "#F2EEE6"], ["review", dist.review, "#8FB0FF"]].map(([l, n, c]) => /* @__PURE__ */ jsxs("span", { className: "mono text-[10px] text-bone/70 flex items-center gap-1 whitespace-nowrap", children: [
            /* @__PURE__ */ jsx("span", { className: "inline-block h-1.5 rounded-sm", style: { width: 6 + n * 8, background: n ? c : "rgba(242,238,230,0.15)" } }),
            n,
            " ",
            l
          ] }, l)) }) }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1.5 text-[11px] text-bone/50 truncate", children: [
            change ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs("span", { className: "text-amber", children: [
                "Δ ",
                change.date
              ] }),
              " ",
              change.change
            ] }) : "No change recorded",
            " · signal: none enabled"
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 mono text-[10px] text-bone/35 truncate", children: prov.primary })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "absolute inset-0 rounded-2xl ring-1 ring-inset ring-cyan/0 group-hover:ring-cyan/40 transition" })
      ]
    }
  );
}
export {
  CompoundCard as C
};
