import { jsxs, jsx } from "react/jsx-runtime";
import * as React from "react";
import { useRef, useMemo } from "react";
import _extends from "@babel/runtime/helpers/esm/extends";
import * as ReactDOM from "react-dom/client";
import { j as useThree, m as useFrame, V as Vector3, t as DoubleSide, r as Vector2, a3 as PerspectiveCamera, a4 as OrthographicCamera, a2 as CatmullRomCurve3, a5 as TubeGeometry, B as BufferGeometry, a6 as LineDashedMaterial, a7 as Line, q as Float32BufferAttribute, n as Color, i as CLASS_COLORS, a8 as MeshPhysicalMaterial, X as sizeRadius, o as Matrix4, Q as Quaternion } from "./router-CxtrX1wR.js";
import { H as HOTSPOT_RULES } from "./SequenceSVG-qNlYzj3F.js";
const v1 = /* @__PURE__ */ new Vector3();
const v2 = /* @__PURE__ */ new Vector3();
const v3 = /* @__PURE__ */ new Vector3();
const v4 = /* @__PURE__ */ new Vector2();
function defaultCalculatePosition(el, camera, size) {
  const objectPos = v1.setFromMatrixPosition(el.matrixWorld);
  objectPos.project(camera);
  const widthHalf = size.width / 2;
  const heightHalf = size.height / 2;
  return [objectPos.x * widthHalf + widthHalf, -(objectPos.y * heightHalf) + heightHalf];
}
function isObjectBehindCamera(el, camera) {
  const objectPos = v1.setFromMatrixPosition(el.matrixWorld);
  const cameraPos = v2.setFromMatrixPosition(camera.matrixWorld);
  const deltaCamObj = objectPos.sub(cameraPos);
  const camDir = camera.getWorldDirection(v3);
  return deltaCamObj.angleTo(camDir) > Math.PI / 2;
}
function isObjectVisible(el, camera, raycaster, occlude) {
  const elPos = v1.setFromMatrixPosition(el.matrixWorld);
  const screenPos = elPos.clone();
  screenPos.project(camera);
  v4.set(screenPos.x, screenPos.y);
  raycaster.setFromCamera(v4, camera);
  const intersects = raycaster.intersectObjects(occlude, true);
  if (intersects.length) {
    const intersectionDistance = intersects[0].distance;
    const pointDistance = elPos.distanceTo(raycaster.ray.origin);
    return pointDistance < intersectionDistance;
  }
  return true;
}
function objectScale(el, camera) {
  if (camera instanceof OrthographicCamera) {
    return camera.zoom;
  } else if (camera instanceof PerspectiveCamera) {
    const objectPos = v1.setFromMatrixPosition(el.matrixWorld);
    const cameraPos = v2.setFromMatrixPosition(camera.matrixWorld);
    const vFOV = camera.fov * Math.PI / 180;
    const dist = objectPos.distanceTo(cameraPos);
    const scaleFOV = 2 * Math.tan(vFOV / 2) * dist;
    return 1 / scaleFOV;
  } else {
    return 1;
  }
}
function objectZIndex(el, camera, zIndexRange) {
  if (camera instanceof PerspectiveCamera || camera instanceof OrthographicCamera) {
    const objectPos = v1.setFromMatrixPosition(el.matrixWorld);
    const cameraPos = v2.setFromMatrixPosition(camera.matrixWorld);
    const dist = objectPos.distanceTo(cameraPos);
    const A = (zIndexRange[1] - zIndexRange[0]) / (camera.far - camera.near);
    const B = zIndexRange[1] - A * camera.far;
    return Math.round(A * dist + B);
  }
  return void 0;
}
const epsilon = (value) => Math.abs(value) < 1e-10 ? 0 : value;
function getCSSMatrix(matrix, multipliers, prepend = "") {
  let matrix3d = "matrix3d(";
  for (let i = 0; i !== 16; i++) {
    matrix3d += epsilon(multipliers[i] * matrix.elements[i]) + (i !== 15 ? "," : ")");
  }
  return prepend + matrix3d;
}
const getCameraCSSMatrix = /* @__PURE__ */ ((multipliers) => {
  return (matrix) => getCSSMatrix(matrix, multipliers);
})([1, -1, 1, 1, 1, -1, 1, 1, 1, -1, 1, 1, 1, -1, 1, 1]);
const getObjectCSSMatrix = /* @__PURE__ */ ((scaleMultipliers) => {
  return (matrix, factor) => getCSSMatrix(matrix, scaleMultipliers(factor), "translate(-50%,-50%)");
})((f) => [1 / f, 1 / f, 1 / f, 1, -1 / f, -1 / f, -1 / f, -1, 1 / f, 1 / f, 1 / f, 1, 1, 1, 1, 1]);
function isRefObject(ref) {
  return ref && typeof ref === "object" && "current" in ref;
}
const Html = /* @__PURE__ */ React.forwardRef(({
  children,
  eps = 1e-3,
  style,
  className,
  prepend,
  center,
  fullscreen,
  portal,
  distanceFactor,
  sprite = false,
  transform = false,
  occlude,
  onOcclude,
  castShadow,
  receiveShadow,
  material,
  geometry,
  zIndexRange = [16777271, 0],
  calculatePosition = defaultCalculatePosition,
  as = "div",
  wrapperClass,
  pointerEvents = "auto",
  ...props
}, ref) => {
  const {
    gl,
    camera,
    scene,
    size,
    raycaster,
    events,
    viewport
  } = useThree();
  const [el] = React.useState(() => document.createElement(as));
  const root = React.useRef(null);
  const group = React.useRef(null);
  const oldZoom = React.useRef(0);
  const oldPosition = React.useRef([0, 0]);
  const transformOuterRef = React.useRef(null);
  const transformInnerRef = React.useRef(null);
  const target = (portal == null ? void 0 : portal.current) || events.connected || gl.domElement.parentNode;
  const occlusionMeshRef = React.useRef(null);
  const isMeshSizeSet = React.useRef(false);
  const isRayCastOcclusion = React.useMemo(() => {
    return occlude && occlude !== "blending" || Array.isArray(occlude) && occlude.length && isRefObject(occlude[0]);
  }, [occlude]);
  React.useLayoutEffect(() => {
    const el2 = gl.domElement;
    if (occlude && occlude === "blending") {
      el2.style.zIndex = `${Math.floor(zIndexRange[0] / 2)}`;
      el2.style.position = "absolute";
      el2.style.pointerEvents = "none";
    } else {
      el2.style.zIndex = null;
      el2.style.position = null;
      el2.style.pointerEvents = null;
    }
  }, [occlude]);
  React.useLayoutEffect(() => {
    if (group.current) {
      const currentRoot = root.current = ReactDOM.createRoot(el);
      scene.updateMatrixWorld();
      if (transform) {
        el.style.cssText = `position:absolute;top:0;left:0;pointer-events:none;overflow:hidden;`;
      } else {
        const vec = calculatePosition(group.current, camera, size);
        el.style.cssText = `position:absolute;top:0;left:0;transform:translate3d(${vec[0]}px,${vec[1]}px,0);transform-origin:0 0;`;
      }
      if (target) {
        if (prepend) target.prepend(el);
        else target.appendChild(el);
      }
      return () => {
        if (target) target.removeChild(el);
        currentRoot.unmount();
      };
    }
  }, [target, transform]);
  React.useLayoutEffect(() => {
    if (wrapperClass) el.className = wrapperClass;
  }, [wrapperClass]);
  const styles = React.useMemo(() => {
    if (transform) {
      return {
        position: "absolute",
        top: 0,
        left: 0,
        width: size.width,
        height: size.height,
        transformStyle: "preserve-3d",
        pointerEvents: "none"
      };
    } else {
      return {
        position: "absolute",
        transform: center ? "translate3d(-50%,-50%,0)" : "none",
        ...fullscreen && {
          top: -size.height / 2,
          left: -size.width / 2,
          width: size.width,
          height: size.height
        },
        ...style
      };
    }
  }, [style, center, fullscreen, size, transform]);
  const transformInnerStyles = React.useMemo(() => ({
    position: "absolute",
    pointerEvents
  }), [pointerEvents]);
  React.useLayoutEffect(() => {
    isMeshSizeSet.current = false;
    if (transform) {
      var _root$current;
      (_root$current = root.current) == null || _root$current.render(/* @__PURE__ */ React.createElement("div", {
        ref: transformOuterRef,
        style: styles
      }, /* @__PURE__ */ React.createElement("div", {
        ref: transformInnerRef,
        style: transformInnerStyles
      }, /* @__PURE__ */ React.createElement("div", {
        ref,
        className,
        style,
        children
      }))));
    } else {
      var _root$current2;
      (_root$current2 = root.current) == null || _root$current2.render(/* @__PURE__ */ React.createElement("div", {
        ref,
        style: styles,
        className,
        children
      }));
    }
  });
  const visible = React.useRef(true);
  useFrame((gl2) => {
    if (group.current) {
      camera.updateMatrixWorld();
      group.current.updateWorldMatrix(true, false);
      const vec = transform ? oldPosition.current : calculatePosition(group.current, camera, size);
      if (transform || Math.abs(oldZoom.current - camera.zoom) > eps || Math.abs(oldPosition.current[0] - vec[0]) > eps || Math.abs(oldPosition.current[1] - vec[1]) > eps) {
        const isBehindCamera = isObjectBehindCamera(group.current, camera);
        let raytraceTarget = false;
        if (isRayCastOcclusion) {
          if (Array.isArray(occlude)) {
            raytraceTarget = occlude.map((item) => item.current);
          } else if (occlude !== "blending") {
            raytraceTarget = [scene];
          }
        }
        const previouslyVisible = visible.current;
        if (raytraceTarget) {
          const isvisible = isObjectVisible(group.current, camera, raycaster, raytraceTarget);
          visible.current = isvisible && !isBehindCamera;
        } else {
          visible.current = !isBehindCamera;
        }
        if (previouslyVisible !== visible.current) {
          if (onOcclude) onOcclude(!visible.current);
          else el.style.display = visible.current ? "block" : "none";
        }
        const halfRange = Math.floor(zIndexRange[0] / 2);
        const zRange = occlude ? isRayCastOcclusion ? [zIndexRange[0], halfRange] : [halfRange - 1, 0] : zIndexRange;
        el.style.zIndex = `${objectZIndex(group.current, camera, zRange)}`;
        if (transform) {
          const [widthHalf, heightHalf] = [size.width / 2, size.height / 2];
          const fov = camera.projectionMatrix.elements[5] * heightHalf;
          const {
            isOrthographicCamera,
            top,
            left,
            bottom,
            right
          } = camera;
          const cameraMatrix = getCameraCSSMatrix(camera.matrixWorldInverse);
          const cameraTransform = isOrthographicCamera ? `scale(${fov})translate(${epsilon(-(right + left) / 2)}px,${epsilon((top + bottom) / 2)}px)` : `translateZ(${fov}px)`;
          let matrix = group.current.matrixWorld;
          if (sprite) {
            matrix = camera.matrixWorldInverse.clone().transpose().copyPosition(matrix).scale(group.current.scale);
            matrix.elements[3] = matrix.elements[7] = matrix.elements[11] = 0;
            matrix.elements[15] = 1;
          }
          el.style.width = size.width + "px";
          el.style.height = size.height + "px";
          el.style.perspective = isOrthographicCamera ? "" : `${fov}px`;
          if (transformOuterRef.current && transformInnerRef.current) {
            transformOuterRef.current.style.transform = `${cameraTransform}${cameraMatrix}translate(${widthHalf}px,${heightHalf}px)`;
            transformInnerRef.current.style.transform = getObjectCSSMatrix(matrix, 1 / ((distanceFactor || 10) / 400));
          }
        } else {
          const scale = distanceFactor === void 0 ? 1 : objectScale(group.current, camera) * distanceFactor;
          el.style.transform = `translate3d(${vec[0]}px,${vec[1]}px,0) scale(${scale})`;
        }
        oldPosition.current = vec;
        oldZoom.current = camera.zoom;
      }
    }
    if (!isRayCastOcclusion && occlusionMeshRef.current && !isMeshSizeSet.current) {
      if (transform) {
        if (transformOuterRef.current) {
          const el2 = transformOuterRef.current.children[0];
          if (el2 != null && el2.clientWidth && el2 != null && el2.clientHeight) {
            const {
              isOrthographicCamera
            } = camera;
            if (isOrthographicCamera || geometry) {
              if (props.scale) {
                if (!Array.isArray(props.scale)) {
                  occlusionMeshRef.current.scale.setScalar(1 / props.scale);
                } else if (props.scale instanceof Vector3) {
                  occlusionMeshRef.current.scale.copy(props.scale.clone().divideScalar(1));
                } else {
                  occlusionMeshRef.current.scale.set(1 / props.scale[0], 1 / props.scale[1], 1 / props.scale[2]);
                }
              }
            } else {
              const ratio = (distanceFactor || 10) / 400;
              const w = el2.clientWidth * ratio;
              const h = el2.clientHeight * ratio;
              occlusionMeshRef.current.scale.set(w, h, 1);
            }
            isMeshSizeSet.current = true;
          }
        }
      } else {
        const ele = el.children[0];
        if (ele != null && ele.clientWidth && ele != null && ele.clientHeight) {
          const ratio = 1 / viewport.factor;
          const w = ele.clientWidth * ratio;
          const h = ele.clientHeight * ratio;
          occlusionMeshRef.current.scale.set(w, h, 1);
          isMeshSizeSet.current = true;
        }
        occlusionMeshRef.current.lookAt(gl2.camera.position);
      }
    }
  });
  const shaders = React.useMemo(() => ({
    vertexShader: !transform ? (
      /* glsl */
      `
          /*
            This shader is from the THREE's SpriteMaterial.
            We need to turn the backing plane into a Sprite
            (make it always face the camera) if "transfrom"
            is false.
          */
          #include <common>

          void main() {
            vec2 center = vec2(0., 1.);
            float rotation = 0.0;

            // This is somewhat arbitrary, but it seems to work well
            // Need to figure out how to derive this dynamically if it even matters
            float size = 0.03;

            vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
            vec2 scale;
            scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
            scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );

            bool isPerspective = isPerspectiveMatrix( projectionMatrix );
            if ( isPerspective ) scale *= - mvPosition.z;

            vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale * size;
            vec2 rotatedPosition;
            rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
            rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
            mvPosition.xy += rotatedPosition;

            gl_Position = projectionMatrix * mvPosition;
          }
      `
    ) : void 0,
    fragmentShader: (
      /* glsl */
      `
        void main() {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        }
      `
    )
  }), [transform]);
  return /* @__PURE__ */ React.createElement("group", _extends({}, props, {
    ref: group
  }), occlude && !isRayCastOcclusion && /* @__PURE__ */ React.createElement("mesh", {
    castShadow,
    receiveShadow,
    ref: occlusionMeshRef
  }, geometry || /* @__PURE__ */ React.createElement("planeGeometry", null), material || /* @__PURE__ */ React.createElement("shaderMaterial", {
    side: DoubleSide,
    vertexShader: shaders.vertexShader,
    fragmentShader: shaders.fragmentShader
  })));
});
const STAGGER = 3;
const TUBE_RADIAL = 8;
const V = new Vector3();
const S = new Vector3();
const M = new Matrix4();
const Q = new Quaternion();
function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
function ChainRenderer({
  geometry: g,
  progress = 1,
  tint = "#5FE3FF",
  accent = "#8A63FF",
  lod = 0,
  intensity = 1,
  rotate = 0.12,
  fitMode = "viewport",
  fit = 0.8,
  tempo = 1,
  labels = false,
  reducedEffects = false,
  tilt = [0.25, 0.35, 0],
  markers: showMarkers = true
}) {
  const group = useRef(null);
  const scaler = useRef(null);
  const inst = useRef(null);
  const tube = useRef(null);
  const dash = useRef(null);
  const markers = useRef(null);
  const decor = useRef(null);
  const n = g.length;
  const fixedScale = fit / g.bounds.radius;
  const centerOffsetRotated = useMemo(
    () => new Vector3(-g.bounds.center[2], -g.bounds.center[1], g.bounds.center[0]),
    [g]
  );
  const curve = useMemo(() => {
    const pts = [];
    for (let i = 0; i < n; i++) pts.push(new Vector3(g.ca[i * 3], g.ca[i * 3 + 1], g.ca[i * 3 + 2]));
    return new CatmullRomCurve3(pts, false, "centripetal", 0.5);
  }, [g, n]);
  const tubularSegments = Math.max(8, n * (reducedEffects ? 4 : 10));
  const tubeGeo = useMemo(() => {
    const geo = new TubeGeometry(curve, tubularSegments, g.placeholder ? 0.35 : 0.5, TUBE_RADIAL, false);
    geo.setDrawRange(0, 0);
    return geo;
  }, [curve, tubularSegments, g.placeholder]);
  const dashLine = useMemo(() => {
    if (!g.placeholder && lod !== 0) return null;
    const pts = curve.getPoints(n * 6);
    const geo = new BufferGeometry().setFromPoints(pts);
    const mat = new LineDashedMaterial({ color: tint, dashSize: 1.2, gapSize: 1.4, transparent: true, opacity: 0.4 });
    const line = new Line(geo, mat);
    line.computeLineDistances();
    return line;
  }, [g.placeholder, curve, n, tint, lod]);
  const hbond = useRef(null);
  const hbondGeo = useMemo(() => {
    if (lod !== 0 || g.placeholder || n < 5 || g.bridges.length) return null;
    const pos = [];
    for (let i = 4; i < n; i++) {
      if (g.brokenHBonds.includes(i)) continue;
      pos.push(g.ca[i * 3], g.ca[i * 3 + 1], g.ca[i * 3 + 2], g.ca[(i - 4) * 3], g.ca[(i - 4) * 3 + 1], g.ca[(i - 4) * 3 + 2]);
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new Float32BufferAttribute(pos, 3));
    return geo;
  }, [g, lod, n]);
  const colors = useMemo(() => {
    const arr = new Float32Array(n * 3);
    const c = new Color();
    for (let i = 0; i < n; i++) {
      c.set(g.placeholder ? tint : CLASS_COLORS[g.residues[i].cls]);
      arr[i * 3] = c.r;
      arr[i * 3 + 1] = c.g;
      arr[i * 3 + 2] = c.b;
    }
    return arr;
  }, [g, n, tint]);
  const tubeMat = useMemo(
    () => new MeshPhysicalMaterial({
      color: new Color(tint).multiplyScalar(0.42),
      emissive: new Color(tint),
      emissiveIntensity: 0.22 * intensity,
      roughness: 0.32,
      metalness: 0.35,
      clearcoat: 0.6,
      clearcoatRoughness: 0.35,
      transparent: g.placeholder,
      opacity: g.placeholder ? 0.25 : 1
    }),
    [tint, intensity, g.placeholder]
  );
  const sphereMat = useMemo(
    () => new MeshPhysicalMaterial({
      roughness: 0.38,
      metalness: 0.08,
      clearcoat: 0.8,
      clearcoatRoughness: 0.25,
      emissive: new Color("#ffffff"),
      emissiveIntensity: 0.06 * intensity,
      vertexColors: false
    }),
    [intensity]
  );
  const bridgeGeos = useMemo(
    () => g.bridges.map((b) => {
      const c = new CatmullRomCurve3(b.points.map((p) => new Vector3(...p)));
      return new TubeGeometry(c, 12, 0.3, 6, false);
    }),
    [g]
  );
  const tetherGeos = useMemo(
    () => g.tethers.map((t) => {
      const c = new CatmullRomCurve3(t.points.map((p) => new Vector3(...p)));
      return new TubeGeometry(c, 24, 0.22, 6, false);
    }),
    [g]
  );
  const tRef = useRef(0);
  const scatterK = lod === 2 ? 0.3 : lod === 1 ? 0.5 : 0.55;
  const [cx, cy, cz] = g.bounds.center;
  useFrame((state, dt) => {
    const p = typeof progress === "number" ? progress : progress.current ?? 1;
    tRef.current += dt * tempo;
    if (group.current && rotate) group.current.rotation.x += dt * rotate;
    if (scaler.current) {
      if (fitMode === "viewport") {
        const vp = state.viewport.getCurrentViewport(state.camera);
        const ex = g.bounds.extent[2];
        const ey = Math.max(g.bounds.extent[0], g.bounds.extent[1]);
        const s = Math.min(vp.width * fit / ex, vp.height * fit / ey, vp.height * fit * 0.9 / (ex * 0.5));
        scaler.current.scale.setScalar(s);
      } else scaler.current.scale.setScalar(fixedScale);
    }
    if (decor.current) {
      const k = Math.max(0, Math.min(1, (p - 0.8) / 0.2));
      decor.current.visible = k > 0;
      decor.current.scale.setScalar(1e-3 + k);
    }
    if (markers.current) {
      const pulse = 0.85 + 0.15 * Math.sin(tRef.current * 3);
      markers.current.scale.setScalar(pulse);
      markers.current.visible = p > 0.97;
    }
    if (hbond.current) {
      const m = hbond.current.material;
      m.opacity = 0.2 * Math.max(0, (p - 0.92) / 0.08);
      hbond.current.visible = p > 0.92;
    }
    if (tube.current) {
      const assembled = Math.floor(Math.max(0, p * (n + STAGGER) - STAGGER));
      const frac = n > 1 ? Math.min(1, assembled / (n - 1)) : p;
      const segs = Math.floor(frac * tubularSegments);
      tubeGeo.setDrawRange(0, segs * TUBE_RADIAL * 6);
    }
    if (dash.current && dash.current.material instanceof LineDashedMaterial) {
      dash.current.material.opacity = g.placeholder ? 0.35 + 0.15 * Math.sin(tRef.current * 1.4) : 0.22 * (1 - p);
      dash.current.visible = g.placeholder || p < 0.98;
    }
    if (inst.current) {
      for (let i = 0; i < n; i++) {
        const raw = p * (n + STAGGER) - i;
        const t = easeOutCubic(Math.max(0, Math.min(1, raw / STAGGER)));
        const r = g.residues[i];
        const sx = cx + (g.scatter[i * 3] - cx) * scatterK;
        const sy = cy + (g.scatter[i * 3 + 1] - cy) * scatterK;
        const sz = cz + (g.scatter[i * 3 + 2] - cz) * scatterK;
        const tx = g.ca[i * 3], ty = g.ca[i * 3 + 1], tz = g.ca[i * 3 + 2];
        const drift = (1 - t) * 1.5;
        V.set(
          sx + Math.sin(tRef.current * 0.7 + i) * drift + (tx - sx) * t,
          sy + Math.cos(tRef.current * 0.5 + i * 1.3) * drift + (ty - sy) * t,
          sz + Math.sin(tRef.current * 0.6 + i * 0.7) * drift + (tz - sz) * t
        );
        const base = lod === 0 ? sizeRadius(r.size) * 0.72 : lod === 1 ? 0.7 : 0.55;
        const s = g.placeholder ? 0.45 : base * (0.6 + 0.4 * t);
        S.setScalar(s);
        M.compose(V, Q, S);
        inst.current.setMatrixAt(i, M);
      }
      inst.current.instanceMatrix.needsUpdate = true;
    }
  });
  return /* @__PURE__ */ jsxs("group", { children: [
    /* @__PURE__ */ jsx("ambientLight", { intensity: 0.28, color: "#9FD8E8" }),
    /* @__PURE__ */ jsx("directionalLight", { position: [4, 6, 8], intensity: 1.6, color: "#F2EEE6" }),
    /* @__PURE__ */ jsx("directionalLight", { position: [-6, -3, -4], intensity: 0.9, color: tint }),
    /* @__PURE__ */ jsx("pointLight", { position: [-5, -2, 4], intensity: 2.4 * intensity, color: accent, distance: 30, decay: 1.5 }),
    /* @__PURE__ */ jsx("group", { ref: scaler, rotation: tilt, children: /* @__PURE__ */ jsx("group", { ref: group, children: /* @__PURE__ */ jsxs("group", { rotation: [0, Math.PI / 2, 0], position: centerOffsetRotated, children: [
      /* @__PURE__ */ jsx("mesh", { ref: tube, geometry: tubeGeo, material: tubeMat, frustumCulled: false }),
      dashLine && /* @__PURE__ */ jsx("primitive", { ref: dash, object: dashLine }),
      hbondGeo && /* @__PURE__ */ jsx("lineSegments", { ref: hbond, geometry: hbondGeo, visible: false, children: /* @__PURE__ */ jsx("lineBasicMaterial", { color: tint, transparent: true, opacity: 0.18 }) }),
      /* @__PURE__ */ jsxs(
        "instancedMesh",
        {
          ref: inst,
          args: [void 0, void 0, n],
          frustumCulled: false,
          onUpdate: (m) => {
            if (!m.instanceColor) {
              const c = new Color();
              for (let i = 0; i < n; i++) m.setColorAt(i, c.setRGB(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]));
              m.instanceColor.needsUpdate = true;
            }
          },
          children: [
            /* @__PURE__ */ jsx("sphereGeometry", { args: [1, lod === 0 ? 20 : 10, lod === 0 ? 14 : 8] }),
            /* @__PURE__ */ jsx("primitive", { object: sphereMat, attach: "material" })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("group", { ref: decor, visible: false, children: [
        bridgeGeos.map((geo, i) => /* @__PURE__ */ jsx("mesh", { geometry: geo, children: /* @__PURE__ */ jsx("meshStandardMaterial", { color: accent, emissive: accent, emissiveIntensity: 0.9 * intensity, roughness: 0.3 }) }, `br${i}`)),
        tetherGeos.map((geo, i) => /* @__PURE__ */ jsx("mesh", { geometry: geo, children: /* @__PURE__ */ jsx("meshStandardMaterial", { color: "#B9B4AA", emissive: "#B9B4AA", emissiveIntensity: 0.25, roughness: 0.6 }) }, `te${i}`)),
        g.metal && lod <= 1 && /* @__PURE__ */ jsxs("group", { children: [
          /* @__PURE__ */ jsxs("mesh", { position: g.metal.position, children: [
            /* @__PURE__ */ jsx("sphereGeometry", { args: [1.05, 24, 16] }),
            /* @__PURE__ */ jsx("meshStandardMaterial", { color: "#D07A2E", emissive: "#E0863A", emissiveIntensity: 1.4 * intensity, metalness: 0.9, roughness: 0.25 })
          ] }),
          g.metal.residues.map((ri) => {
            const a = new Vector3(...g.metal.position);
            const b = new Vector3(g.ca[ri * 3], g.ca[ri * 3 + 1], g.ca[ri * 3 + 2]);
            const mid = a.clone().add(b).multiplyScalar(0.5);
            const dir = b.clone().sub(a);
            const len = dir.length();
            const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.normalize());
            return /* @__PURE__ */ jsxs("mesh", { position: mid, quaternion: q, children: [
              /* @__PURE__ */ jsx("cylinderGeometry", { args: [0.12, 0.12, len, 6] }),
              /* @__PURE__ */ jsx("meshStandardMaterial", { color: "#E0863A", emissive: "#E0863A", emissiveIntensity: 2 * intensity, transparent: true, opacity: 0.9 })
            ] }, ri);
          })
        ] }),
        lod <= 1 && !g.placeholder && g.residues.map((r) => {
          const pos = [g.ca[r.index * 3], g.ca[r.index * 3 + 1], g.ca[r.index * 3 + 2]];
          const items = [];
          if (r.chirality === "D")
            items.push(
              /* @__PURE__ */ jsxs("mesh", { position: pos, rotation: [Math.PI / 2, 0, 0], children: [
                /* @__PURE__ */ jsx("torusGeometry", { args: [sizeRadius(r.size) + 0.55, 0.12, 8, 32] }),
                /* @__PURE__ */ jsx("meshStandardMaterial", { color: "#5FD3E6", emissive: "#5FD3E6", emissiveIntensity: 1.2 })
              ] }, "d")
            );
          if (r.mods.includes("Aib"))
            items.push(
              /* @__PURE__ */ jsxs("group", { position: pos, children: [
                /* @__PURE__ */ jsxs("mesh", { position: [1.2, 0.9, 0], children: [
                  /* @__PURE__ */ jsx("sphereGeometry", { args: [0.42, 10, 8] }),
                  /* @__PURE__ */ jsx("meshStandardMaterial", { color: "#9C9691" })
                ] }),
                /* @__PURE__ */ jsxs("mesh", { position: [-1.2, 0.9, 0], children: [
                  /* @__PURE__ */ jsx("sphereGeometry", { args: [0.42, 10, 8] }),
                  /* @__PURE__ */ jsx("meshStandardMaterial", { color: "#9C9691" })
                ] })
              ] }, "aib")
            );
          if (r.mods.includes("acetyl") || r.mods.includes("amide"))
            items.push(
              /* @__PURE__ */ jsxs("mesh", { position: pos, rotation: [0, 0, r.mods.includes("acetyl") ? Math.PI : 0], children: [
                /* @__PURE__ */ jsx("coneGeometry", { args: [0.7, 1.4, 12] }),
                /* @__PURE__ */ jsx("meshStandardMaterial", { color: "#DCE8EE", emissive: "#DCE8EE", emissiveIntensity: 0.3, transparent: true, opacity: 0.85 })
              ] }, "cap")
            );
          return items.length ? /* @__PURE__ */ jsx("group", { children: items }, r.index) : null;
        })
      ] }),
      labels && lod === 0 && !g.placeholder && /* @__PURE__ */ jsx("group", { children: g.hotspots.map((h, i) => /* @__PURE__ */ jsx(Html, { position: h.position, center: true, distanceFactor: 26, zIndexRange: [5, 0], style: { pointerEvents: "none" }, children: /* @__PURE__ */ jsx("div", { style: { fontFamily: "JetBrains Mono Variable, monospace", fontSize: 11, whiteSpace: "nowrap", color: HOTSPOT_RULES[h.kind].color, background: "rgba(10,11,14,0.72)", border: `1px solid ${HOTSPOT_RULES[h.kind].color}55`, borderRadius: 6, padding: "3px 7px", transform: "translateY(-26px)" }, children: h.label }) }, `l${i}`)) }),
      lod <= 1 && !reducedEffects && showMarkers && /* @__PURE__ */ jsx("group", { ref: markers, children: g.hotspots.map((h, i) => {
        const rule = HOTSPOT_RULES[h.kind];
        return /* @__PURE__ */ jsxs("mesh", { position: h.position, children: [
          /* @__PURE__ */ jsx("torusGeometry", { args: [2.4, 0.07, 6, 40] }),
          /* @__PURE__ */ jsx("meshBasicMaterial", { color: rule.color, transparent: true, opacity: 0.55 })
        ] }, i);
      }) })
    ] }) }) })
  ] });
}
export {
  ChainRenderer as C
};
