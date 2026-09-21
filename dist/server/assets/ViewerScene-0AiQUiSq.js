import { jsxs, jsx } from "react/jsx-runtime";
import { E as Environment, L as Lightformer, a as EffectComposer, B as Bloom, N as Noise, b as BlendFunction, V as Vignette } from "./index-DMfJEjyv.js";
import { useRef, useEffect } from "react";
import { C as ChainRenderer } from "./ChainRenderer-DYgLieBk.js";
import { a0 as usePostAllowed, j as useThree, m as useFrame, M as MathUtils } from "./router-CxtrX1wR.js";
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
function ViewerScene({ geometry, tint, accent, labels, reducedEffects, autoRotate, scrollRef }) {
  const post = usePostAllowed();
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  const orbit = useRef(null);
  const rot = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const progress = useRef(1);
  const drag = useRef(null);
  useEffect(() => {
    const el = gl.domElement;
    const down = (e) => {
      drag.current = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
    };
    const move = (e) => {
      if (!drag.current) return;
      rot.current.ty += (e.clientX - drag.current.x) * 8e-3;
      rot.current.tx += (e.clientY - drag.current.y) * 8e-3;
      drag.current = { x: e.clientX, y: e.clientY };
    };
    const up = () => {
      drag.current = null;
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.style.cursor = "grab";
    el.style.touchAction = "pan-y";
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [gl]);
  const fit = 4.2;
  const born = useRef(0);
  useFrame((state, dt) => {
    if (!born.current) born.current = state.clock.elapsedTime;
    const age = state.clock.elapsedTime - born.current;
    const intro = MathUtils.clamp((age - 0.2) / 2.6, 0, 1);
    const s = scrollRef?.current ?? 0;
    const leave = MathUtils.clamp((s - 0.6) / 0.4, 0, 1);
    progress.current = intro * (1 - 0.55 * leave);
    const r = rot.current;
    if (autoRotate && !drag.current) r.ty += dt * 0.12;
    r.x += (r.tx - r.x) * Math.min(1, dt * 6);
    r.y += (r.ty - r.y) * Math.min(1, dt * 6);
    if (orbit.current) orbit.current.rotation.set(MathUtils.clamp(r.x, -1.2, 1.2), r.y, 0);
    const long = geometry.length > 20;
    const z = long ? 15.5 : 12.5;
    camera.position.set(0, 0.3, z - progress.current * 1.2);
    camera.lookAt(0, 0, 0);
  });
  return /* @__PURE__ */ jsxs("group", { children: [
    /* @__PURE__ */ jsx("fog", { attach: "fog", args: ["#0A0B0E", 12, 34] }),
    /* @__PURE__ */ jsx(Environment, { resolution: 64, frames: 1, children: /* @__PURE__ */ jsxs("group", { rotation: [-Math.PI / 3, 0, 0], children: [
      /* @__PURE__ */ jsx(Lightformer, { intensity: 2, color: tint, "rotation-x": Math.PI / 2, position: [0, 5, -9], scale: [10, 10, 1] }),
      /* @__PURE__ */ jsx(Lightformer, { intensity: 1, color: accent, "rotation-y": Math.PI / 2, position: [-6, 1, -1], scale: [12, 3, 1] }),
      /* @__PURE__ */ jsx(Lightformer, { intensity: 0.8, color: "#F2EEE6", "rotation-y": -Math.PI / 2, position: [7, 2, 0], scale: [10, 2, 1] })
    ] }) }),
    /* @__PURE__ */ jsx("group", { ref: orbit, children: /* @__PURE__ */ jsx(ChainRenderer, { geometry, progress, lod: 0, fitMode: "fixed", fit, rotate: 0, tint, accent, labels, reducedEffects, tilt: [0.1, 0.2, 0] }) }),
    post && !reducedEffects && /* @__PURE__ */ jsxs(EffectComposer, { multisampling: 0, children: [
      /* @__PURE__ */ jsx(Bloom, { intensity: 0.45, luminanceThreshold: 0.55, luminanceSmoothing: 0.3, mipmapBlur: true }),
      /* @__PURE__ */ jsx(Noise, { opacity: 0.05, blendFunction: BlendFunction.OVERLAY }),
      /* @__PURE__ */ jsx(Vignette, { eskil: false, offset: 0.3, darkness: 0.7 })
    ] })
  ] });
}
export {
  ViewerScene
};
