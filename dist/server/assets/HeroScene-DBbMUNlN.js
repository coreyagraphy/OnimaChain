import { jsxs, jsx } from "react/jsx-runtime";
import { E as Environment, L as Lightformer, a as EffectComposer, D as DepthOfField, B as Bloom, N as Noise, b as BlendFunction, V as Vignette } from "./index-DMfJEjyv.js";
import { useRef, useMemo } from "react";
import { C as ChainRenderer } from "./ChainRenderer-DYgLieBk.js";
import { a0 as usePostAllowed, j as useThree, V as Vector3, x as buildChain, a as COMPOUND_BY_SLUG, a1 as CanvasTexture, m as useFrame, M as MathUtils, a2 as CatmullRomCurve3, A as AdditiveBlending, p as mulberry32 } from "./router-CxtrX1wR.js";
import "@babel/runtime/helpers/esm/extends";
import "three-stdlib";
import "@monogrid/gainmap-js";
import "maath";
import "n8ao";
import "react-dom/client";
import "./SequenceSVG-qNlYzj3F.js";
import "@tanstack/react-router";
import "zustand/traditional";
import "suspend-react";
import "scheduler";
import "its-fine";
import "react-use-measure";
import "tunnel-rat";
import "zustand";
import "lenis";
import "gsap";
import "gsap/ScrollTrigger";
const FIT = 5.6;
const CAM = new CatmullRomCurve3(
  [
    new Vector3(-5.6, -0.2, 16),
    new Vector3(-7.5, 1.4, 6.2),
    new Vector3(-2.4, 2.1, 3.9),
    new Vector3(1.8, 1.7, 3.5),
    new Vector3(5.8, 0.5, 4.4),
    new Vector3(8.8, 2, 11.5)
  ],
  false,
  "centripetal",
  0.5
);
const LOOK = new CatmullRomCurve3(
  [
    new Vector3(-3, -1.6, 0),
    new Vector3(-2.2, 0.2, 0),
    new Vector3(0.8, -0.5, -0.4),
    new Vector3(4, -0.7, -0.9),
    new Vector3(2, 0, 0),
    new Vector3(0.4, 0, 0)
  ],
  false,
  "centripetal",
  0.5
);
const _pos = new Vector3();
const _look = new Vector3();
function HeroScene({ progress, pointer, onPhase }) {
  const post = usePostAllowed();
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const root = useRef(null);
  const chain = useRef(null);
  const far = useRef(null);
  const mid = useRef(null);
  const near = useRef(null);
  const focus = useMemo(() => new Vector3(0, 0, 0), []);
  const smooth = useRef({ p: 0, px: 0, py: 0 });
  const geometry = useMemo(() => buildChain(COMPOUND_BY_SLUG["bpc-157"]), []);
  const { farDust, midDust, haze } = useMemo(() => {
    const rnd = mulberry32(1129927233);
    const farN = 1400;
    const farDust2 = new Float32Array(farN * 3);
    for (let i = 0; i < farN; i++) {
      farDust2[i * 3] = (rnd() - 0.5) * 90;
      farDust2[i * 3 + 1] = (rnd() - 0.5) * 50;
      farDust2[i * 3 + 2] = -18 - rnd() * 40;
    }
    const midN = 320;
    const midDust2 = new Float32Array(midN * 3);
    for (let i = 0; i < midN; i++) {
      midDust2[i * 3] = (rnd() - 0.5) * 34;
      midDust2[i * 3 + 1] = (rnd() - 0.5) * 18;
      midDust2[i * 3 + 2] = -4 + rnd() * 10;
    }
    const haze2 = [];
    for (let i = 0; i < 6; i++) haze2.push([(rnd() - 0.5) * 18, (rnd() - 0.5) * 8, 4 + rnd() * 4]);
    return { farDust: farDust2, midDust: midDust2, haze: haze2 };
  }, []);
  const hazeTex = useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d");
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(95,227,255,0.28)");
    g.addColorStop(0.5, "rgba(138,99,255,0.10)");
    g.addColorStop(1, "rgba(34,71,214,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new CanvasTexture(c);
  }, []);
  const t = useRef(0);
  useFrame((_, dt) => {
    t.current += dt;
    const s = smooth.current;
    const target = progress.current ?? 0;
    s.p += (target - s.p) * Math.min(1, dt * 4.5);
    s.px += ((pointer.current?.x ?? 0) - s.px) * Math.min(1, dt * 3);
    s.py += ((pointer.current?.y ?? 0) - s.py) * Math.min(1, dt * 3);
    const p = MathUtils.clamp(s.p, 0, 1);
    onPhase?.(p);
    CAM.getPointAt(p, _pos);
    LOOK.getPointAt(p, _look);
    const portrait = size.width / size.height < 0.8;
    if (portrait) {
      _pos.z += 3.5 * (1 - p * 0.5);
      _look.y -= 1.9 * (1 - Math.min(1, p / 0.3));
    }
    _pos.x += s.px * 0.35;
    _pos.y -= s.py * 0.25;
    camera.position.copy(_pos);
    camera.lookAt(_look);
    focus.copy(_look);
    if (root.current) {
      root.current.rotation.y = MathUtils.degToRad(s.px * 2);
      root.current.rotation.x = MathUtils.degToRad(-s.py * 2);
    }
    if (chain.current) {
      chain.current.position.y = Math.sin(t.current * 0.35) * 0.18;
      chain.current.rotation.x = Math.sin(t.current * 0.12) * 0.08 + p * 0.9;
      chain.current.rotation.z = Math.sin(t.current * 0.09) * 0.03;
    }
    if (far.current) far.current.position.x = -p * 6 + s.px * 0.6;
    if (mid.current) {
      mid.current.position.x = -p * 2 + s.px * 1.1;
      mid.current.rotation.z = t.current * 6e-3;
    }
    if (near.current) near.current.position.x = p * 5 + s.px * 1.6;
  });
  return /* @__PURE__ */ jsxs("group", { ref: root, children: [
    /* @__PURE__ */ jsx("color", { attach: "background", args: ["#0A0B0E"] }),
    /* @__PURE__ */ jsx("fog", { attach: "fog", args: ["#0A0B0E", 14, 46] }),
    /* @__PURE__ */ jsx(Environment, { resolution: 64, frames: 1, children: /* @__PURE__ */ jsxs("group", { rotation: [-Math.PI / 3, 0, 0], children: [
      /* @__PURE__ */ jsx(Lightformer, { intensity: 2.2, color: "#5FE3FF", "rotation-x": Math.PI / 2, position: [0, 5, -9], scale: [10, 10, 1] }),
      /* @__PURE__ */ jsx(Lightformer, { intensity: 1.2, color: "#8A63FF", "rotation-y": Math.PI / 2, position: [-6, 1, -1], scale: [12, 3, 1] }),
      /* @__PURE__ */ jsx(Lightformer, { intensity: 0.9, color: "#F2EEE6", "rotation-y": -Math.PI / 2, position: [7, 2, 0], scale: [10, 2, 1] }),
      /* @__PURE__ */ jsx(Lightformer, { intensity: 0.6, color: "#2247D6", "rotation-x": -Math.PI / 2, position: [0, -6, 0], scale: [12, 12, 1] })
    ] }) }),
    /* @__PURE__ */ jsxs("points", { ref: far, children: [
      /* @__PURE__ */ jsx("bufferGeometry", { children: /* @__PURE__ */ jsx("bufferAttribute", { attach: "attributes-position", args: [farDust, 3] }) }),
      /* @__PURE__ */ jsx("pointsMaterial", { color: "#7FB7D9", size: 0.075, sizeAttenuation: true, transparent: true, opacity: 0.5, depthWrite: false })
    ] }),
    /* @__PURE__ */ jsxs("points", { ref: mid, children: [
      /* @__PURE__ */ jsx("bufferGeometry", { children: /* @__PURE__ */ jsx("bufferAttribute", { attach: "attributes-position", args: [midDust, 3] }) }),
      /* @__PURE__ */ jsx("pointsMaterial", { color: "#B9A2FF", size: 0.05, sizeAttenuation: true, transparent: true, opacity: 0.55, depthWrite: false })
    ] }),
    /* @__PURE__ */ jsx("group", { ref: chain, children: /* @__PURE__ */ jsx(ChainRenderer, { geometry, progress: 1, lod: 0, fitMode: "fixed", fit: FIT, rotate: 0, tint: "#5FE3FF", accent: "#8A63FF", intensity: 1.15, tilt: [0.12, 0.18, 0], markers: false }) }),
    /* @__PURE__ */ jsx("group", { ref: near, children: hazeTex && haze.map((h, i) => /* @__PURE__ */ jsx("sprite", { position: h, scale: [9 + i % 3 * 3, 9 + i % 3 * 3, 1], children: /* @__PURE__ */ jsx("spriteMaterial", { map: hazeTex, transparent: true, opacity: 0.45, depthWrite: false, blending: AdditiveBlending }) }, i)) }),
    post && /* @__PURE__ */ jsxs(EffectComposer, { multisampling: 0, children: [
      /* @__PURE__ */ jsx(DepthOfField, { target: focus, focalLength: 0.028, bokehScale: 1.5, height: 540 }),
      /* @__PURE__ */ jsx(Bloom, { intensity: 0.55, luminanceThreshold: 0.5, luminanceSmoothing: 0.35, mipmapBlur: true }),
      /* @__PURE__ */ jsx(Noise, { opacity: 0.07, blendFunction: BlendFunction.OVERLAY }),
      /* @__PURE__ */ jsx(Vignette, { eskil: false, offset: 0.22, darkness: 0.9 })
    ] })
  ] });
}
export {
  HeroScene
};
