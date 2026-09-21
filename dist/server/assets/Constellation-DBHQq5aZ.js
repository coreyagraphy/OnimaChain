import { jsxs, jsx } from "react/jsx-runtime";
import { useRef, useMemo } from "react";
import { m as useFrame, t as DoubleSide, p as mulberry32 } from "./router-CxtrX1wR.js";
import "@tanstack/react-router";
import "zustand/traditional";
import "suspend-react";
import "scheduler";
import "its-fine";
import "react-use-measure";
import "@babel/runtime/helpers/esm/extends";
import "tunnel-rat";
import "zustand";
import "lenis";
import "gsap";
import "gsap/ScrollTrigger";
function Constellation() {
  const ref = useRef(null);
  const dust = useMemo(() => {
    const rnd = mulberry32(7);
    const n = 500;
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      a[i * 3] = (rnd() - 0.5) * 40;
      a[i * 3 + 1] = (rnd() - 0.5) * 22;
      a[i * 3 + 2] = -6 - rnd() * 20;
    }
    return a;
  }, []);
  const reports = useMemo(() => new Float32Array(0), []);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.01;
  });
  return /* @__PURE__ */ jsxs("group", { ref, children: [
    /* @__PURE__ */ jsx("fog", { attach: "fog", args: ["#0A0B0E", 10, 34] }),
    /* @__PURE__ */ jsxs("points", { children: [
      /* @__PURE__ */ jsx("bufferGeometry", { children: /* @__PURE__ */ jsx("bufferAttribute", { attach: "attributes-position", args: [dust, 3] }) }),
      /* @__PURE__ */ jsx("pointsMaterial", { color: "#8A63FF", size: 0.05, sizeAttenuation: true, transparent: true, opacity: 0.35, depthWrite: false })
    ] }),
    /* @__PURE__ */ jsxs("points", { children: [
      /* @__PURE__ */ jsx("bufferGeometry", { children: /* @__PURE__ */ jsx("bufferAttribute", { attach: "attributes-position", args: [reports, 3] }) }),
      /* @__PURE__ */ jsx("pointsMaterial", { color: "#B9A2FF", size: 0.2 })
    ] }),
    [3, 6, 9].map((r) => /* @__PURE__ */ jsxs("mesh", { rotation: [Math.PI / 2.6, 0, 0], children: [
      /* @__PURE__ */ jsx("ringGeometry", { args: [r - 0.01, r + 0.01, 96] }),
      /* @__PURE__ */ jsx("meshBasicMaterial", { color: "#B9A2FF", transparent: true, opacity: 0.12, side: DoubleSide })
    ] }, r))
  ] });
}
export {
  Constellation
};
